# Deployment

This app is a Vite + React SPA and is ready to deploy on Vercel. It uses Supabase from the browser and needs environment variables at build/runtime.

## Prerequisites
- GitHub repository: `KingCobra-dev/goprompt` (already configured)
- Vercel account with the GitHub app installed
- Required env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Option A: Deploy via GitHub (recommended)
1. Push your latest code to `main`.
2. In the Vercel dashboard: New Project → Import Git Repository → select `KingCobra-dev/goprompt`.
3. Framework preset: Vite should be auto-detected.
4. Build & Output settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: (auto) `npm ci`
   These are also defined in `vercel.json` and will be respected.
5. Environment Variables (Project Settings → Environment Variables):
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for Production and Preview.
6. Click Deploy. Vercel will create a preview URL. Merge to `main` for production deploys.

`vercel.json` already includes an SPA rewrite so all routes resolve to `index.html`, and basic security headers.

## Option B: Deploy via Vercel CLI
1. Login and link project:
   ```bash
   npx vercel login
   npx vercel link
   ```
2. Add env vars (repeat for preview/development as needed):
   ```bash
   npx vercel env add VITE_SUPABASE_URL production
   npx vercel env add VITE_SUPABASE_ANON_KEY production
   ```
3. Create a preview deployment:
   ```bash
   npx vercel
   ```
4. Promote to production:
   ```bash
   npx vercel --prod
   ```

## Notes
- Local development uses `.env.local` (see `.env.example`).
- If you change the build output directory, update both `vite.config.ts` and `vercel.json`.
- Lint/typecheck before pushing: `npm run lint` and `npm run type-check`.
