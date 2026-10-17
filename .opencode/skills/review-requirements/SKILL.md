---
name: Review Requirements
description: Audit the DevAcademy project against the course requirements (authentication, 4 CRUDs, pagination, TypeScript/OOP criteria, Docker networking and agent configuration) and report gaps. Use before delivering a sprint or when asked to check compliance with the assignment.
---

# Review requirements workflow

Act as a reviewer: **do not edit files** (the `reviewer` agent denies edits).
Inspect the repository and produce a checklist with `OK`, `PARTIAL` or
`MISSING` plus a short evidence note (file and line/behaviour) for each item.

## 1. Authentication and users

- [ ] Login with e-mail + password, JWT returned.
- [ ] Passwords hashed (bcrypt) and never returned by any endpoint.
- [ ] E-mail validated with a regex; only existing users can log in.
- [ ] Registration requires name, e-mail, password and CPF.
- [ ] CPF validated (check digits) and unique.
- [ ] Password strength rule enforced (length + upper + lower + digit + symbol).
- [ ] User update is authenticated, only the owner can update, the fields are
      independent (name, CPF or password, at least one required) and the e-mail
      cannot be changed.

## 2. Resources (4 full CRUDs, users excluded)

- [ ] Four resources with `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`.
- [ ] Every resource route requires a valid JWT.
- [ ] Listings are paginated (`page`, `limit`, `total`, `totalPages`).
- [ ] Editing/deleting a missing record returns 404.
- [ ] At least one relationship between resources (list them all).

## 3. Frontend

- [ ] Login page stores the token in `localStorage` and redirects to the app.
- [ ] Registration validates CPF, e-mail, password + confirmation and redirects
      to login afterwards.
- [ ] API errors are shown in a friendly way (toasts, no raw alerts).
- [ ] User data is exposed globally through a React context.
- [ ] Profile page cannot change the e-mail and confirms the password (the new
      password is optional; the confirmation is required only when one is typed).
- [ ] Every resource has separate list, create and edit screens with pagination.
- [ ] Pages are composed of reusable components; page-exclusive components live
      in their own files (`_components/`).

## 4. TypeScript / OOP quality

- [ ] Encapsulation: private fields, clean constructors, validation in setters.
- [ ] Inheritance/abstraction where reuse is real (`abstract` classes).
- [ ] Polymorphism: overridden methods or a common contract.
- [ ] Interfaces, type aliases and generics used; search for `any` and report
      every occurrence (`rg ": any" backend/src frontend/src`).
- [ ] SOLID: services with a single responsibility, extensible repositories.
- [ ] Custom exception classes and an organized folder layout.

## 5. Docker / DevOps

- [ ] `docker-compose.yml` is indented, commented, uses volumes, networks and
      environment variables.
- [ ] Backend connects to MySQL, frontend consumes the backend, Nginx proxying.
- [ ] MySQL data persists in a named volume.
- [ ] Only the Nginx service publishes ports (`docker compose config`).
- [ ] `.env.example` documents every variable; `.env` is git-ignored.

## 6. Agent configuration

- [ ] `AGENTS.md` exists at the repository root.
- [ ] Three skills exist under `.opencode/skills/`.
- [ ] `opencode.jsonc` has guardrail permission rules.
- [ ] `.env` protection: read and edit are denied for `*.env` / `*.env.*`,
      while `*.env.example` stays allowed.

## Output format

A table with requirement, status and evidence, followed by a prioritised list of
gaps. Never modify files while reviewing.
