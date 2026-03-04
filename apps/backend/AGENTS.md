# Backend Agent Guide

## Scope

These instructions apply to everything under `apps/backend`.

## Working Style

1. Start by reading the relevant backend files and propose a plan
2. Wait for the user's explicit approval before editing code, schemas, prompts, or scripts
3. Prefer small, targeted changes that preserve the current MVC flow

## Folder Map

- `src/index.ts`: Express entry point, middleware setup, and route mounting
- `src/routes/`: HTTP endpoint registration only; keep route files thin
- `src/controllers/`: request validation and HTTP response handling
- `src/services/`: business logic, Gemini orchestration, and prompt update flows
- `src/models/`: request and response types used by the API
- `src/lib/`: shared infrastructure such as Prisma, Gemini helpers, auth, prompt storage, request parsing, and shared errors
- `src/middleware/`: reusable Express middleware and error handling
- `src/scripts/`: operator and training scripts for prompt seeding, prompt inspection, prompt replacement, and conversation processing
- `prisma/`: schema and migrations
- `src/generated/prisma/`: generated Prisma client output; do not hand-edit generated files
- `dist/`: compiled build output; do not edit directly unless the user explicitly asks for generated artifacts

## Backend Notes

- Keep the controller -> service -> model(prisma logic) flow clear. Do not move business logic into route files.
- Treat `improve-ai` and `improve-ai-manually` as live prompt mutation paths. Be careful with prompt-writing behavior.
- Prefer editing source files under `src/` and Prisma source files under `prisma/`, then regenerate or rebuild only when needed.
- If auth-related work appears, inspect `src/lib/auth.ts` and related middleware before changing request flow assumptions.
- When changing Gemini integration, keep structured parsing and prompt loading centralized in `src/lib/`.

## Change Boundaries

- Do not edit `src/generated/prisma/` manually.
- Do not rely on `dist/` as source of truth.
- If a task requires schema or env changes, call them out clearly in the plan before implementation.
