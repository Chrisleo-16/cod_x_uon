# UoN Call of Duty Mobile Tournament

Next.js + Supabase registration + admin command center for the University of Nairobi / ONUSS COD Mobile tournament (Chiromo · 26 Sep 2026).

## Features

- Activision-style registration card with ONUSS + University of Nairobi logos
- Desktop Ghost background / mobile squad background
- Slot A (captain) + teammates B–E in one submission (20 squads · 100 operators)
- COD-style loader + Attention modal when registration is full
- Admin dashboard: squads, pools, live score entry, pool fixture generation
- Works in **local demo mode** (in-memory) without Supabase; swap in Supabase for production

## Quick start

```bash
npm install
npm run dev
```

- Public form: http://localhost:3000
- Admin: http://localhost:3000/admin (password from `.env.local`, default `admin123`)

## Supabase (production)

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` → `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`

Until those keys are set, the app uses an in-memory store (resets on server restart).

## Registration rules

- Each submit locks **5 players** (A–E)
- Max **20 teams** / **100 players**
- Teams auto-assign to pools 1–5 (4 teams per pool)
- At capacity, registration closes and the COD Attention modal is shown
