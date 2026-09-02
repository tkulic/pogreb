# SPEC: Database

> Spec module — database schema details for the funeral services portal. See [SPEC.md](SPEC.md) for broader project context and Phase 1 scope.
>
> Status: **the whole schema in this document is implemented and applied to the hosted Supabase project** — the four content tables, `entities.slug`, the Croatian `services.slug` values, and all of **Usage logging** (`events` + `log_event`, its enums, index, RLS and grants). Applied 2026-09-02. SQL lives in `supabase/migrations/`; this document stays the source of truth for intent, the migrations for exact DDL.
>
> **Naming convention:** table/column names and code are in English. Croatian appears only for (a) genuine Croatian identifiers with no English equivalent — OIB, MBS — and (b) customer-facing data values (city names, service display names). See [SPEC.md](SPEC.md) → Naming Convention.

## Tables

### `cities`

| field | type | constraint | note |
|---|---|---|---|
| id | uuid | PK | |
| name | text | not null | e.g. "Split" — customer-facing value |
| slug | text | unique, not null | e.g. "split" — for URL `/pogrebne-usluge/split`. Croatian path, per [SPEC.md](SPEC.md) → Naming Convention |
| county | text | | grouping / future regional pages |
| created_at | timestamptz | default now() | |

### `entities`

| field | type | constraint | note |
|---|---|---|---|
| id | uuid | PK | |
| name | text | not null | business name |
| slug | text | not null, unique **per city** — `unique (city_id, slug)` | URL segment for the detail page: `/pogrebne-usluge/split/cagalj`. Derivation rule below. **Stored, never re-derived at query time**, so renaming a business does not silently break inbound links or invalidate indexed lookups |
| oib | text | unique, not null | Croatian personal/business tax ID — natural dedup key. For obrti, OIB belongs to the owner — edge case if one person runs 2 obrti, accepted risk for the pilot |
| mbs | text | nullable | Matični broj subjekta (Croatian court registry number) — only for legal entities from Sudreg, obrti don't have one |
| entity_type | enum | not null | `doo`, `jdoo`, `obrt`, `dd` — actual Croatian legal-form names, kept as-is (dotless, so the values stay usable as URL/filter params) |
| data_source | enum | not null | which registry the record came from: `sudreg` = Sudski registar (companies), `portor` = Portal Obrtnog registra RH (obrti), `manual` = web/phone research with no registry record. `portor` records are looked up by hand — the portal has no API and scraping it is a Never-tier boundary (see SPEC.md) |
| address | text | | street and house number as one field (manual entry, splitting adds no benefit at this stage) |
| city_id | uuid | FK → cities.id, not null, on delete restrict | a city with entities attached cannot be deleted |
| postal_code | text | nullable | |
| phones | jsonb | nullable | ordered array, first entry is the primary number — see shape below. Sudreg returns no contact numbers, so always manual entry |
| email | text | nullable | |
| website | text | nullable | |
| latitude | double precision | nullable | preparation for map integration |
| longitude | double precision | nullable | preparation for map integration |
| available_24_7 | boolean | default false | |
| working_hours | jsonb | nullable | see shape below |
| logo_url | text | nullable | URL to Supabase Storage |
| owner_id | uuid | FK → auth.users, nullable, on delete set null | preparation for future multi-tenant, unused in Phase 1. Deleting the auth user releases the claim, it doesn't delete the business |
| last_verified_at | timestamptz | | when the record was last verified/updated (business field, whole-record provenance) |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now() | maintained by a `before update` trigger (`set_updated_at()`), not just the insert default |

**Indexes:** `city_id` (FK lookup for city listing pages). `oib` and `cities.slug` are indexed implicitly by their unique constraints. The composite `unique (city_id, slug)` constraint indexes `(city_id, slug)` in exactly the order the detail-page lookup needs (`where city_id = ? and slug = ?`), so no extra index is required.

**Deriving `entities.slug`** — applied by hand at data entry, once per provider:

