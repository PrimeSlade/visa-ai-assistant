# Backend Flow

## Purpose

This backend is an Express API for a Thai DTV visa assistant. It does three main things:

1. Generate consultant-style replies from client conversation context
2. Improve the live chatbot prompt by comparing AI output against real consultant replies
3. Manually update the live chatbot prompt with operator instructions

The backend follows a simple MVC structure:

- `routes/`: endpoint definitions
- `controllers/`: request validation and HTTP response handling
- `services/`: business logic and LLM/database orchestration
- `models/`: request/response types
- `lib/`: shared infrastructure for Gemini, Prisma, and prompt storage

## Runtime Flow

### App startup

Entry point: [apps/backend/src/index.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/index.ts)

On startup, the server:

1. Loads env vars with `dotenv`
2. Creates an Express app
3. Enables CORS and JSON body parsing
4. Mounts feature routes
5. Starts listening on `PORT` (default `4000`)

Mounted routes:

- `POST /generate-reply`
- `POST /improve-ai`
- `POST /improve-ai-manually`
- `POST /api/gemini/test`
- `GET /api/health`

## Core Infrastructure

### Database

Prisma client is initialized in [apps/backend/src/lib/prisma.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/lib/prisma.ts).

The database currently stores prompt text in the `SystemPrompt` table. Important prompt names:

- `dtv_dm_consultant`
- `dtv_prompt_editor`

Prompt helpers live in [apps/backend/src/lib/systemPrompts.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/lib/systemPrompts.ts).

### Gemini

Gemini API calls are centralized in [apps/backend/src/lib/gemini.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/lib/gemini.ts).

Responsibilities:

- call Gemini with the selected model
- enforce JSON output where needed
- parse structured responses
- normalize reply payloads

Default model:

- `gemini-2.5-flash`

Required env:

- `DATABASE_URL`
- `GEMINI_API`

Optional env:

- `GEMINI_MODEL`
- `PORT`
- `FRONTEND_URL`

## Endpoint Flows

### `POST /generate-reply`

Files:

- [apps/backend/src/routes/generateReplyRoutes.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/routes/generateReplyRoutes.ts)
- [apps/backend/src/controllers/generateReplyController.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/controllers/generateReplyController.ts)
- [apps/backend/src/services/generateReplyService.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/services/generateReplyService.ts)

Request body:

- `clientSequence: string`
- `chatHistory: { role: "client" | "consultant", message: string }[]`

Flow:

1. Controller validates request shape
2. Service loads the live chatbot prompt from DB
3. Service formats:
   - latest client message(s)
   - prior chat history
4. Service sends the formatted prompt to Gemini
5. Response is returned as:

```json
{
  "aiReply": "..."
}
```

### `POST /improve-ai`

Files:

- [apps/backend/src/routes/improveAiRoutes.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/routes/improveAiRoutes.ts)
- [apps/backend/src/controllers/improveAiController.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/controllers/improveAiController.ts)
- [apps/backend/src/services/improveAiService.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/services/improveAiService.ts)

Request body:

- `clientSequence: string`
- `chatHistory: { role: "client" | "consultant", message: string }[]`
- `consultantReply: string`

Flow:

1. Controller validates request
2. Service loads the current chatbot prompt from DB
3. Service generates the current `predictedReply`
4. Service loads the prompt-editor prompt from DB
5. Service sends Gemini:
   - current chatbot prompt
   - chat history
   - client sequence
   - real consultant reply
   - predicted AI reply
6. Prompt editor returns a structured JSON result with a new prompt
7. Service writes the updated chatbot prompt back to DB
8. Response is returned as:

```json
{
  "predictedReply": "...",
  "updatedPrompt": "..."
}
```

Important:

- this endpoint mutates the live chatbot prompt

### `POST /improve-ai-manually`

Files:

- [apps/backend/src/routes/improveAiManuallyRoutes.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/routes/improveAiManuallyRoutes.ts)
- [apps/backend/src/controllers/improveAiManuallyController.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/controllers/improveAiManuallyController.ts)
- [apps/backend/src/services/improveAiManuallyService.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/services/improveAiManuallyService.ts)

Request body:

- `instructions: string`

Flow:

1. Controller validates request
2. Service loads the current chatbot prompt from DB
3. Service asks Gemini to apply only the manual instructions with minimal edits
4. Service writes the updated prompt back to DB
5. Response is returned as:

```json
{
  "updatedPrompt": "..."
}
```

Important:

- this endpoint also mutates the live chatbot prompt

### `POST /api/gemini/test`

Files:

- [apps/backend/src/routes/geminiRoutes.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/routes/geminiRoutes.ts)
- [apps/backend/src/controllers/geminiController.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/controllers/geminiController.ts)
- [apps/backend/src/services/geminiTestService.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/services/geminiTestService.ts)

Purpose:

- lightweight Gemini sanity check
- can use the DB prompt or a request-level override

## Training / Prompt Optimization Script

Main script:

- [apps/backend/src/scripts/processConversations.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/scripts/processConversations.ts)

Input:

- root-level `conversations.json`

What it does:

1. Extracts training samples from conversation threads
2. Each sample contains:
   - preceding chat history
   - client sequence
   - real consultant reply
3. Generates an AI reply with the current DB prompt
4. Runs the prompt editor to diagnose the gap
5. Updates the working prompt
6. Writes the final prompt back to the DB
7. Regenerates sample replies using the updated prompt
8. Prints before/after output for inspection

Config:

- `CONVERSATION_SAMPLE_COUNT`

Important behavior:

- optimization is based on extracted client-turn samples, not raw conversation count
- one conversation can yield multiple optimization samples

## Prompt Management Scripts

Files:

- [apps/backend/src/scripts/seedSystemPrompt.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/scripts/seedSystemPrompt.ts)
- [apps/backend/src/scripts/showSystemPrompt.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/scripts/showSystemPrompt.ts)
- [apps/backend/src/scripts/setSystemPrompt.ts](/Users/saizayarhein/Desktop/visa-ai-assistant/apps/backend/src/scripts/setSystemPrompt.ts)

Use cases:

- seed default prompts into DB
- inspect current prompt content
- overwrite prompt content manually from the CLI

## Production Note

For local testing, `/generate-reply` and `/improve-ai` accept `chatHistory` in the request body.

For a real full-stack app, `chatHistory` should usually come from the database, not from the client directly. The cleaner production flow is:

1. frontend sends `conversationId` and latest client message
2. backend loads prior messages from DB
3. backend builds `chatHistory`
4. backend generates and stores the AI reply

The current endpoints are suitable for testing and admin workflows. A production messaging flow should usually move history assembly fully server-side.
