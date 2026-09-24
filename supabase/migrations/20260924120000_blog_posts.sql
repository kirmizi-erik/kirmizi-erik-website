-- Blog: admin panelinden yönetilen SEO yazıları (markdown gövde)

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  baslik text not null,
  seo_baslik text,                                   -- <title>; boşsa baslik
  ozet text,                                         -- meta description + liste kartı
  icerik text not null default '',                   -- markdown
  kapak_url text,
  kategori text[] not null default array[]::text[],  -- hizmet anahtarları: video, web, ai …
  yazar text not null default 'Kırmızı Erik',
  durum text not null default 'taslak' check (durum in ('taslak','yayinda','arsiv')),
  yayin_tarihi timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_durum_yayin_idx
  on public.blog_posts (durum, yayin_tarihi desc nulls last);

create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();

alter table public.blog_posts enable row level security;

create policy "Public read published blog_posts"
  on public.blog_posts for select
  to anon, authenticated
  using (durum = 'yayinda');

create policy "Editor read all blog_posts"
  on public.blog_posts for select
  to authenticated
  using (public.current_user_role() in ('owner','editor'));

create policy "Editor write blog_posts"
  on public.blog_posts for all
  to authenticated
  using (public.current_user_role() in ('owner','editor'))
  with check (public.current_user_role() in ('owner','editor'));