1. Transliterate Croatian diacritics: č→c, ć→c, ž→z, š→s, đ→d.
2. Drop the legal-form suffix (`d.o.o.`, `j.d.o.o.`, `d.d.`).
3. Drop a leading generic descriptor — `Pogrebne usluge`, `Pogrebno društvo`, `Trgovačko društvo` — when one is present. The path prefix `/pogrebne-usluge/` already carries it, and repeating it (`/pogrebne-usluge/split/pogrebne-usluge-cagalj`) reads badly while adding no SEO value: keyword repetition in a path does not rank.
4. Lowercase, spaces and punctuation to hyphens.

Worked examples from the Split pilot: `Pogrebne usluge Čagalj, d.o.o.` → `cagalj`; `Trgovačko društvo Lovrinac d.o.o.` → `lovrinac`; `Bradvica d.o.o.` → `bradvica`; `Pogrebne usluge Aničić` → `anicic`; `Pogrebne usluge Zec` → `zec`.

**Why unique per city, not globally.** The detail URL already contains the city, so the city is part of the identifier — global uniqueness would be over-constrained. It matters as soon as a second city is added: short surname-derived slugs collide easily across cities (a `Zec` in Zagreb is entirely plausible), and a global constraint would force an artificial suffix on a provider for a name clash the URL structure never actually has.

**Note:** no `status` field — the table holds only active entities by convention. Tracking status changes over time is deferred to a future history/audit table (see SPEC.md → Future considerations), out of Phase 1 scope.

**Shape of `working_hours` (jsonb):**
```json
{
  "mon": { "from": "08:00", "to": "16:00" },
  "tue": { "from": "08:00", "to": "16:00" },
  "wed": { "from": "08:00", "to": "16:00" },
  "thu": { "from": "08:00", "to": "16:00" },
  "fri": { "from": "08:00", "to": "16:00" },
  "sat": { "closed": true },
  "sun": { "closed": true }
}
```

A day takes one of three forms: `{"from","to"}` for fixed hours, `{"closed": true}`, or `{"by_arrangement": true}` for "po dogovoru". A day that is **absent** means unknown — deliberately distinct from closed, since wrongly showing "closed" is worse than showing nothing for a family that needs a provider now.

**Shape of `phones` (jsonb):**
```json
[
  { "number": "+385992128446", "type": "emergency" },
  { "number": "+38521389890",  "type": "office" }
]
```

Ordered array, first entry is primary. `type` is one of `office`, `mobile`, `emergency` — English, since it drives frontend logic rather than being displayed verbatim. Fax numbers are not collected. Numbers are stored in E.164 (`+385…`) so they work directly in `tel:` links and future call tracking.

**Head office only.** A row represents a provider at its head office. Branch locations are not stored — not their addresses, phones, or emails. Several pilot providers operate branches (Bradvica in Kaštel Sućurac and Kaštel Novi, Lovrinac across four Split locations); only head-office contact data is recorded. When a provider's material makes the head office ambiguous, ask rather than guessing.

Providers publish numbers in inconsistent local formats (`021 389 890`, `+385021389890`, `098/222-770`) — note the second is malformed, keeping the trunk `0` after the country code. All are normalised to E.164 on entry.

Nearly every provider has more than one number, and the distinction carries real weight: after hours the office line is useless and the `emergency` line is the entire value of the listing. That's also why this is jsonb rather than a join table — unlike `services`, phone numbers are only ever displayed, never filtered on.

### `services`

| field | type | constraint | note |
|---|---|---|---|
| id | uuid | PK | uuid, for consistency with the other tables' primary keys |
| name | text | not null | "Kremiranje", "Ekshumacija", "Prijevoz u inozemstvo", ... — customer-facing display value, stays Croatian |
| slug | text | unique, not null | URL segment for a service-filtered listing, e.g. `kremiranje`. Croatian with diacritics transliterated — same rule as `entities.slug`, per [SPEC.md](SPEC.md) → Naming Convention |

### `entity_services` (join table, many-to-many with attributes)

| field | type | constraint | note |
|---|---|---|---|
| entity_id | uuid | FK → entities.id, on delete cascade | removing an entity removes its service/pricing rows |
| service_id | uuid | FK → services.id, on delete restrict | `services` is a curated lookup — a service still in use can't be deleted out from under providers' pricing |
| price_from | numeric | nullable | null = not specified |
| price_to | numeric | nullable | null = single price or unknown upper bound |
| note | text | nullable | free-text note, e.g. "price depends on casket choice" |
| PK | | (entity_id, service_id) | |

