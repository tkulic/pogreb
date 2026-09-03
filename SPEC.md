# Project Spec: Funeral Services Portal (working name)

> Status: Phase 1 — **the database schema is complete and applied** to the hosted Supabase project, including `entities.slug`, Croatian `services.slug` values, and anonymous usage logging (`events` + `log_event`). Seven Split pilot providers are loaded. The frontend is **built and running locally**, desktop layout included — see [SPEC_frontend.md](SPEC_frontend.md). The next step is expanding coverage beyond the one pilot city.
> This document is a living artifact — updated as decisions are made. See also [SPEC_database.md](SPEC_database.md) for database schema details and [SPEC_frontend.md](SPEC_frontend.md) for the frontend user story, flow and visual system.
>
> Note: the product itself targets Croatian-speaking users (Croatian market), but this spec and all engineering docs are written in English. Croatian legal/registry terms (OIB, MBS, NKD, Sudreg, obrt) are kept as-is — they're domain identifiers without a real English equivalent.

## Naming Convention

Applies to the database schema and all future code:

- **Everything not customer-facing is in English** — table names, column names, code, comments, variable names.
- **Exceptions, kept in Croatian:**
  - Genuine Croatian identifiers with no English equivalent (OIB, MBS, NKD)
  - Customer-facing data *values* — e.g. a city name ("Split"), a service display name ("Kremiranje") — since the product is Croatian-facing
  - **URL paths and any query-parameter name or value that appears in a URL** — e.g. `/pogrebne-usluge/split`, not `/funeral-directors/split`. A URL is customer-facing text: it is read by users, shown in search results, and indexed. Croatian keywords in the path also carry real SEO weight for a product whose entire distribution channel is Croatian-language search
- Everything else — `entities`, `services`, `entity_type`, `data_source`, `working_hours`, etc. — is English, including enum values that aren't themselves a Croatian proper term (e.g. `manual`, not `rucno`). Croatian legal-form abbreviations (`doo`, `jdoo`, `obrt`, `dd`) are kept as-is since those are literally their names, not a translation choice. They're written without dots, so the values stay usable as URL and filter parameters — the dotted display form (`d.o.o.`) is a frontend concern.

## Objective

The Croatian funeral services market is fragmented — there is no aggregator that helps grieving families quickly find a trustworthy funeral director in their city. People in this situation rarely compare offers (per a CMA UK study) — they choose based on recommendation/locality, under significant time and emotional pressure, within a window of a few hours from the death.

Phase 1 goal: a free, public portal with a database of all business entities registered under the "funeral and related activities" classification (NKD 96.03), covering a pilot of 1-2 cities, giving users a fast, trustworthy, local list of funeral directors.

## Context / data sources

- **Sudski registar API** (sudreg-data.gov.hr) — public, free, OAuth client credentials. Returns OIB, MBS, name, address, legal form, status, business activities. Does not return phone/email.
- **Obrtni registar** (craft/trade registry) — the Portal Obrtnog registra RH has no public API, so obrti are looked up by hand and tagged `data_source = portor`. Records with no registry entry at all (web/phone research only) are tagged `manual`.
- In Phase 1, data is collected manually (Sudreg search + Google Maps + funeral director websites), structured, and manually entered into Supabase. **No automated scraper in this phase.**

## Phase 1 — scope

**In scope:**
- Database of business entities (companies + obrti) for 1-2 pilot cities
- Manual data entry into Supabase
- Structure prepared for future SEO pages per city
- Public read-only frontend (Next.js), run locally against the hosted Supabase project — specified in [SPEC_frontend.md](SPEC_frontend.md): user story, three-screen flow, results page and ranking rules, routing, and the **Kamen** visual system. Built, including the desktop layout
- **Anonymous usage logging** — per-provider view and click counts, via the `events` table and the `log_event` function. See [SPEC_database.md](SPEC_database.md) → Usage logging. In scope because a free portal with no usage signal cannot tell *"nobody needs this"* from *"nobody found it"*, and those imply opposite next moves. Per-provider click counts are also the evidence base for any future pay-per-lead pricing, so the data belongs in Postgres alongside `entities` rather than in a third-party analytics silo

**Out of scope (deliberately deferred):**
- Monetization (pay-per-lead, premium listing)
- Account system for funeral directors (Supabase Auth + RLS) — schema prepares `owner_id`, but the flow itself is not being built
- Lead form / Twilio call tracking — anonymous click logging *is* in scope (above); what stays out is anything that captures who the user is or routes their call
- Automated sync with Sudreg
- Netlify deploy / public launch — the Phase 1 frontend runs locally against the hosted Supabase project. Deploying is a separate decision, not folded into building the pages

## Tech Stack

- Frontend: Next.js — next build step, run locally in Phase 1
- Hosting: Netlify (planned, deferred — see Out of scope)
- Database / auth: Supabase (Postgres). The public write path is a `security definer` Postgres function, not a server runtime — so Phase 1 ships **one Next.js app and one Supabase project**, with no separate backend service to build or deploy

## Project Structure

