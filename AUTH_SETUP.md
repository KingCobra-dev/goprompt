 Auth and Database Setup (React + Supabase)

This project now uses Supabase for authentication and database. Follow these steps to configure your local environment.

## 1) Create a Supabase project
- Go to https://supabase.com and create a new project
- Note your Project URL and anon public API key

## 2) Configure Auth (GitHub OAuth)
- In your Supabase project, go to Authentication > Providers > GitHub
- Enter your GitHub OAuth app credentials (Client ID and Client Secret)
- In GitHub Developer Settings, set Authorization callback URL to:
  - http://localhost:5173
  - http://localhost:5174 (fallback if 5173 is taken)
- In Supabase Auth settings, add the same URLs to Redirect URLs

## 3) Apply the database schema
- Open `supabase/schema.sql` in this repo
- In Supabase SQL editor, paste and run the script
- This creates tables: users, repos, prompts, stars, saves, comments, forks
- RLS is enabled with a couple of example policies

## 4) Configure environment variables (Vite)
- Copy `.env.local.example` to `.env.local`
- Fill in your values:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Note: These are public, non-secret values suitable for browser use. Do not expose service role keys in the client.

## 5) Run the app
- Install dependencies if needed: `npm install`
- Start dev server: `npm run dev`
- Open the URL printed in the terminal (likely http://localhost:5173 or :5174)

## 6) Try the auth flow
- Click Sign In in the header
- You can:
  - Sign up/sign in with email + password (Supabase will email confirm by default)
  - Continue with GitHub (OAuth)
- After sign in, the header menu will show your user; use the dropdown to Sign out

## Notes
- The app currently uses mock data for repositories and prompts. Upcoming sprints will replace the mock API in `src/lib/api.ts` with Supabase queries.
- Some UI reads `user.reputation`. This defaults to 0 for now; later we can store it in the `users` table.
- Freemium limits and role enforcement will be implemented with RLS policies and/or database triggers/edge functions in Phase 2.2.