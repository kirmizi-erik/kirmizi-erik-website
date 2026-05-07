-- Kırmızı Erik Web Sitesi — Init Schema
-- Drop CRM-era tables (musteriler/projeler/faturalar/leadler/aktiviteler)
-- Create website tables: case_studies, leads, site_settings
-- Keep profiles (auth.users-bound) but adjust roles

-- =====================================================
-- TEMİZLİK — eski CRM şeması
-- =====================================================

drop table if exists public.aktiviteler cascade;
drop table if exists public.faturalar cascade;
drop table if exists public.projeler cascade;
drop table if exists public.musteriler cascade;
drop table if exists public.leadler cascade;

-- profiles: yeni role enum'una geçiş ('owner','editor')
-- Önce check constraint'i kaldır, role değerlerini taşı, yeni constraint ekle
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'editor' where role = 'staff';
alter table public.profiles add constraint profiles_role_check check (role in ('owner','editor'));

-- =====================================================
-- YENİ TABLOLAR — website
-- =====================================================

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  baslik text not null,
  ozet text,
  musteri_adi text,
  sektor text,
  kategori text[] not null default array[]::text[], -- ['video','grafik','ai-kurulumlari']
  kapak_url text,
  kapak_video_url text,                              -- hover preview için (mp4, ses yok loop)
  problem text,                                      -- markdown
  cozum text,                                        -- markdown
  sonuc text,                                        -- markdown
  metrikler jsonb not null default '[]'::jsonb,      -- [{label, value}, ...]
  ekip_krediler text[] not null default array[]::text[], -- ['Yönetmen: X', 'Editör: Y']
  galeri_urls text[] not null default array[]::text[],
  durum text not null default 'taslak' check (durum in ('taslak','yayinda','arsiv')),
  one_cikan boolean not null default false,          -- anasayfa "öne çıkan" alanında göster
  yayin_tarihi timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index case_studies_durum_idx on public.case_studies(durum);
create index case_studies_one_cikan_idx on public.case_studies(one_cikan) where one_cikan = true;
create index case_studies_yayin_tarihi_idx on public.case_studies(yayin_tarihi desc nulls last);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  ad_soyad text not null,
  eposta text not null,
  telefon text,
  sirket text,
  hizmet_kategori text[] not null default array[]::text[], -- ['video','ai-kurulumlari']
  butce text,                                              -- '10k-50k', '50k-200k', '200k+'
  brief text,                                              -- detaylı yazı
  ai_skor numeric,                                         -- AI Brief Asistanı puan (0-100)
  ai_ozet text,                                            -- AI tarafından üretilen kısa özet
  durum text not null default 'yeni' check (durum in ('yeni','iletisim','teklif','kazandi','kaybetti')),
  notlar text,                                             -- ekibin not düştüğü alan
  kaynak text,                                             -- '/iletisim', '/hizmetler/ai-kurulumlari'
  user_agent text,
  created_at timestamptz not null default now()
);
create index leads_durum_idx on public.leads(durum);
create index leads_created_at_idx on public.leads(created_at desc);

-- site_settings: tek satırlı tablo (singleton)
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  meta_title text,
  meta_description text,
  meta_og_image_url text,
  contact_email text,
  contact_phone text,
  contact_address text,
  social jsonb not null default '{}'::jsonb,                -- {instagram, linkedin, behance, ...}
  footer_links jsonb not null default '[]'::jsonb,          -- [{label, href}]
  kvkk_text text,
  cookie_text text,
  updated_at timestamptz not null default now()
);

-- Singleton row
insert into public.site_settings (id, meta_title, meta_description, contact_email)
values (1, 'Kırmızı Erik — Reklam Ajansı', 'Video, fotoğraf, dijital, sosyal medya, web/uygulama, AI, grafik, 3D — dokuz disiplin tek çatı altında.', 'kirmizierikmm@gmail.com')
on conflict (id) do nothing;

-- =====================================================
-- TRIGGER: updated_at otomatik
-- =====================================================

create trigger case_studies_touch_updated_at
  before update on public.case_studies
  for each row execute function public.touch_updated_at();

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- =====================================================
-- RLS
-- =====================================================

alter table public.case_studies enable row level security;
alter table public.leads enable row level security;
alter table public.site_settings enable row level security;

-- case_studies: yayinda olanlar herkese açık (anonim site visitor); editor/owner her şey
create policy "Public read published case_studies"
  on public.case_studies for select
  to anon, authenticated
  using (durum = 'yayinda');

create policy "Editor read all case_studies"
  on public.case_studies for select
  to authenticated
  using (public.current_user_role() in ('owner','editor'));

create policy "Editor write case_studies"
  on public.case_studies for all
  to authenticated
  using (public.current_user_role() in ('owner','editor'))
  with check (public.current_user_role() in ('owner','editor'));

-- leads: anon insert (form submit); editor read/update
create policy "Anon insert leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Editor read leads"
  on public.leads for select
  to authenticated
  using (public.current_user_role() in ('owner','editor'));

create policy "Editor update leads"
  on public.leads for update
  to authenticated
  using (public.current_user_role() in ('owner','editor'))
  with check (public.current_user_role() in ('owner','editor'));

create policy "Editor delete leads"
  on public.leads for delete
  to authenticated
  using (public.current_user_role() in ('owner','editor'));

-- site_settings: public read (footer, meta, vb. site içeriği için); editor/owner update
create policy "Public read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Editor update site_settings"
  on public.site_settings for update
  to authenticated
  using (public.current_user_role() in ('owner','editor'))
  with check (public.current_user_role() in ('owner','editor'));

-- =====================================================
-- STORAGE BUCKET — case_studies için (uploads için)
-- =====================================================

insert into storage.buckets (id, name, public)
values ('case-media', 'case-media', true)
on conflict (id) do nothing;

-- Public read (yayında olan dosyalar için — bucket public)
-- Authenticated upload (editor/owner)
create policy "Editor upload case-media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'case-media'
    and public.current_user_role() in ('owner','editor')
  );

create policy "Editor delete case-media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'case-media'
    and public.current_user_role() in ('owner','editor')
  );

create policy "Editor update case-media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'case-media'
    and public.current_user_role() in ('owner','editor')
  );
