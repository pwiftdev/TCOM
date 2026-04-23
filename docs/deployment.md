# Deployment

## Backend (Heroku)
- Use `Procfile` with `web: node src/index.js`.
- Set all vars from `tcom-backend/.env.example`.
- Set `REDIS_URL` for persistent OAuth sessions.

## Frontend (Vercel)
- Deploy `tcom-frontend` folder.
- Configure `VITE_API_URL` to Heroku app URL.
- Keep SPA rewrite rules from `tcom-frontend/vercel.json`.
