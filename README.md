# Next.js + Supabase Admin Boilerplate

Kırmızı Erik'in standart admin panel / web uygulaması starter'ı. Klonla, env'leri doldur, çalıştır.

## Stack

- **Next.js 16** (App Router) + TypeScript strict
- **React 19**
- **Tailwind v4** + **shadcn/ui** (radix-nova style, neutral)
- **Supabase** (Auth + Postgres + Storage + RLS)
- **react-hook-form** + **zod**
- **@tanstack/react-query**
- **sonner** (toast)
- **Prettier** + **ESLint** + **Husky** + **lint-staged**

## Hızlı Başlangıç

```bash
pnpm install
cp .env.example .env.local
# Supabase URL + anon key + service role key'i doldur
pnpm dev
```

http://localhost:3000 → `/` otomatik `/login`'e redirect olur.

## Komutlar

| Komut | İş |
|-------|-----|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Production sunucu |
| `pnpm typecheck` | TypeScript kontrol |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier yaz |
| `pnpm format:check` | Prettier kontrol |
| `pnpm db:types` | Supabase'den type üret |
| `pnpm db:diff` | Migration diff |

## Klasör

```
src/
├── app/
│   ├── auth/callback/route.ts   (magic link callback)
│   ├── login/                    (login page + actions)
│   ├── dashboard/                (auth-protected, sidebar+topbar layout)
│   ├── globals.css               (Tailwind v4 + shadcn variables)
│   ├── layout.tsx                (root, Toaster, font)
│   └── page.tsx                  (auth durumuna göre redirect)
├── components/
│   ├── ui/                       (shadcn — auto-generated)
│   └── shared/                   (sidebar, topbar)
├── lib/
│   ├── supabase/                 (client, server, middleware)
│   ├── utils.ts                  (cn helper)
│   └── validations/              (zod schemas)
├── middleware.ts                 (auth refresh + protected routes)
└── types/database.ts             (Supabase generated)
```

## Auth Akışı

1. Kullanıcı `/login`'e gider, e-posta girer
2. Magic link gönderilir (Supabase OTP)
3. E-postadan link'e tıklayan user `/auth/callback?code=...`'e gelir
4. Code session'a çevrilir, `/dashboard`'a yönlendirilir
5. Middleware her istekte session'ı yeniler

## Güvenlik

- `next.config.ts` security headers (HSTS, X-Frame-Options DENY, CSP-ready)
- Supabase service_role key sadece server-side
- RLS her tabloda zorunlu (proje açılırken policy yazılmalı)
- `pnpm audit` clean
- Husky pre-commit: lint + format

## Yeni Proje Klonlama

```bash
cp -R ~/Desktop/web-uygulama/boilerplates/nextjs-supabase-admin \
      ~/Desktop/web-uygulama/projeler/<proje-adi>
cd ~/Desktop/web-uygulama/projeler/<proje-adi>
git init && git add -A && git commit -m "chore: bootstrap from boilerplate"
gh repo create kirmizi-erik/<proje-adi> --private --source=. --push
```

## Detaylı Doc

Kök dizinde `~/Desktop/web-uygulama/docs/`:
- `architecture.md`
- `security.md`
- `deployment.md`
- `github-workflow.md`