**Index:** `service_id` — the composite PK is `(entity_id, service_id)`, so it can't serve the "which providers offer service X" lookup on its own.

Price is per (entity, service) pair, so it lives on the join table itself. Gives real FK integrity on `service_id` and makes price queries trivial (`WHERE service_id = X AND price_from <= 3000`) instead of JSON-path queries. Trade-off vs. a jsonb field: manual entry means N rows per entity in the Supabase table editor instead of one.

### `events`

Anonymous usage log — one row per user interaction with a provider listing. Written **only** by the `log_event` function (see Usage logging below); never by the frontend directly.

| field | type | constraint | note |
|---|---|---|---|
| id | bigint | PK, `generated always as identity` | **deliberately not uuid**, unlike every other table here. Random uuids scatter inserts across the index and bloat an append-only table; a monotonic bigint appends cleanly and is half the width. Side benefit: `order by id` ≈ `order by occurred_at`, so no separate time index is needed |
| entity_id | uuid | FK → entities.id, not null, on delete cascade | every row is attributable to exactly one provider — that is the table's only job. The FK doubles as validation: `log_event` cannot record a click for a provider that does not exist. `cascade` means removing a provider removes their history (accepted — Phase 1 has no delete flow) |
| occurred_at | timestamptz | not null | **truncated to the hour** by `log_event`, stored UTC. Not a client parameter |
| event_type | enum `event_type` | not null | `detail_view`, `phone_click`, `website_click`, `email_click` |
| source | enum `event_source` | not null | traffic attribution, bucketed: `search`, `direct`, `social`, `referral`, `internal`, `unknown`. Derived server-side |
| device | enum `event_device` | not null | `mobile`, `desktop`, `tablet`, `unknown`. Derived server-side |

