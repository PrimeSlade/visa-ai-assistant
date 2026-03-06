# Visa AI Assistant

Thai DTV visa assistant app with:

- `apps/frontend`: Next.js chat/admin UI
- `apps/backend`: Express API + Gemini + Prisma

## What this app does

1. Generates consultant-style replies from client chat context.
2. Improves the AI prompt by comparing AI replies with real consultant replies.
3. Lets admins manually update the live chatbot prompt.

## Main backend endpoints

- `POST /generate-reply`  
  Generate consultant-style AI reply from `clientSequence` + `chatHistory`.
- `POST /improve-ai`  
  Compare AI vs real consultant reply, then update the live prompt in DB.
- `POST /improve-ai-manually`  
  Apply manual operator instructions to update the live prompt.

## Other endpoints used by frontend/admin

- `POST /improve-ai-budget` (budget-safe draft analysis, no auto-save)
- `GET /admin/prompts` (load current live consultant prompt + version)
- `PATCH /admin/prompts/consultant` (approve and save prompt draft)
- `POST /api/gemini/test` (Gemini connectivity sanity check)
- `GET /api/health` (health check)

## Main features

- Chat assistant for Thai DTV visa conversations
- Prompt improvement endpoint (`/improve-ai`) that updates the live prompt
- Manual prompt editor endpoint (`/improve-ai-manually`)
- Budget-safe prompt draft endpoint (`/improve-ai-budget`) with approval flow
- Gemini test endpoint and health check
- Prisma-backed prompt storage

## Tech stack / libraries

- Auth: `better-auth`, `@better-auth/prisma-adapter`
- UI: `shadcn/ui`, Radix UI, `lucide-react`, `sonner`
- Frontend: `Next.js`, `React`, `Tailwind CSS`, `@tanstack/react-query`, `axios`
- Backend: `Express`, `Prisma`, `pg`, `dotenv`
- AI: Gemini (`generateReply` + prompt editor JSON flow)

## `/improve-ai-budget` algorithm (current)

1. Validates uploaded `conversations` payload.
2. Extracts client->consultant training pairs from grouped conversation blocks.
3. Selects 3 samples with keyword quota:
   - 1 `eligibility`
   - 1 `location`
   - 1 `documents`
     If a category is missing, it falls back to remaining samples.
4. Runs AI prediction for each selected sample (3 prediction calls total).
5. Computes text similarity score (token-overlap Dice score) between AI and consultant replies.
6. If all samples pass threshold (default `0.7`), returns no prompt draft.
7. If any sample fails, runs prompt editor once on the first failing sample and returns a proposed prompt draft.
8. Enforces API budget cap: max 4 Gemini calls (`3` predictions + `1` editor), and never auto-saves prompt in this endpoint.

Why this algorithm: it is optimized for free-tier API usage. The endpoint gives broad quality coverage across `eligibility`, `location`, and `documents` while keeping call count predictable and low.

## Quick start

```bash
npm install
npm run dev:frontend
npm run dev:backend
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

## Deploy

### Backend: Coolify on DigitalOcean

Use your root `Dockerfile.api` for backend deployment.

1. In Coolify, create a new application from this repo.
2. Set build context to repository root.
3. Set Dockerfile path to `Dockerfile.api`.
4. Set exposed/internal port to `4000`.
5. Set health check path to `/api/health`.
6. Add backend environment variables:
   - `PORT=4000`
   - `DATABASE_URL=postgresql://...` (your Neon/Postgres URL)
   - `GEMINI_API=...`
   - `GEMINI_MODEL=gemini-2.5-flash` (optional override)
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
   - `BETTER_AUTH_URL=https://your-backend-domain`
   - `BETTER_AUTH_SECRET=your_random_32_plus_char_secret`
   - `BETTER_AUTH_TRUSTED_ORIGINS=https://your-frontend-domain.vercel.app`
7. Deploy and confirm backend is healthy at `https://your-backend-domain/api/health`.

Notes:
- `BETTER_AUTH_URL` must be your public backend URL.
- `FRONTEND_URL` and `BETTER_AUTH_TRUSTED_ORIGINS` must include your Vercel frontend domain for cookie/auth + CORS flow.

### Frontend: Vercel

1. Import this repo in Vercel.
2. Set Root Directory to `apps/frontend`.
3. Keep default Next.js build settings.
4. Add frontend environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain`
5. Deploy.

If you use a custom frontend domain, update backend env:
- `FRONTEND_URL=https://your-custom-frontend-domain`
- `BETTER_AUTH_TRUSTED_ORIGINS=https://your-custom-frontend-domain`

## Post-Deploy Checklist

1. Backend health check returns success: `GET /api/health`.
2. Frontend can call backend API without CORS errors.
3. Auth works (login/session cookies persist).
4. Chat and admin pages can read/write prompt data.

## Troubleshooting

- CORS errors:
  - Verify backend `FRONTEND_URL` exactly matches your active frontend origin.
  - Add all allowed frontend origins in `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated).
- Auth redirect/session issues:
  - Verify `BETTER_AUTH_URL` is the public backend URL, not localhost.
- Frontend cannot reach backend:
  - Verify `NEXT_PUBLIC_API_URL` points to backend public HTTPS URL.
- Backend boot/runtime failures:
  - Verify `DATABASE_URL` and `GEMINI_API` are set correctly in Coolify.
