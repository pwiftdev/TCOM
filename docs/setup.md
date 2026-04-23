# TCOM Setup

## Local
1. Run `supabase/schema.sql` in Supabase SQL editor.
2. Copy backend env: `cp tcom-backend/.env.example tcom-backend/.env`.
3. Copy frontend env: `cp tcom-frontend/.env.example tcom-frontend/.env`.
4. Start backend: `cd tcom-backend && npm run dev`.
5. Start frontend: `cd tcom-frontend && npm run dev`.

## Required external setup
- X Developer app with OAuth 2.0 callback URL configured.
- Supabase storage buckets: `community-banners`, `community-icons`, `post-media`.