**Index:** `(entity_id, occurred_at)` — serves both the core reporting query (one provider's counts over time) and the hourly rate-limit check inside `log_event`. No index on `occurred_at` alone.

Six columns, all fixed-width, no `text` column anywhere — which is what keeps the row at ~116 bytes (see Size budget).

**No `city_id`.** It is reachable via `entities.city_id`, and with a pilot of 1–2 cities that join costs nothing. Denormalising it would add 16 bytes per row for no query it enables.

**No visitor identifier of any kind** — see [SPEC.md](SPEC.md) → Boundaries. The consequence is that questions requiring per-visit continuity (unique visitors, funnels, click paths, session length) are unanswerable by design, not merely unimplemented. The per-provider `detail_view` → `phone_click` ratio is still available, and that is the figure the pitch rests on.

**Enum values are English**, per [SPEC.md](SPEC.md) → Naming Convention: they drive query and frontend logic rather than being displayed to users. Enums rather than `text` for three reasons — 4 bytes each instead of ~15, invalid values become impossible, and a new value is a one-line `alter type … add value` that leaves existing rows valid.

## Seed data: `services`

| name | slug | replaces (original English slug) |
|---|---|---|
| Organizacija pogreba | `organizacija-pogreba` | `funeral-organization` |
| Kremiranje | `kremiranje` | `cremation` |
| Prijevoz pokojnika | `prijevoz-pokojnika` | `deceased-transport` |
| Međunarodni prijevoz pokojnika | `prijevoz-pokojnika-inozemstvo` | `international-transport` |
| Ekshumacija | `ekshumacija` | `exhumation` |
| Balzamiranje | `balzamiranje` | `embalming` |
| Lijesovi | `lijesovi` | `caskets` |
| Urne | `urne` | `urns` |
| Cvjetni aranžmani | `cvjetni-aranzmani` | `flowers` |
| Osmrtnice i tiskane objave | `osmrtnice` | `obituary-printing` |
| Klesarske usluge / nadgrobni spomenici | `nadgrobni-spomenici` | `gravestones` |
| Uređenje i održavanje groba | `uredenje-groba` | `grave-maintenance` |
| Sređivanje dokumentacije | `sredivanje-dokumentacije` | `document-handling` |
| Oblačenje i uređivanje pokojnika | `uredivanje-pokojnika` | `deceased-preparation` |
| Organizacija glazbe | `glazba-na-pogrebu` | `funeral-music` |
| Fotografiranje i snimanje | `fotografiranje-pogreba` | `funeral-photography` |

Slugs are Croatian because they appear in URLs ([SPEC.md](SPEC.md) → Naming Convention), with diacritics transliterated (đ→d, ž→z, č→c, ć→c, š→s) so no path segment needs percent-encoding.

Where a slug is shorter than its display name, it is cut toward the phrase people actually search rather than a literal transliteration: `osmrtnice` over `osmrtnice-i-tiskane-objave`, `nadgrobni-spomenici` over `klesarske-usluge`. One slug diverges from its name outright — `prijevoz-pokojnika-inozemstvo` for "Međunarodni prijevoz pokojnika" — because *"prijevoz pokojnika u inozemstvo"* is the natural phrasing. These are judgements about phrasing, not keyword-volume data; worth a native-speaker sanity check.

The rename replaced the English slugs seeded in `20260827073807_initial_schema.sql`. That migration is applied and **must not be edited**, so the change went into `20260902102000_services_slug_croatian.sql` as 16 `update services set slug = … where slug = …` statements, keyed on the old slug (unique and stable), followed by a guard that raises if any English slug survives — a half-renamed lookup table would leave the frontend 404-ing on that service's URL with no other symptom. Nothing referenced `services.slug`: `entity_services` joins on `service_id` (uuid), and no frontend existed yet, so the rename broke nothing.

The last four were added after the Split pilot research: each recurs across multiple providers and none mapped to the original twelve. `uredivanje-pokojnika` (oblačenje i uređivanje) is deliberately distinct from `balzamiranje` — Croatian providers offer the former routinely and the latter appears nowhere in the pilot.

## Usage logging: the `log_event` function

`events` is written exclusively by `log_event` — a `security definer` Postgres function exposed over PostgREST as RPC. There is no HTTP endpoint, no Edge Function and no server runtime involved: the write path is a database feature, so click logging adds **no deployment artifact**. Phase 1 remains one Next.js app plus one Supabase project.

### Why a function rather than an RLS INSERT policy

The `anon` key ships in the browser and is public by design. An INSERT policy on `events` would let anyone holding it write arbitrary rows — fabricated `entity_id`s, backdated timestamps, invented `source` values — into the one dataset whose entire value is being trustworthy. A `security definer` function inverts the posture: `anon` receives **no table privileges at all** and can only call `log_event(entity_id, event_type)`. Every other column is decided server-side.

It also avoids the `service_role` key. That key bypasses RLS entirely and must never reach client code ([SPEC.md](SPEC.md) → Never). Routing the write through a function means it is never needed anywhere in the stack — turning that rule from something to remember into something structurally impossible to violate.

### Signature

```sql
create function public.log_event(
  p_entity_id  uuid,
  p_event_type event_type
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
```

`set search_path` is mandatory hardening on any `security definer` function — without it, a caller-controlled search_path can redirect the function's table references to objects the caller owns.

Note what is *not* a parameter: `occurred_at`, `source` and `device`. The client cannot assert them.

### Derived server-side

The function reads request headers via `current_setting('request.headers', true)::json`, which PostgREST populates per request.

| column | derived from | rule |
|---|---|---|
| `occurred_at` | `now()` | `date_trunc('hour', now())` — the client cannot backdate |
| `device` | `user-agent` header | contains `ipad`/`tablet` → `tablet`; else contains `mobile`/`android`/`iphone` → `mobile`; otherwise `desktop`; header absent → `unknown`. **The raw string is never stored** |
| `source` | `referer` header | host matched against the buckets below; header absent → `direct`; present but unparseable → `unknown`. **The raw referrer is never stored** |

`source` buckets:

| bucket | referrer host |
|---|---|
| `internal` | the portal's own host — `pogreb.net` and any subdomain, plus `localhost`, `127.0.0.1`, `[::1]` |
| `search` | `google.`, `bing.`, `duckduckgo.`, `yahoo.`, `ecosia.` |
| `social` | `facebook.`, `instagram.`, `linkedin.`, `reddit.`, `t.co`, `x.com` |
| `referral` | any other host |
| `direct` | no `referer` header |
| `unknown` | header present, not parseable as a host |

**Two details settled at implementation time**, both recorded here because they change what the buckets mean:

- **Host patterns are anchored**, matched as `(^|\.)google\.` rather than as a bare substring. A substring match is spoofable by a lookalike domain, and one case was live: the literal `t.co` matches inside `not.com`, which would have bucketed an unrelated referrer as `social`.
- **`internal` recognises the production domain and the local origins.** The domain is **`pogreb.net`**, matched as `(^|\.)pogreb\.net$` so it covers the apex, `www`, and any future subdomain while a lookalike like `notpogreb.net` cannot claim to be internal. `localhost` is kept alongside it, because Phase 1 runs locally against this same database ([SPEC.md](SPEC.md) → Out of scope), so both origins are real traffic. Added in `20260902143000_log_event_production_host.sql`; if the domain ever changes, that branch is the only thing to update, and a function body cannot be patched — it goes in a new migration as another `create or replace`.

Bucketing in the function rather than storing the host keeps cardinality at 4 bytes and guarantees no URL — and therefore no third-party search term or path — is ever persisted.

`source` is the crux of any future pay-per-lead conversation: it is the difference between *"you got 34 calls"* and *"you got 34 calls, and 82% of those families arrived from Google rather than from your own website"*. Without attribution a provider can simply claim they would have won the customer anyway.

### Data integrity

The function **silently discards** a call — plain `return`, never `raise` — in two cases. Silence is deliberate: an error reveals that filtering exists and can trigger client-side retries.

1. **Self-identified bots.** `user-agent` matched case-insensitively against `bot|crawl|spider|slurp|headless|preview|monitor|curl|wget|python-requests|okhttp`. This catches honest crawlers and link-preview unfurlers, which are the *volume* problem. It does not catch a bot that lies about its UA — that is rule 2's job.
2. **Hourly cap per target.** If `(entity_id, event_type, date_trunc('hour', now()))` already holds **60** rows, discard. This is the defence against deliberate inflation, and it needs no visitor identifier because it caps the *target* rather than the source. A pilot-city funeral home will never legitimately see 60 phone clicks in one hour, so the cap converts an unbounded integrity failure into a bounded, visible anomaly. Cost is one indexed range scan on `(entity_id, occurred_at)`.

Rule 2 matters more over time, not less: once click counts drive pay-per-lead pricing, a provider has direct financial motive to inflate their own.

**Rejection is deliberately narrow.** Only provably worthless traffic is dropped at write time, because a write-time rejection is irreversible — you can never afterwards audit whether the filter was too aggressive. Everything ambiguous is stored and filtered at query time, where the decision stays revisable. There is ample room for this (see Size budget).

### Client-side rules (binding on the frontend)

Each of these closes a pollution source that **no amount of server-side filtering can recover from**. They are requirements, not preferences.

1. **Log `detail_view` from the client, never from the Server Component.** Logging during server render would write a row for every non-JS crawler, every Slack/WhatsApp link-preview fetch, every uptime check — and, worst, every **Next.js `<Link>` prefetch**, which renders the detail route for pages the user merely hovered over. That would silently inflate exactly the providers drawing the most attention. A `useEffect` after mount is immune to all four: prefetch fetches the RSC payload without mounting client components.
2. **Guard on environment.** Log only when running as production on the real host — `process.env.NODE_ENV === 'production'` **and** a hostname check. There is no staging environment and `npm run dev` points at the production database, so without this guard the developer's own page refreshes would be the single largest contributor to the table in month one.
3. **Gate clicks on `event.isTrusted`.** It is `false` for scripted `element.click()` — a free filter against naive automation.
4. **Fire and forget.** Call `supabase.rpc('log_event', { p_entity_id, p_event_type })` without awaiting it in the user's path, and swallow errors. A failed log must never delay or break a `tel:` link — the call is the point, the metric is not. `sendBeacon` is unnecessary: `tel:` hands off to the dialer without unloading the page, and external links open in a new tab.
5. **One log per mount.** Guard against React StrictMode's double-invoked effects and against re-renders, or every view is double-counted in development.

### What the numbers are worth

`phone_click` is the resilient metric and the one to quote: it requires a deliberate gesture on a link that opens a dialer, which crawlers do not perform. `detail_view` is a page load — cheap, automatable, and the softer figure. The most valuable column is therefore also the hardest to forge.

`source = 'direct'` on a `detail_view` is a useful retroactive suspicion signal: real users almost always reach a provider page from the city list (`internal`) or from search, rarely by landing on a deep URL with no referrer.

For an external pitch, corroborate rather than trust. Google Search Console gives an independent, already-bot-filtered view of top-of-funnel traffic; and asking a pilot provider whether their call volume changed is the only ground truth showing that clicks became actual business.

**Deliberately not used:** captcha / Turnstile on contact links. A family in the first hours after a death must not meet a challenge widget, and the hourly cap already bounds the abuse it would defend against.

### Size budget (Supabase free tier)

The free tier allows **500 MB** of database space. Per event:

| bytes | |
|---|---|
| 24 | tuple header + null bitmap |
| 4 | line pointer |
| 8 | `id` |
| 16 | `entity_id` |
| 8 | `occurred_at` |
| 12 | three enums, 4 bytes each |
| ~40 | index entry on `(entity_id, occurred_at)` |
| **~116** | **per event, all in** |

Reserving 200 MB for `events` allows roughly **1.8 million rows**. On the demand side: Split is ~180k people, and Croatia records ~55k deaths against a ~3.85M population, so the city sees on the order of **2,500 deaths per year**. Even if the portal reached every bereaved family and each generated ~10 events, that is ~25k events/year — about 1.5% of the budget annually.

Size is not the binding constraint, which is precisely why write-time rejection can afford to be narrow. Rollup and retention are deferred ([SPEC.md](SPEC.md) → Future considerations).

⚠️ **The free-tier limit that does bite is project pausing:** a free Supabase project suspends after roughly a week without requests, taking the site down with it. Relevant for a low-traffic pilot, and worth knowing before launch rather than after.

⚠️ **Timezone.** `occurred_at` is UTC; convert with `at time zone 'Europe/Zagreb'` in every reporting query. "After hours" is a local-time concept and Croatia observes DST — this is the standard way the strongest pitch line (*"31% of your phone clicks arrived outside your posted office hours"*, which directly monetises the `emergency` phone type and `available_24_7`) comes out wrong.

## Row Level Security (RLS)

RLS is enabled on all five tables (`cities`, `entities`, `services`, `entity_services`, `events`).

**Policies:**

| table | role | operation | policy |
|---|---|---|---|
| `cities` | `anon`, `authenticated` | SELECT | allowed, unrestricted |
| `entities` | `anon`, `authenticated` | SELECT | allowed, unrestricted |
| `services` | `anon`, `authenticated` | SELECT | allowed, unrestricted |
| `entity_services` | `anon`, `authenticated` | SELECT | allowed, unrestricted |
| `events` | `anon`, `authenticated` | SELECT | **no policy — the log is not readable through the API at all** |
| all five | `anon` / `authenticated` | INSERT / UPDATE / DELETE | **no policy — no one can write via the API in Phase 1** |

`events` is the one table with **no read access**. Two reasons: the `anon` key is public, so a SELECT policy would let any visitor — including a competing provider — read every provider's click counts; and those counts are the evidence base for future pay-per-lead pricing. The log is written through `log_event` and read only via privileged Studio / CLI access.

**Grants** (RLS alone is not sufficient — table privileges are a separate layer):

```sql
revoke all on table public.events from anon, authenticated;
grant execute on function public.log_event(uuid, event_type) to anon, authenticated;
```

`execute` is granted to `authenticated` too, for the same reason SELECT is below — logging must not silently stop the day auth is switched on.

SELECT is granted to `authenticated` as well as `anon`, even though Phase 1 has no login: a logged-in user's requests run as `authenticated`, so an `anon`-only policy would show them an empty site the moment auth is switched on. The listings are public either way — this is not a widening of access, just the same public read for both roles.

All Phase 1 data entry (schema + CSV import) happens through the project owner's privileged Supabase Studio / CLI access, which bypasses RLS entirely — not through the public API.

**Future (Phase 2+, not built now):** once the account system exists, add a scoped write policy such as "`authenticated` can UPDATE `entities` where `owner_id = auth.uid()`" — that becomes the real write gate, tied to login rather than to which client is calling.

## Migrations

| file | contents |
|---|---|
All applied. Nothing is pending.

`supabase/migrations/` is **gitignored** — the SQL is local to the project owner's machine and is not in the repo. So this document, not the migration files, is the durable record of the schema: it must stay complete enough to reconstruct the DDL, and any change applied to the hosted project belongs here in the same pass. The live database is the other copy, recoverable with `supabase db dump`.

| file | contents |
|---|---|
| `20260827073807_initial_schema.sql` | enums, four tables, `services` seed data, RLS enabled + public SELECT policies |
| `20260827103720_schema_corrections.sql` | enum values corrected to match this spec, `set_updated_at()` trigger, `service_id` index, FK delete behaviour, SELECT extended to `authenticated` |
| `20260827105959_seed_split_pilot.sql` | Split city row and the first six pilot providers |
| `20260827114336_split_services_and_corrections.sql` | `entity_services` rows for four providers, address/contact corrections, `available_24_7` fixes |
| `20260827115739_add_anicic_rename_zec.sql` | seventh provider (Aničić); Adepto renamed to its trading name "Pogrebne usluge Zec" |
| `20260827123240_phones_jsonb_and_cagalj.sql` | `phone` text → `phones` jsonb; Bradvica and Čagalj corrections and services |
| `20260902101500_entities_slug.sql` | `entities.slug` — added nullable, backfilled for all seven, then `not null` + `unique (city_id, slug)` |
| `20260902102000_services_slug_croatian.sql` | the 16 `services.slug` renames to Croatian, with a guard that raises if any English slug survives |
| `20260902102500_events_and_log_event.sql` | `event_type` / `event_source` / `event_device` enums; `events` table and its index; `log_event()`; RLS enabled on `events` with no policies; the grants above |
| `20260902143000_log_event_production_host.sql` | `log_event()` replaced to add `pogreb.net` to the `internal` source bucket |

**Ordering constraint, as implemented:** `entities.slug` is `not null` with a composite unique constraint and seven pilot rows already existed, so it was added nullable, backfilled keyed on `oib` — stable, unlike `name`, which carries the trading-name changes from `20260827115739` — and only then constrained. `set not null` is the guard: it would have failed and rolled back the migration had any row been missed.

Note on the first migration: it was edited after it had already been applied to the hosted database. Supabase tracks applied migrations by version rather than content, so the edit never reached production — the corrective migration exists to close that gap. **An applied migration must not be edited in place; corrections go in a new migration.**

## Open questions

None outstanding against the schema.

### Resolved

- ~~**URL namespace collision between entity and service slugs.**~~ Both wanted the same shape — `/pogrebne-usluge/split/cagalj` for a provider, `/pogrebne-usluge/split/kremiranje` for a service listing — with nothing constraining `entities.slug` and `services.slug` against each other. Resolved in [SPEC_frontend.md](SPEC_frontend.md) → Routing and URLs by segmenting the namespace: indexable service listings live at `/pogrebne-usluge/{grad}/usluga/{usluga}`, and flow/filter state stays in query parameters. The literal `usluga` segment makes the collision structurally impossible rather than accidentally absent, so a future provider named "Urne" is harmless. No schema change was involved either way.

- ~~**`services.slug` language.**~~ Renamed to Croatian in `20260902102000_services_slug_croatian.sql`; see [Seed data](#seed-data-services).

## Next step

The schema is complete and applied. What remains is not database work:

1. **Build the frontend** per [SPEC_frontend.md](SPEC_frontend.md). The client-side rules above are binding on it.
2. **Data quality, ongoing** — `working_hours` is populated for roughly one of seven providers, and it drives the open-now status and the after-hours phone selection. This degrades the frontend rather than blocking it.
