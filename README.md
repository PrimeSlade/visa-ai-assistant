# Visa AI Assistant

This repository contains:

- `apps/frontend`: a Next.js frontend using the App Router and TypeScript
- `apps/backend`: an Express backend using TypeScript

## Getting started

1. Install dependencies from the repository root:

```bash
npm install
```

2. Copy the example environment files if needed:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

3. Run each app in separate terminals:

```bash
npm run dev:frontend
npm run dev:backend
```

The frontend defaults to `http://localhost:3000` and expects the backend at `http://localhost:4000`.
