# DevAcademy — agent instructions

Persistent guidance for AI agents working in this repository. Read this before
changing any file.

## Project

DevAcademy is an academic full-stack project: an admin panel for a technology
school. The client persona manages courses, instructors, categories and
student enrollments behind a secure login.

- `backend/` — REST API: Node.js + Express + TypeScript + TypeORM + MySQL.
- `frontend/` — Web app: Next.js (App Router) + TypeScript + Tailwind CSS.
- `nginx/` — Reverse proxy configuration.
- `docker-compose.yml` — Runs the whole stack (only Nginx is exposed).

## Commands

Run every command from the directory it belongs to.

Backend (`backend/`):

```bash
npm run dev         # dev server with tsx watch
npm run build       # tsc -> dist/
npm run typecheck   # tsc --noEmit (must pass after every change)
npm run seed        # populate demo data (admin user, courses, ...)
```

Frontend (`frontend/`):

```bash
npm run dev         # Next.js dev server
npm run build       # production build (must pass after every change)
npm run lint        # eslint
```

Whole stack (repository root):

```bash
docker compose up --build
```

## Conventions

- Identifiers and file names are written in **English**.
- Comments are written in **Brazilian Portuguese**, with no accents-in-code
  restrictions beyond normal UTF-8, because the team and the client persona are
  Brazilian.
- User-facing strings (API error messages and UI labels) are written in
  **Brazilian Portuguese**.
- TypeScript is strict: do not use `any`, do not disable strict checks, prefer
  `unknown` plus narrowing when the type is genuinely unknown.
- Follow the existing layer structure. Backend dependency direction:
  `routes -> controllers -> services -> repositories -> entities`.
- Domain rules live inside entities (validation in setters/constructors).
  Services orchestrate, repositories only talk to the database.
- Errors are always thrown as `AppError` subclasses (`NotFoundError`,
  `ValidationError`, `ConflictError`, ...), never as raw `Error`.
- Every backend list endpoint is paginated through `parsePagination()` and
  returns `{ data, meta }` (`PaginatedResult<T>`).
- Every resource route (except `auth`) is protected by the `ensureAuthenticated`
  middleware.

## Security rules (hard requirements)

- **Never read, print, copy or modify `.env` files or any secret.** The
  `opencode.jsonc` guardrails block it; do not try to work around them.
- Use `.env.example` to discover which variables exist, and never put real
  credentials in it.
- Never hardcode secrets, tokens, passwords or connection strings in the code.
- Do not run destructive shell commands (volume removal, force push, ...).

## Verification before finishing

1. `npm run typecheck` in `backend/` passes.
2. `npm run build` in `frontend/` passes.
3. The changed endpoint/page follows the layer and naming conventions above.
