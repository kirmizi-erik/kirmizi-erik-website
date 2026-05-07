-- Add hero (anasayfa) fields to site_settings — admin panelden düzenlenebilsin

alter table public.site_settings
  add column if not exists hero_title text,
  add column if not exists hero_subtitle text,
  add column if not exists hero_video_url text;

-- Default değerleri seed (yoksa)
update public.site_settings
set
  hero_title = coalesce(hero_title, E'Bir fikir,\ndokuz hizmet,\nsıfır sınır.'),
  hero_subtitle = coalesce(
    hero_subtitle,
    'Video, fotoğraf, dijital pazarlama, sosyal medya, yazılım, AI, grafik ve 3D — markanı bir nokta gibi sınırlandıran şeyleri yıkıyoruz.'
  )
where id = 1;