```
SPEC.md, SPEC_database.md,
SPEC_frontend.md            specs — source of truth
RESEARCH_market.md          comparable platforms worldwide, and
                            monetization options — research, not decisions
CLAUDE.md                   agent working rules
web/                        the Next.js app
  app/                      App Router routes
  lib/                      env, Supabase client, database types
  public/fonts/             self-hosted Spectral SC + Archivo, with their OFL licences
  .env.example              frontend env vars to copy to web/.env.local
supabase/
  config.toml               CLI config, linked to the hosted project
  migrations/               SQL migrations (applied via `supabase db push`) — gitignored
data/                       curated pilot CSVs, imported via Studio — gitignored
.tools/                     local Supabase CLI binary — gitignored
.design/                    design canvas working files — gitignored
```

The Supabase CLI runs without Docker (no local database) — migrations are pushed straight to the hosted project.

**The app ships from one origin.** Fonts are self-hosted rather than loaded from Google, because a Google Fonts request sends the visitor’s IP to a third party on every page load — the same reasoning that keeps the product free of a consent banner ([SPEC_frontend.md](SPEC_frontend.md) → Typography). Next.js telemetry is disabled for the same reason. Adding any third-party asset host, analytics script or embedded map is an **Ask first** decision with a GDPR consequence, not a build detail.

## Boundaries

**✅ Always:**
- Every database schema change goes through the spec (`SPEC.md` / `SPEC_database.md`) before it's written as SQL or applied to the hosted project
- Personal/business data (OIB, contact details) is handled GDPR-consciously — collect only what's necessary for a public listing, from sources already public (Sudreg) or given directly by the business
- `log_event` is the **only** write path exposed to the public. Any future public write goes through a `security definer` function, never through an RLS INSERT policy on a table — the `anon` key is public, so an INSERT policy is an open door (see [SPEC_database.md](SPEC_database.md) → Why a function rather than an RLS INSERT policy)
- Usage logging stores **no personal data**: no IP address (not even hashed or truncated), no raw user-agent, no referrer URL, no session or visitor identifier, no cookie or `localStorage` value. This is a design invariant, not a default to be relaxed — it is what keeps the portal free of a consent banner and keeps `events` outside the scope of GDPR subject-access and erasure rights. It is also why the portal has no unique-visitor count, an accepted trade

**⚠️ Ask first:**
- Database schema changes (new table, new column, type change)
- Running a migration or any command that changes the live hosted database — there's no staging environment, so this always touches production
- Deleting or bulk-overwriting existing rows, including during data re-import
- Introducing a new external integration (Twilio, payment provider, mapping API, new hosting service)
- Any change to the Sudreg sync approach (e.g. moving to automated sync)
- Activating the multi-tenant/auth flow or any new RLS write policy
- Adding any column to `events` that could identify or fingerprint a visitor, or storing a raw referrer, raw user-agent, or IP — this reopens a GDPR question that the current design closes
- Force-pushing or rewriting git history

**🚫 Never:**
- Automated scraping of the Obrtni registar (no public API — manual entry is a deliberate decision, not a temporary workaround)
- Charging users/funeral directors in Phase 1
- Committing secrets/API keys (Sudreg OAuth credentials, Supabase `service_role` key, DB password) to the repo
- Using the Supabase `service_role` key in any client-side/frontend code — it bypasses RLS entirely, unlike the public `anon` key
- Running destructive SQL (DROP, TRUNCATE, DELETE without a WHERE clause) without explicit confirmation
- Fabricating/guessing business data (phone, email, working hours, pricing) without a verified source

## Success Criteria (Phase 1)

- Supabase schema defined and implemented, covering both companies and obrti
- At least 1 pilot city has a fully manually-entered list of active funeral directors (entities under NKD 96.03)
- Every record has a clear `data_source` (sudreg/manual) and `last_verified_at` date
- Schema is ready to support, without breaking changes: an SEO page per city, future owner account activation, future filtering by service type
- **Usage is measurable and the numbers are quotable** — `events` records per-provider `detail_view` and `phone_click` counts, and `phone_click` is bot-resistant by construction (see [SPEC_database.md](SPEC_database.md) → Data integrity). A count nobody would believe is not a success criterion met

## Future considerations (deliberately deferred, not being built now)

- **History/audit table** — tracking changes to entity status/activity over time, relevant once an automated sync pipeline is introduced. Not part of Phase 1.
- Automated Sudreg sync (currently manual entry)
- Activation of multi-tenant auth/RLS policies (owner_id exists from the start as nullable, but the flow comes later)
- Possible migration of coordinates to a PostGIS `geography` type if proximity search is needed ("funeral directors near me")
- **`events` rollup + retention** — a `(entity_id, month, event_type, count)` summary table, plus deletion of raw rows older than ~13 months. Purely a size decision: the rows hold no personal data, so GDPR imposes no retention deadline. At pilot volume this is years away (see [SPEC_database.md](SPEC_database.md) → Size budget).
- **Per-card list impressions** — an impression event per listing shown, giving a true "seen vs. clicked" rate per provider. Deferred: it multiplies write volume by roughly the number of cards per page view. Adding an enum value later (`alter type event_type add value …`) is a one-liner and leaves existing rows valid, so this stays cheap to revisit.
