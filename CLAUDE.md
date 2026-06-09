# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Reset the database
npm run db:reset
```

> Do not run `npm audit fix` — dependencies are pinned to specific versions that work together.

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. If the key is missing or still the placeholder `your-api-key-here`, the app falls back to a `MockLanguageModel` that returns canned components — useful for development without burning API credits.

Auth uses JWTs signed with `JWT_SECRET` (defaults to `"development-secret-key"` if unset).

## Architecture

UIGen is a Next.js 15 App Router app where users describe React components in a chat UI and see them rendered live in an iframe preview.

### Data flow

1. **Chat** — The user types a prompt. `ChatContext` (`src/lib/contexts/chat-context.tsx`) wraps the Vercel AI SDK's `useChat`, posting to `/api/chat` with the current virtual file system serialized as JSON.

2. **API route** (`src/app/api/chat/route.ts`) — Reconstructs a `VirtualFileSystem`, picks the language model via `getLanguageModel()` (`src/lib/provider.ts`), then calls `streamText` with two tools:
   - `str_replace_editor` — text-editor-style commands (`view`, `create`, `str_replace`, `insert`) that Claude uses to write files
   - `file_manager` — higher-level file operations (rename, delete)
   
   On finish, if there's a `projectId` and an authenticated session, the messages and file system state are persisted to SQLite via Prisma.

3. **Virtual file system** (`src/lib/file-system.ts`) — An in-memory tree (`Map<string, FileNode>`) that lives in client state. No files are written to disk. The `FileSystemContext` holds the live instance and triggers preview refreshes when files change.

4. **Preview** (`src/components/preview/PreviewFrame.tsx`) — On every file-system change, it:
   - Transpiles all `.jsx`/`.tsx` files in-browser via Babel Standalone
   - Builds an ES Module import map (local files → `blob:` URLs; unknown packages → `esm.sh`)
   - Injects the result into an `<iframe srcdoc>` with React 19 loaded from `esm.sh`
   - Entry point is `/App.jsx` by default; falls back to `/App.tsx`, `/index.jsx`, etc.

5. **Persistence** — Authenticated users' work is stored in SQLite (`prisma/dev.db`). Anonymous work is tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts` so it can be offered for save on sign-up.

### Key conventions for the AI prompt

The system prompt (`src/lib/prompts/generation.tsx`) instructs Claude to:
- Always create `/App.jsx` as the entry point
- Use Tailwind CSS for styling (Tailwind CDN is injected into the preview iframe)
- Import local files with the `@/` alias (e.g., `@/components/Button`)
- Avoid creating HTML files (unused)

### Auth

JWT-based, server-only (`src/lib/auth.ts`). Sessions are stored as `httpOnly` cookies (`auth-token`). The Prisma schema has `User` and `Project` models; `Project.userId` is nullable to support anonymous projects that aren't saved.

### Testing

Vitest with jsdom + React Testing Library. Tests live alongside source in `__tests__` subdirectories. The vitest config is at `vitest.config.mts`.


### Tastes

Use comments sparingly. Only comment complex code.