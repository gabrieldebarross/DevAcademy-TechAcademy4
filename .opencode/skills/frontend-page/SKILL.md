---
name: Frontend Page
description: Create or extend a screen in the Next.js frontend - paginated list, create and edit pages - using the shared UI components, AuthContext, API services, validators and friendly error handling of this project. Use when asked for a new page, form, table, route or component in frontend/.
---

# Frontend page workflow

Each resource always has three separate screens (never a single page doing
everything) plus its own service and types.

```
src/app/(protected)/<resource>/page.tsx            # paginated list
src/app/(protected)/<resource>/new/page.tsx        # create
src/app/(protected)/<resource>/[id]/edit/page.tsx  # edit
src/app/(protected)/<resource>/_components/*.tsx   # components used only here
src/services/<resource>Service.ts
src/types/<resource>.ts
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

## Rules

- Never call `fetch` directly in a component: always go through a service.
- Never read the token manually: use `useAuth()` from `AuthContext`.
- Keep components reusable and dumb; data fetching and navigation live in pages.
- Money, dates and CPF are formatted with the helpers in
  `src/utils/formatters.ts`.
- Run `npm run build` in `frontend/` before considering the task done.

## Shared building blocks

Save time by reusing what already exists: `Button`, `Input`, `PasswordInput`,
`Select`, `TextArea`, `FormField`, `Table<T>`, `Pagination`, `Badge`,
`ConfirmDialog`, `EmptyState`, `Spinner`, `PageHeader`, `useToast`, `useAuth`.
