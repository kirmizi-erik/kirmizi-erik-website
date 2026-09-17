-- Chatbot RAG + yazışma kayıtları (Novawood chatbot deseni, Supabase uyarlaması)
-- kb_chunks: hibrit arama (pgvector semantik + tsvector BM25)
-- chat_conversations / chat_messages: ziyaretçi yazışmaları (KVKK: IP hash'li)
-- admin_knowledge: panelden girilen Soru/Cevap eğitim çiftleri (authority=1)

create extension if not exists vector with schema extensions;

-- Türkçe-güvenli fold: her iki taraf (döküman + sorgu) aynı normalize edilir,
-- böylece DB locale'inden bağımsız prefix eşleşmesi çalışır.
create or replace function public.tr_fold(t text)
returns text
language sql
immutable
as $$
  -- Büyük Türkçe harfler translate ile açıkça eşlenir; lower() bazı DB
  -- locale'lerinde (C) non-ASCII'yi küçültmediği için buna güvenilmez.
  select translate(
    lower(translate(t, 'İIÇĞÖŞÜ', 'iıçğöşü')),
    'çğıöşü',
    'cgiosu'
  );
$$;

-- ---------------------------------------------------------------------------
-- Bilgi bankası chunk'ları
-- ---------------------------------------------------------------------------
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('site', 'admin')),
  admin_entry_id uuid,
  title text not null,
  content text not null,
  embed_text text,
  source_url text,
  lang text not null default 'tr',
  authority smallint not null default 5,
  embedding extensions.vector(1536),
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      public.tr_fold(coalesce(title, '') || ' ' || coalesce(embed_text, '') || ' ' || content)
    )
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists kb_chunks_search_idx on public.kb_chunks using gin (search_vector);
create index if not exists kb_chunks_embedding_idx on public.kb_chunks
  using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists kb_chunks_admin_entry_idx on public.kb_chunks (admin_entry_id);

-- ---------------------------------------------------------------------------
-- Yazışmalar
-- ---------------------------------------------------------------------------
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  locale text not null default 'tr',
  ip_hash text,
  page_url text,
  message_count integer not null default 0,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists chat_conversations_last_msg_idx
  on public.chat_conversations (last_message_at desc);

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  latency_ms integer,
  unanswered boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conv_idx
  on public.chat_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Eğitim: Soru/Cevap çiftleri (panelden yönetilir)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_knowledge (
  id uuid primary key default gen_random_uuid(),
  question_tr text not null,
  answer_tr text not null,
  question_en text,
  answer_en text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: tüm tablolar sadece service role (policy yok = anon/authenticated erişemez)
-- ---------------------------------------------------------------------------
alter table public.kb_chunks enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.admin_knowledge enable row level security;

-- ---------------------------------------------------------------------------
-- RPC: semantik arama
-- ---------------------------------------------------------------------------
create or replace function public.kb_search_semantic(
  query_embedding extensions.vector(1536),
  match_count int default 20
)
returns table (
  id uuid,
  title text,
  content text,
  source_url text,
  authority smallint,
  score double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select c.id, c.title, c.content, c.source_url, c.authority,
         1 - (c.embedding <=> query_embedding) as score
  from kb_chunks c
  where c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- RPC: BM25 (tsvector) arama — query_ts: tr_fold'lanmış 'tok:* | tok:*' ifadesi
-- ---------------------------------------------------------------------------
create or replace function public.kb_search_bm25(
  query_ts text,
  match_count int default 20
)
returns table (
  id uuid,
  title text,
  content text,
  source_url text,
  authority smallint,
  score real
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.title, c.content, c.source_url, c.authority,
         ts_rank(c.search_vector, to_tsquery('simple', query_ts)) as score
  from kb_chunks c
  where c.search_vector @@ to_tsquery('simple', query_ts)
  order by score desc
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- RPC: tek turda yazışma kaydı (upsert conversation + 2 mesaj + sayaç)
-- ---------------------------------------------------------------------------
create or replace function public.record_chat_turn(
  p_session_id text,
  p_locale text,
  p_ip_hash text,
  p_page_url text,
  p_question text,
  p_answer text,
  p_latency_ms int,
  p_unanswered boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv_id uuid;
begin
  insert into chat_conversations (session_id, locale, ip_hash, page_url)
  values (p_session_id, coalesce(p_locale, 'tr'), p_ip_hash, p_page_url)
  on conflict (session_id) do update
    set last_message_at = now(),
        page_url = coalesce(excluded.page_url, chat_conversations.page_url)
  returning id into v_conv_id;

  insert into chat_messages (conversation_id, role, content)
  values (v_conv_id, 'user', p_question);

  insert into chat_messages (conversation_id, role, content, latency_ms, unanswered)
  values (v_conv_id, 'assistant', p_answer, p_latency_ms, p_unanswered);

  update chat_conversations
  set message_count = message_count + 2,
      last_message_at = now()
  where id = v_conv_id;

  return v_conv_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: panel için yazışma listesi (ilk soru + cevapsız sayısı ile)
-- ---------------------------------------------------------------------------
create or replace function public.chat_admin_conversations(
  p_q text default null,
  p_only_unanswered boolean default false,
  p_limit int default 100
)
returns table (
  id uuid,
  session_id text,
  locale text,
  page_url text,
  message_count integer,
  started_at timestamptz,
  last_message_at timestamptz,
  first_question text,
  unanswered_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id, c.session_id, c.locale, c.page_url, c.message_count,
    c.started_at, c.last_message_at,
    (
      select m.content from chat_messages m
      where m.conversation_id = c.id and m.role = 'user'
      order by m.created_at asc limit 1
    ) as first_question,
    (
      select count(*) from chat_messages m
      where m.conversation_id = c.id and m.unanswered
    ) as unanswered_count
  from chat_conversations c
  where
    (
      p_q is null or p_q = '' or exists (
        select 1 from chat_messages m
        where m.conversation_id = c.id and m.content ilike '%' || p_q || '%'
      )
    )
    and (
      not p_only_unanswered or exists (
        select 1 from chat_messages m
        where m.conversation_id = c.id and m.unanswered
      )
    )
  order by c.last_message_at desc
  limit p_limit;
$$;

-- RPC'ler sadece service role: anon/authenticated PostgREST üzerinden çağıramasın
revoke execute on function public.kb_search_semantic(extensions.vector, int) from anon, authenticated;
revoke execute on function public.kb_search_bm25(text, int) from anon, authenticated;
revoke execute on function public.record_chat_turn(text, text, text, text, text, text, int, boolean) from anon, authenticated;
revoke execute on function public.chat_admin_conversations(text, boolean, int) from anon, authenticated;
