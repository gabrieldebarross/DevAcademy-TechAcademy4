---
name: Frontend Page
description: Create or extend a screen in the Next.js frontend - paginated list, create and edit pages - using the shared UI components, AuthContext, API services, validators and friendly error handling of this project. Use when asked for a new page, form, table, route or component in frontend/.
---

# Frontend page workflow

Each resource always has three separate screens (never a single page doing
everything) plus its own service and types. Code comments are written in
**Brazilian Portuguese**; identifiers stay in **English**.

```
src/app/(protected)/<resource>/page.tsx            # paginated list
src/app/(protected)/<resource>/new/page.tsx        # create
src/app/(protected)/<resource>/[id]/edit/page.tsx  # edit
src/app/(protected)/<resource>/_components/*.tsx   # components used only here
src/services/<resource>Service.ts
src/types/index.ts                                 # types/payloads live here
```

## Steps

1. **Types** — `src/types/<resource>.ts`
   - Describe the API payloads and reuse the generic `PaginatedResponse<T>`.

2. **Service** — `src/services/<resource>Service.ts`
   - Use the shared `api` client (`src/services/api.ts`), which already adds the
     `Authorization` header, handles 401 and normalizes errors.
   - One function per endpoint: `list`, `getById`, `create`, `update`, `remove`.

3. **List page**
   - `"use client"` at the top (the session lives in `localStorage`).
   - Fetch with the current `page`/`limit`, render with the generic
     `<Table<T>>`, and paginate with `<Pagination>`.
   - Show `<EmptyState>` when there are no rows, `<Spinner>` while loading and a
     friendly message when the request fails.
   - Provide buttons to create, edit and delete; ask for confirmation
     (`<ConfirmDialog>`) before deleting.

4. **Create / edit pages**
   - Build the form from the generic inputs (`<Input>`, `<PasswordInput>`,
     `<Select>`, `<TextArea>`, `<FormField>`).
   - Validate mandatory fields with the shared helpers in
     `src/utils/validators.ts` **before** calling the API.
   - On success show a success toast and redirect to the list.
   - On failure show the API message with `useToast()` (never a raw `alert`).

5. **Page-specific components** — anything used by a single resource goes in
   that resource's `_components/` folder as its own function/file.

## Role-aware screens (RBAC)

- Read the profile from `useAuth()` (`role`, `isAdmin`, `isInstructor`,
  `isStudent`, `hasRole`).
- Wrap write screens (`new`, `[id]/edit`) in `<RoleGuard allow={[...]}>`.
- Hide restricted actions with `<Can roles={[...]}>` or conditionals; the visual
  layer is a convenience — the backend remains the source of truth.
- Adapt the UI per role: e.g. show the "CPF" column only for the ADMIN, offer
  "Matricular-se" to a student and "Aprovar" to an instructor/admin.
- Forms may differ per role too: a student requesting an enrollment only picks a
  course (`{ courseId }`), while admin/instructor pick the student and status.

## Design tokens

Reuse the "Academy modern" tokens instead of hard-coded colors: `primary`
(vinho), `accent` (dourado) and the warm `gray`. Titles use `font-display`,
numeric values may use `font-mono`, and cards use `rounded-2xl … shadow-card`.

## Rules

- Never call `fetch` directly in a component: always go through a service.
- Never read the token manually: use `useAuth()` from `AuthContext`.
- Keep components reusable and dumb; data fetching and navigation live in pages.
- Money, dates and CPF are formatted with the helpers in
  `src/utils/formatters.ts`.
- Guard screens and actions with `RoleGuard`/`Can`; never trust the client for
  authorization.
- Run `npm run build` in `frontend/` before considering the task done.

## Shared building blocks

Save time by reusing what already exists: `Button`, `Input`, `PasswordInput`,
`Select`, `TextArea`, `FormField`, `Table<T>`, `Pagination`, `Badge`,
`ConfirmDialog`, `EmptyState`, `Spinner`, `PageHeader`, `useToast`, `useAuth`.
