# Frontend Agent Guide

## Scope

These instructions apply to everything under `apps/frontend`.

## Working Style

1. Read the relevant UI, route, and utility files first and propose a plan
2. Wait for the user's explicit approval before making frontend code changes
3. Preserve the current visual language unless the user asks for a redesign

## Folder Map

- `app/`: Next.js App Router entrypoints, layouts, route groups, and page-level UI
- `app/(auth)/`: authentication-facing route group and public shell
- `app/(protected)/`: signed-in route group, including the chat experience
- `components/`: shared feature components such as auth panels and guards
- `components/ui/`: reusable design-system style primitives
- `lib/`: client-side helpers such as auth wiring, API client setup, and shared utilities
- `hooks/`: custom React hooks when app behavior grows beyond page-local logic
- `types/`: shared frontend types
- `public/`: static assets
- `api/`: reserved for frontend-side API helpers or route-related integration files if used by this app
- `.next/`: generated Next.js output; do not edit directly

## Frontend Notes

- Follow App Router patterns already present in `app/`.
- Keep pages focused on composition and move reusable UI into `components/`.
- Reuse existing UI primitives from `components/ui/` before creating new ones.
- Keep auth and session behavior aligned with `lib/auth-client.ts` and the existing auth guard components.
- When wiring backend calls, prefer centralizing request code in `lib/api-client.ts` instead of scattering fetch logic across pages.
- Preserve responsive behavior for both desktop and mobile when adjusting layouts.

## Change Boundaries

- Do not edit `.next/` output manually.
- Avoid introducing duplicate UI primitives when an existing shared component already fits.
- If a task changes route structure, auth flow, or shared styling direction, surface that in the plan before implementation.
