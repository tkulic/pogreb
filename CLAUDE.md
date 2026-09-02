# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules

- You are allowed to read and edit any file in the project root directory without asking for permission first.
- Always summarize what you did at the end of each task — which files were changed and what was changed.
- Never create a git commit automatically. Only commit when the user explicitly asks for it.
- When writing SQL migrations (or other multi-part code), build it in small reviewable chunks and present each chunk for approval before starting the next — don't write the whole thing in one step.

## Project status

Spec-driven project, early implementation. The database schema is **complete and applied** to the hosted Supabase project — content tables, `entities.slug`, Croatian service slugs, and usage logging (`events` + `log_event`) — with seven Split pilot providers loaded. The frontend is **fully specified but not built**; that is the next step.

Read `SPEC.md`, `SPEC_database.md` and `SPEC_frontend.md` before doing any work here. They are the source of truth and are living documents, updated as decisions are made, not static references. For frontend work `SPEC_frontend.md` is the operative one: it carries the user story, the three-screen flow, the results page and its ranking rules, the routing, and the **Kamen** visual system down to colour and type tokens.

## What this is

A free, public aggregator of Croatian funeral service providers (NKD 96.03 classification), starting with a Phase 1 pilot covering 1-2 cities. Full objective, scope, and rationale live in `SPEC.md`.

## Naming convention

Everything not customer-facing — schema, code, comments, identifiers — is written in English. Exceptions: genuine Croatian identifiers with no English equivalent (OIB, MBS, NKD, legal-form abbreviations like `doo`/`obrt`), and customer-facing data values (city names, service names), since the product itself is Croatian-facing. Full rule in `SPEC.md` → Naming Convention.

## Boundaries

`SPEC.md` → Boundaries defines a three-tier rule set for this repo — treat it as binding, not advisory:
- **Ask first**, notably: any database schema change, any command that touches the live hosted database (no staging environment exists — every migration hits production), deleting/bulk-overwriting rows, adding a new external integration, changing the Sudreg sync approach, activating multi-tenant/auth or a new RLS write policy, force-pushing or rewriting git history.
- **Never**, notably: scrape the Obrtni registar, charge users in Phase 1, commit secrets or use the Supabase `service_role` key in client-side code, run destructive SQL without explicit confirmation, fabricate/guess business data.

Read the full list in `SPEC.md` before making changes — it's short, and the reasoning behind each rule matters for judgment calls it doesn't explicitly cover.

## Database

The schema — tables, RLS policies, seed data — is specified in `SPEC_database.md` and implemented in `supabase/migrations/`. The spec is the source of truth for intent, the migrations for exact DDL; any schema change goes through the spec first (see Boundaries above).

The Supabase CLI lives at `.tools/supabase/supabase.exe` (gitignored — the npm package has no `win32-x64` binary). It runs without Docker, so there is no local database and no `db reset` loop: `supabase db push` applies migrations directly to production.

**Never edit a migration that has already been applied.** Supabase tracks migrations by version, not content, so an edit to an applied file silently never reaches the database while making the repo look correct. Corrections go in a new migration.

## Frontend

Not created yet. Specified in `SPEC_frontend.md`; Next.js, run locally against the hosted Supabase project (no deploy in Phase 1).

Copy `.env.example` to `.env.local` and fill it from the Supabase dashboard. Only the URL and the `anon` key are needed — both are meant to ship in the browser.

**`npm run dev` points at the production database.** There is no local database and no staging environment, so treat every query as running against real data, and never bypass the instrumentation environment guard (`SPEC_database.md` → Client-side rules) — without it, local page refreshes become the largest contributor to the `events` table.

## Design

`.design/` holds the design canvas working files and is gitignored. It contains one artboard — the chosen **Kamen** direction — as a visual specimen only. `SPEC_frontend.md` → Visual system is authoritative for tokens, type scale and behaviour; where the artboard and the spec disagree, the spec wins.
