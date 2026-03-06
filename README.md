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

## Production Deployment (Current)

This project is currently deployed as:

- Backend: Coolify on a DigitalOcean host
- Frontend: Vercel
- Database: Neon Postgres (used by backend)

### Current backend runtime shape

- Backend image is built from root `Dockerfile.api`.
- Express API runs on `PORT=4000`.
- Health endpoint is `GET /api/health`.
- Database is Neon Postgres via `DATABASE_URL`.
- Gemini is configured via `GEMINI_API` (and optional `GEMINI_MODEL`).
- Better Auth relies on:
  - `BETTER_AUTH_URL` (public backend URL)
  - `BETTER_AUTH_SECRET`
  - `FRONTEND_URL` (frontend origin)
  - `BETTER_AUTH_TRUSTED_ORIGINS` (allowed frontend origins)

### Current frontend runtime shape

- Frontend is deployed from `apps/frontend` on Vercel.
- Frontend API base URL is set with `NEXT_PUBLIC_API_URL` and points to the deployed backend URL.
- Frontend uses credentialed requests (`withCredentials`), so backend CORS/auth origin envs must match the live frontend domain.

## Operational Notes

- If frontend domain changes, update backend `FRONTEND_URL` and `BETTER_AUTH_TRUSTED_ORIGINS`.
- If backend domain changes, update backend `BETTER_AUTH_URL` and frontend `NEXT_PUBLIC_API_URL`.
