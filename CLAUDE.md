# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working rules

- You are allowed to read and edit any file in the project root directory without asking for permission first.
- Always summarize what you did at the end of each task — which files were changed and what was changed.
- Never create a git commit automatically. Only commit when the user explicitly asks for it.
- **Commit directly on `main`. Never create a feature branch and never propose a PR flow** — this is a single-developer project with no review workflow, so a branch only adds a merge step and hides the work from `main`. The general "branch before committing to the default branch" default does not apply here. Pushing stays separate: commit when asked, push only when asked.
- When writing SQL migrations (or other multi-part code), build it in small reviewable chunks and present each chunk for approval before starting the next — don't write the whole thing in one step.

## Project status

Spec-driven project, early implementation. The database schema is **complete and applied** to the hosted Supabase project — content tables, `entities.slug`, Croatian service slugs, and usage logging (`events` + `log_event`). It holds **seven cities and 45 providers**: Zagreb (20), Split (7), Rijeka (6), Zadar (5), Osijek (3), Pula (2), Dubrovnik (2), expanded from the Split-only pilot on 2026-09-03. Curated source data and the provenance trail for each city live in `data/` (gitignored).

The frontend is **built and running locally** — landing page, the three-screen question flow, the results page, provider detail, indexable service listings, `/sto-uciniti-prvo`, `/kako-rangiramo`, sitemap and robots. Ranking, the block partition and the reason line are one pure function under unit test (`web/lib/ranking.ts`), as are opening hours and phone selection (`web/lib/hours.ts`) — 51 tests against a fixture captured from the live pilot data.

Two visual-system decisions are settled and recorded in `SPEC_frontend.md`: contrast measurement corrected four colour tokens that were below WCAG AA in the approved mockup, and Cinzel was replaced by **Spectral SC** because it draws `Đ`/`đ` with a macron instead of a stroke. Both faces are vendored in `web/public/fonts/`, so check `Đ`/`đ` by eye on `/specimen` if a face is ever swapped.

The layout is **a masthead, a reading column and a footer**, at every width (`components/SiteHeader.tsx`, `components/SiteFooter.tsx`, and the `.shell` flex column in `app/globals.css`). This replaced the sticky desktop rail, which is deleted; the provider list still stays one column at every width, and the tablet-portrait gap closed with the rail. The landing page was rebuilt around the familiar shape — hero, city list, three steps across, four promises across, closing action — and its `<h1>` now names the reader's situation rather than a place. `/nase-obecanje` still states the four promises in full with what each one rules out.

**The city expansion changed more of the frontend than it looks like it should have**, because several places used `cities[0]` as "the pilot city" — a safe shorthand at one row that silently resolved to *Dubrovnik* at seven. All fixed, and worth knowing before touching this area:

- **`CATCHMENT` in `web/lib/copy.ts` must have an entry for every city in `cities`.** Consumers fall back to `city.name`, which does not throw but produces broken Croatian in the locative — *"u Zagreb"* rather than *"u Zagrebu"*. Adding a city to the database without adding it here is a visible defect, not graceful degradation.
- **The flow carries the chosen city as `?grad=`** (`parseGrad` / `flowHref` / `resultsHref` in `web/lib/answers.ts`). Screen 2 used to discard the answer because there was nothing to remember; at seven cities that sent a family who chose Zagreb to the Dubrovnik listing. Nothing else may hand-build a flow URL.
- **`cities[0]` is not the pilot city.** The landing page and `/sto-uciniti-prvo` both counted it; both now count across every city (`getCityCoverage`, `getAllProviders`).

`/za-pogrebnike` is the **product's only form** — for funeral directors, via Netlify Forms. **Nothing links to it.** `PROVIDER_FORM_PUBLIC` in `web/lib/nav.ts` is `false`, which removes it from the menu, footer, landing page, sitemap and the two prose pages, and the page itself is `noindex`. That is a compliance gate, not a soft launch: the form collects personal data, and there is no `/privatnost` and no named controller to put in it. **Do not flip the flag until `/privatnost` exists.** Its submission path has also never executed — Netlify Forms needs a deploy — so the first deploy must include a test submission. `public/__forms.html` holds the field definitions and must stay identical to the form in `app/za-pogrebnike/page.tsx`; a field in one and not the other arrives empty with no error anywhere.

`.research/RESEARCH_market.md` (gitignored) holds the survey of comparable platforms worldwide and the monetization options, with a staged recommendation. It is research, not decisions — nothing in it is authorised beyond what the project owner has picked, and the items it flags **ask-first** stay unbuilt.

**Known gaps, deliberately deferred** (see `SPEC_frontend.md` → Known gaps): no named owner, and no contact route for anyone who is not a funeral director — the two *"javite nam"* pages now link to `/za-pogrebnike`, which closes that half only; the `planiram unaprijed` path is hidden but still wired; and the sourced Croatian guidance text — now including the promise page and the provider page — still needs a native-speaker read. Tablet portrait and the empty landing band are both closed.

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

Lives in `web/` — Next.js App Router, TypeScript, CSS Modules over a CSS-custom-property token layer, run locally against the hosted Supabase project (no deploy in Phase 1). Specified in `SPEC_frontend.md`, which is authoritative for tokens, type scale and behaviour.

Commands run from `web/`: `npm run dev`, `npm run build`, `npm run lint`, `npm test`.

Copy `web/.env.example` to `web/.env.local` and fill it from the Supabase dashboard. Only the URL and the `anon` key are needed — both are meant to ship in the browser.

**The app ships from a single origin, and that is a GDPR position, not a preference.** Fonts are self-hosted in `web/public/fonts/` rather than loaded from Google, because a Google Fonts request sends the visitor's IP to a third party on every page load — which is exactly what the product's no-cookie-banner design depends on not happening. Next.js telemetry is disabled for the same reason. **Do not add a third-party CDN, analytics script, embedded map or external icon set** — that is an Ask first decision (`SPEC.md` → Boundaries), and `log_event` to our own Supabase project is meant to remain the only outbound request the pages make.

`/specimen` is a noindex development page rendering every colour token, the full type scale and both button styles. It is not part of the product; use it to catch a drift in the visual system at a glance.

**`npm run dev` points at the production database.** There is no local database and no staging environment, so treat every query as running against real data, and never bypass the instrumentation environment guard (`SPEC_database.md` → Client-side rules) — without it, local page refreshes become the largest contributor to the `events` table.

## Design

`.design/` holds the design canvas working files and is gitignored. It contains one artboard — the chosen **Kamen** direction — as a visual specimen only. `SPEC_frontend.md` → Visual system is authoritative for tokens, type scale and behaviour; where the artboard and the spec disagree, the spec wins.
