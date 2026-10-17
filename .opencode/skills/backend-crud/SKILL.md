---
name: Backend CRUD
description: Add or extend a complete REST CRUD resource in the backend, following the entities/services/repositories layers, validation rules, custom exceptions and pagination used by this project. Use when asked to create a new resource, endpoint, entity, service, repository or controller in backend/.
---

# Backend CRUD workflow

Every resource in this project follows the same five layers. Never skip a layer
and never let a controller talk to the database directly. Code comments are
written in **Brazilian Portuguese**; identifiers stay in **English**.

```
src/routes/<resource>.routes.ts
  -> src/controllers/<Resource>Controller.ts
    -> src/services/<Resource>Service.ts
      -> src/repositories/<Resource>Repository.ts  (extends BaseRepository)
        -> src/entities/<Entity>.ts
```

## Steps

1. **Entity** — `src/entities/<Entity>.ts`
   - Declare columns on **private** backing fields (`_name`, `_price`, ...) and
     map the real column name with `@Column({ name: 'name' })`.
   - Expose reads with `get`, and writes with `set` **only when a rule exists**
     (trim, range, regex, reference). Throw `ValidationError` inside the setter.
   - Keep a clean constructor that receives a props object and assigns through
     the setters, so validation always runs.
   - Represent enums with a TypeScript `enum` and a `type: 'enum'` column.
   - Add `@CreateDateColumn` / `@UpdateDateColumn` when timestamps help.

   ```ts
   @Entity('books')
   export class Book {
     @PrimaryGeneratedColumn('uuid')
     private _id!: string;

     @Column({ name: 'title', length: 140 })
     private _title!: string;

     constructor(props?: { title: string }) {
       if (props) this.title = props.title;
     }

     get id(): string { return this._id; }
     get title(): string { return this._title; }

     set title(value: string) {
       const trimmed = (value ?? '').trim();
       if (trimmed.length < 3) throw new ValidationError('O título deve ter pelo menos 3 caracteres');
       this._title = trimmed;
     }
   }
   ```

2. **Repository** — `src/repositories/<Resource>Repository.ts`
   - Extend `BaseRepository<Entity>` (generics, already provides `findById`,
     `findAllPaginated`, `save`, `remove`).
   - Add only resource-specific queries (`findByName`, `findByEmail`, ...).
   - TypeORM filters use the metadata property name (the private field), e.g.
     `this.repository.findOne({ where: { _email: email } })`.

3. **Service** — `src/services/<Resource>Service.ts`
   - Receive the repository through the constructor (dependency injection).
   - Owns business rules and throws custom exceptions:
     `NotFoundError` for missing records, `ConflictError` for duplicates or for
     deleting a record that is referenced by another, `ValidationError` for
     invalid payloads.
   - Methods: `create`, `list` (paginated), `findById`, `update`, `remove`.

4. **Controller** — `src/controllers/<Resource>Controller.ts`
   - Export plain handler functions wrapped with `asyncHandler`.
   - Parse the body and `parsePagination(req.query)`; the service does the rest.
   - Return `201` on create, `204` on delete, `200` otherwise.

5. **Routes** — `src/routes/<resource>.routes.ts`
   - `router.use(ensureAuthenticated)` for every protected resource.
   - REST verbs: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
   - Export the router and mount it in `src/app.ts` under `/api/<resource>`.

6. **Validation of relations** — when the entity points to another resource,
   resolve the referenced entity in the service and throw `NotFoundError` if it
   does not exist (never persist a dangling reference).

## Authorization by profile (RBAC)

Every resource also enforces **who** can do **what**:

- **Routes** — add `requireRole(UserRole.ADMIN, ...)` for coarse profile checks
  (see `src/middlewares/requireRole.ts`). Reading is usually open to any
  authenticated user; writes are restricted.
- **Controllers** — read the actor with `requireAuthenticatedUser(req)` and pass
  it into the service: `service.list(actor, ...)`, `service.update(actor, ...)`.
- **Services** — validate **ownership** and throw `ForbiddenError`; this is the
  source of truth (e.g. an `INSTRUCTOR` only edits the courses they teach).
- **Scoped listings** — filter by the actor's profile in the repository
  (`findPaginatedByInstructor`, `findPaginatedByStudent`).
- **Role-aware DTOs** — some responses change with the profile: only the `ADMIN`
  receives sensitive fields such as the instructor CPF (`toInstructorResponse`
  vs `toInstructorSummary`).

## Checklist before finishing

- [ ] `npm run typecheck` in `backend/` passes.
- [ ] All routes are authenticated (except public auth routes).
- [ ] Writes are guarded by `requireRole` **and** an ownership check in the
      service; the controller passes the `actor`.
- [ ] Listing is paginated and returns `{ data, meta }`.
- [ ] Updating/deleting a missing id returns 404 (`NotFoundError`).
- [ ] No `any`, no raw `Error`, no database access outside repositories.
