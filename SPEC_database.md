# SPEC: Database

> Spec module — database schema details for the funeral services portal. See [SPEC.md](SPEC.md) for broader project context and Phase 1 scope.
>
> Status: **the whole schema in this document is implemented and applied to the hosted Supabase project** — the four content tables, `entities.slug`, the Croatian `services.slug` values, and all of **Usage logging** (`events` + `log_event`, its enums, index, RLS and grants), applied 2026-09-02; and **City-level logging** (`city_events` + `log_city_event`), applied 2026-09-21. SQL lives in `supabase/migrations/`; this document stays the source of truth for intent, the migrations for exact DDL.
>
> **Applied (2026-09-24):** `20260924120000_entry_referrer_attribution.sql` — `source` is now derived from a client-passed entry referrer instead of the RPC's own `referer` header, which had made it `internal` on 100% of rows. See **Attribution**. **Rows written before this date carry no attribution information and must be excluded from any `source` breakdown**, not read as "all internal".
>
> **Applied (2026-09-03):** the six-city pilot expansion — Zagreb, Rijeka, Zadar, Osijek, Pula, Dubrovnik. Six `cities` rows, 38 `entities`, 163 `entity_services`, two additions to the `services` lookup, and two corrections to the Split rows. No schema change: every migration is data. Curated source data and the full provenance trail live in `data/` (gitignored). The conventions those migrations follow are recorded in this document, marked *(2026-09-03)*. The hosted database now holds seven cities, and the frontend reads them — see [SPEC_frontend.md](SPEC_frontend.md) → Landing page and Screen 2.
>
> **Applied (2026-09-07):** the Split i okolica coverage expansion — **six new `entities` and 26 `entity_services`**, all under the existing `split` city row, plus five corrections to the seven pilot rows. No schema change; every migration is data. All seven live Split rows had sat in Split city proper while `CATCHMENT.split` claimed eight surrounding settlements, so the coverage claim rested on inference; four of those settlements now have providers of their own — Trogir (3), Kaštela (2), Solin (1), Omiš (1). Research, exclusions and the five decisions behind it are in `data/SPLIT_OKOLICA_REVIEW.md` (gitignored). As of that migration the hosted database held **seven cities and 51 providers** — Zagreb 20, **Split 13**, Rijeka 6, Zadar 5, Osijek 3, Pula 2, Dubrovnik 2 — and **254 `entity_services`**.

> ⚠️ **It no longer does, and nothing here records the change.** Read live on 2026-09-16 the database holds **nine cities and 55 providers**: Zagreb 17, Split 13, Rijeka 5, **Velika Gorica 5**, **Slavonski Brod 4**, Zadar 4, Osijek 3, Pula 2, Dubrovnik 2. Two cities were added *and* Zagreb, Rijeka and Zadar each lost rows (20→17, 6→5, 5→4). **No migration for any of it appears in [Migrations](#migrations)** — which is precisely the failure mode this document warns about, since `supabase/migrations/` is gitignored and this table is the only record that exists in the repo. Whoever made the change should add the entries; nobody else can reconstruct them, and they must not be guessed. `CATCHMENT` in `web/lib/copy.ts` did get entries for both new cities, so the frontend rule held.
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
| oib | text | unique, not null | Croatian personal/business tax ID — natural dedup key. For obrti, OIB belongs to the owner — edge case if one person runs 2 obrti, accepted risk for the pilot. **One deliberate exception (2026-09-03):** see *A podružnica under its holding's OIB* below |
| mbs | text | nullable | Matični broj subjekta — the **9-digit** commercial-court registry number, prefixed by the registering court (Zagreb `080…`, Split and Zadar `060…`, Rijeka and Pula `040…`, Osijek `030…`). Only for legal entities; obrti don't have one, and for them the column instead stays null (their MBO is not stored). **Not** the 8-digit DZS *matični broj* (MB) — a distinct identifier that the commercial aggregators frequently conflate with it, one even labelling the field "MB (MBS)". The four Split rows seeded in 2026-08 held an MB; corrected 2026-09-03, and where a real MBS could not be found the value was cleared rather than left wrong. **Rule: this column holds a 9-digit MBS or nothing** |
| entity_type | enum | not null | `doo`, `jdoo`, `obrt`, `dd` — actual Croatian legal-form names, kept as-is (dotless, so the values stay usable as URL/filter params) |
| data_source | enum | not null | which registry the record came from: `sudreg` = Sudski registar (companies), `portor` = **any obrt** — craft-registry-backed data, whichever intermediary surfaced it (widened 2026-09-03; it previously meant a hand lookup in the Portal Obrtnog registra specifically), `manual` = web/phone research with no registry record. The portal has no API and scraping it is a Never-tier boundary (see SPEC.md), so obrt records are always hand-collected |
| address | text | | street and house number as one field (manual entry, splitting adds no benefit at this stage). **Operating address, not registered seat (2026-09-03).** Where a business publishes an address that differs from its registry seat, the published one is stored — a bereaved family needs the office they can walk into, not the address on the court record. Set by the Čagalj precedent in the Split pilot and applied since to Pokop, In Memoriam, Bor, Ukop and Denaro; the seat is recorded in the migration comment. For a provider inside a city's catchment but outside the city proper, the town is written into this field (`"Kastavska cesta 2, Matulji"`), since `city_id` names the city the provider serves |
| city_id | uuid | FK → cities.id, not null, on delete restrict | a city with entities attached cannot be deleted |
| postal_code | text | nullable | |
| phones | jsonb | nullable | ordered array, first entry is the primary number — see shape below. Sudreg returns no contact numbers, so always manual entry |
| email | text | nullable | |
| website | text | nullable | |
| latitude | double precision | nullable | preparation for map integration |
| longitude | double precision | nullable | preparation for map integration |
| available_24_7 | boolean | default false | **True only where the business states round-the-clock availability in words** — "0-24", "24/7", "u svako doba dana" (rule fixed 2026-09-03). A phone merely *labelled* "dežurna služba" is not enough: that row gets `false` plus an `emergency`-typed number, which already carries the meaning in the UI. Nor is a third-party directory's claim enough — the statement has to be the business's own. The distinction is not pedantry: after hours this flag is the difference between a provider a family can use tonight and one they cannot |
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

**Two documented exceptions (2026-09-03).** The rule is mechanical, and twice it produced a slug that would have been worse than the exception:

- `Pogrebno poduzeće Zagreb d.o.o.` → **`pogrebno-poduzece-zagreb`**, not `zagreb`. Step 3 would drop the descriptor and leave only the city name, giving `/pogrebne-usluge/zagreb/zagreb`. So step 3 is skipped whenever dropping the descriptor would leave nothing but the city.
- `E & E d.o.o.`, trading as Cvjećarna Nives → **`ee-marcana`**. The rule yields `e-e`, which no one would recognise or type. The town is added because the business itself pairs the initials with it (`eemarcana@gmail.com`). Adding a word not in the name is a departure, taken because two bare initials are not an identifier.

Both are additions to the *slug*, never to the `name` — the customer-facing name always stays what the business is called.

**Why unique per city, not globally.** The detail URL already contains the city, so the city is part of the identifier — global uniqueness would be over-constrained. It matters as soon as a second city is added: short surname-derived slugs collide easily across cities (a `Zec` in Zagreb is entirely plausible), and a global constraint would force an artificial suffix on a provider for a name clash the URL structure never actually has.

**Note:** no `status` field — the table holds only active entities by convention. Tracking status changes over time is deferred to a future history/audit table (see SPEC.md → Future considerations), out of Phase 1 scope.

**A podružnica under its holding's OIB (2026-09-03).** One row breaks the one-OIB-one-business assumption, deliberately and at the project owner's direction: **Gradska groblja Zagreb** is a *podružnica* (branch) of ZAGREBAČKI HOLDING d.o.o. and is not a legal person, so it has no OIB of its own. The row carries the holding's OIB (`85584865987`), which also covers water, transport, markets and much else.

It is included because it operates the Zagreb crematorium and is the city's largest funeral operator — omitting it would have made the Zagreb list indefensible, and the alternative (making `oib` nullable) would weaken the dedup key for all 44 other rows to accommodate one. The consequence to keep in mind: `oib` is still unique, but it is no longer safe to assume a row's OIB identifies *only* that business. If a second Zagrebački holding branch is ever listed, that assumption breaks outright and the schema needs revisiting rather than a second workaround.

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

**Known limitation: one window per day (2026-09-03).** The shape cannot express a split shift, which the Mediterranean midday closure makes common. Cvjećarna Nives (Pula) publishes *mon–fri 08:00–12:00 and 16:00–19:00*; only the morning window is stored. The choice was deliberate — understating means a family is told "closed" when the provider is open, while storing `08:00–19:00` would send someone to a locked door at 14:00, and of the two failures the second is worse. Fixing it properly means allowing an array of windows per day, which needs no DDL (the column is jsonb) but does need `web/lib/hours.ts` and its tests changed. Deferred, not dismissed.

**A related limitation: `0-24` is availability, not hours.** Where a provider's only published statement is "0-24", `working_hours` is left **null** and `available_24_7` carries the fact. Storing seven `00:00–24:00` days would conflate a staffed office with a mobile phone someone answers at 3am. Nine of the 38 new-city rows are in this position.

**And a third: no field can hold a Croatian 0800 number.** Ukop (Osijek) and KD Kozala (Rijeka) both publish a freephone as their round-the-clock line. Croatian `0800` numbers have no E.164 form and cannot be dialled from a `tel:` link, so they are not stored in `phones` at all — the invariant that every stored number works in a `tel:` link is worth more than the number. Where the business also states 0–24 in words (Ukop does), the *claim* is still recorded in `available_24_7`; the number backing it simply is not listed.

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
| Posredovanje pri kupnji grobnog mjesta | `posredovanje-grobnog-mjesta` | *(added 2026-09-03)* |
| Klesarske usluge / nadgrobni spomenici | `nadgrobni-spomenici` | `gravestones` |
| Uređenje i održavanje groba | `uredenje-groba` | `grave-maintenance` |
| Sređivanje dokumentacije | `sredivanje-dokumentacije` | `document-handling` |
| Oblačenje i uređivanje pokojnika | `uredivanje-pokojnika` | `deceased-preparation` |
| Organizacija glazbe | `glazba-na-pogrebu` | `funeral-music` |
| Fotografiranje i snimanje | `fotografiranje-pogreba` | `funeral-photography` |
| Ugovaranje pogreba unaprijed | `ugovaranje-unaprijed` | *(added 2026-09-03)* |

**This table's row order is the canonical render order**, mirrored in `CANONICAL_SERVICE_ORDER` (`web/lib/services.ts`) because the `services` table has no sort column. It is not alphabetical and must not be sorted: it runs roughly in the order a family encounters the decisions.

**The two 2026-09-03 additions sat at the bottom of this table — and were missing from `CANONICAL_SERVICE_ORDER` entirely — until 2026-09-14.** `canonicalIndex` returns `length` for an unknown slug rather than throwing, so both quietly sorted last in every service list for eleven days with nothing failing. Placed deliberately on 2026-09-14: `posredovanje-grobnog-mjesta` joins the grave cluster in the order it happens (secure the plot → the headstone → the upkeep), and `ugovaranje-unaprijed` trails everything, because pre-arrangement is not a decision in the post-death sequence at all — it belongs to the `planiranje` path, a different person on a different timeline.

`web/lib/services.test.ts` now enforces this: it pins the 18 slugs in this order as a canary, and asserts that every ordered service has a `SERVICE_SHORT_PHRASE` entry and vice versa. **A migration that adds a service will fail that test**, which is the intent — the failure is the reminder to place the new slug here deliberately rather than let it default to last.

Slugs are Croatian because they appear in URLs ([SPEC.md](SPEC.md) → Naming Convention), with diacritics transliterated (đ→d, ž→z, č→c, ć→c, š→s) so no path segment needs percent-encoding.

Where a slug is shorter than its display name, it is cut toward the phrase people actually search rather than a literal transliteration: `osmrtnice` over `osmrtnice-i-tiskane-objave`, `nadgrobni-spomenici` over `klesarske-usluge`. One slug diverges from its name outright — `prijevoz-pokojnika-inozemstvo` for "Međunarodni prijevoz pokojnika" — because *"prijevoz pokojnika u inozemstvo"* is the natural phrasing. These are judgements about phrasing, not keyword-volume data; worth a native-speaker sanity check.

The rename replaced the English slugs seeded in `20260827073807_initial_schema.sql`. That migration is applied and **must not be edited**, so the change went into `20260902102000_services_slug_croatian.sql` as 16 `update services set slug = … where slug = …` statements, keyed on the old slug (unique and stable), followed by a guard that raises if any English slug survives — a half-renamed lookup table would leave the frontend 404-ing on that service's URL with no other symptom. Nothing referenced `services.slug`: `entity_services` joins on `service_id` (uuid), and no frontend existed yet, so the rename broke nothing.

The last four were added after the Split pilot research: each recurs across multiple providers and none mapped to the original twelve. `uredivanje-pokojnika` (oblačenje i uređivanje) is deliberately distinct from `balzamiranje` — Croatian providers offer the former routinely and the latter appeared nowhere in the Split pilot (Pokop in Zagreb is the first and so far only provider in the whole dataset to name it).

**The two 2026-09-03 additions** came out of the six-city research, chosen from seven recurring offers on how often they appear and whether they are genuinely distinct:

- `posredovanje-grobnog-mjesta` — four providers advertise brokering the purchase of a burial plot. Deliberately distinct from `uredenje-groba`, which is maintaining a grave you already have. **Assigned only to private providers who broker on a family's behalf**, never to a municipal cemetery operator selling its own plots — those supply graves as the owner, which is a different transaction.
- `ugovaranje-unaprijed` — three providers offer arranging a funeral in advance, and the frontend already carries a wired-but-hidden `planiram unaprijed` path, so this one has somewhere to land.

Five recurring offers were left out for want of providers, and are recorded here so the reasoning survives rather than being re-derived: grief counselling (2), eulogy speaker (2), post-death flat cleaning and ozone disinfection (1), veteran funeral subsidies (3 — an eligibility category rather than a service), memorial diamond (1). A service with one or two providers is useless as a filter and noise on a detail page.

**Claiming rule, unchanged and worth restating:** a service is recorded **only where the provider's own material states it**. Registry activity text lists what a business is *permitted* to do, not what it sells, so a provider whose only evidence is registry text gets no service rows at all — 16 of the 38 new-city rows are in that position, and their detail pages correctly show nothing. `kremiranje` is the one place the rule was loosened: it is assigned where a provider *arranges* a cremation, not only where it operates a crematorium, because that is the question a family is actually asking. Two cemetery operators still do not get it, because their own wording is transport to a crematorium and nothing more.

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

Note what is *not* a parameter: `occurred_at` and `device`. The client cannot assert them. **`source` was in that list until 2026-09-24 and had to leave it** — see Attribution below for the defect that forced it and the exact scope of the weakening.

### Derived server-side

The function reads request headers via `current_setting('request.headers', true)::json`, which PostgREST populates per request.

| column | derived from | rule |
|---|---|---|
| `occurred_at` | `now()` | `date_trunc('hour', now())` — the client cannot backdate |
| `device` | `user-agent` header | contains `ipad`/`tablet` → `tablet`; else contains `mobile`/`android`/`iphone` → `mobile`; otherwise `desktop`; header absent → `unknown`. **The raw string is never stored** |
| `source` | **`p_referrer` parameter** | the caller's *entry* referrer, bucketed by `bucket_source()`; parameter omitted → `unknown`; empty string → `direct`; present but unparseable → `unknown`. **The raw referrer is never stored.** It was derived from the `referer` header until 2026-09-24, which never worked — see Attribution |

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

`source` is what makes the numbers mean anything to a provider: it is the difference between *"you got 34 calls"* and *"you got 34 calls, and 82% of those families arrived from Google rather than from your own website"*. Without attribution a provider can simply claim they would have won the customer anyway.

### Attribution: why `source` became a parameter (2026-09-24)

> **Status: applied to the hosted project on 2026-09-24**, in `20260924120000_entry_referrer_attribution.sql`, at the project owner's explicit direction (*"yes, push to db and verify then"*) — the **Ask first** approval this needed, since there is no staging environment and the push hit production.

> **Verified against the live API, not inferred from a clean push.** With a browser user-agent and a nonexistent `entity_id`, a call carrying `p_referrer` raises `23503` on the FK — which proves the new signature is accepted *and* that the insert path actually executes, without writing a row. The same call with `p_referrer` omitted behaves identically, which is what proves an old two-argument client still works. The same call with a bot user-agent returns 204 and no FK error, which proves the bot filter still returns before the insert. `log_city_event` behaves identically. One real `brief_export` row for Rijeka carrying a `google.com` referrer exists from confirming the bucket itself.

**`source` was `internal` on every row ever written** — 21 of 21 when this was found, including visits Search Console proves came from Google. It was not mostly wrong; it could not hold any other value.

The cause: both functions derived it from `request.headers ->> 'referer'`, which is the referrer of the **PostgREST call**, not of the visitor's arrival. That call is made by JavaScript on a `pogreb.net` page, so the browser sends `https://pogreb.net/` and the host matched the `internal` branch every time. The bug was invisible because the column looked populated and plausible.

What that cost is exactly the sentence above, and the `direct`-on-a-`detail_view` suspicion signal two sections down. Neither can be produced from a column with one value.

**The fix: the client passes `document.referrer`, reduced to its origin; the server still buckets it and still stores only the enum.** No URL, no search term, no path is persisted, so the GDPR position is unchanged.

**This is a deliberate, narrow weakening of "the client cannot assert them", and the scope matters.** A holder of the public `anon` key can now forge the *label* on an event. They still cannot forge the *count*: the hourly cap per `(entity_id, event_type, hour)` is untouched, `occurred_at` and `device` stay server-derived, and `anon` still holds no table privileges. The valuable attack — inflating a provider's call volume — remains blocked, and a forged label buys an attacker nothing.

**The alternative was reading the real referrer during the page render, and it is closed.** Reading request headers in a server component forces per-request rendering, which is precisely what kept 88 URLs out of Google's index ([SPEC_frontend.md](SPEC_frontend.md) → Search → Rendering). Server-verified attribution and a crawlable site are mutually exclusive here, and crawlable wins.

**The semantics changed, not just the plumbing.** `source` now means *how the session reached the site*, not *which page linked to this click*. `document.referrer` does not change across client-side navigation, so a family that lands from Google and then browses to a provider still logs `search` — which is the question the pitch asks. The consequence: **`internal` becomes rare rather than universal**, and now means a full page load referred by our own site. The earlier reading — "arrived from our city list" — was never achievable.

**`null` and `''` are different and must stay so.** Parameter omitted (a cached old client) → `unknown`; empty string (browser reports no referrer: typed, bookmarked, or stripped) → `direct`. Falling back to the request header when null would only reproduce the bug, so it deliberately does not — `unknown` is a truthful *no data*, where `internal` would be a positive claim nothing supports.

**Both functions changed**, and the bucketing rule was extracted into `bucket_source()` so they cannot drift: it was duplicated verbatim in `log_event` and `log_city_event`, which is how a fix reaches one and not the other.

**Timing is the reason this was not deferred.** The benefit only lands in a monetization conversation, and the instinct is therefore to postpone — but attribution is a *track record*, not a switch. It cannot be backfilled, so the data has to already exist when that conversation happens. Delay does not defer the cost; it destroys the history.

### Data integrity

The function **silently discards** a call — plain `return`, never `raise` — in two cases. Silence is deliberate: an error reveals that filtering exists and can trigger client-side retries.

1. **Self-identified bots.** `user-agent` matched case-insensitively against `bot|crawl|spider|slurp|headless|preview|monitor|curl|wget|python-requests|okhttp`. This catches honest crawlers and link-preview unfurlers, which are the *volume* problem. It does not catch a bot that lies about its UA — that is rule 2's job.
2. **Hourly cap per target.** If `(entity_id, event_type, date_trunc('hour', now()))` already holds **60** rows, discard. This is the defence against deliberate inflation, and it needs no visitor identifier because it caps the *target* rather than the source. A pilot-city funeral home will never legitimately see 60 phone clicks in one hour, so the cap converts an unbounded integrity failure into a bounded, visible anomaly. Cost is one indexed range scan on `(entity_id, occurred_at)`.

Rule 2 matters more over time, not less: the moment these counts are shown to the provider they describe, that provider has a motive to inflate them.

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

⚠️ **That signal did not work until 2026-09-24 and its reading has changed** (see Attribution). It was dead while `source` was always `internal`. Under entry-referrer semantics the comparison is no longer `direct` against `internal` but **`direct` against `search`**, since `internal` is now rare by construction — a real family usually arrives from a search engine, so a run of `direct` on one provider's detail views is the anomaly worth looking at.

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

## City-level logging: `city_events`

> **Status: applied to the hosted project on 2026-09-21**, in `20260921120000_city_events_and_log_city_event.sql`, at the project owner's explicit direction (*"write migration and push it"*) — which is the **Ask first** approval this needed, since there is no staging environment and the push hit production.
>
> **Verified against the live database, not inferred from a clean push.** A valid call returns 204; `city_events` is not readable through the API at all (401); an invalid enum value is rejected (400); a nonexistent `city_id` with a real user-agent raises `23503` on `city_events_city_id_fkey`, which is what proves the insert path actually executes; and **the same call with a bot user-agent returns 204 with no FK error**, which is what proves the bot filter returns before the insert. One real `brief_export` row for Rijeka exists from that check.

### Why `events` cannot carry these rows

`events.entity_id` is not conventionally provider-scoped; three separate mechanisms depend on it. It is `not null` with an FK to `entities`, and that FK doubles as validation. The abuse cap keys on `(entity_id, event_type, hour)`. The table's only index is `(entity_id, occurred_at)`, serving both the reporting query and that cap.

A row about a *city* is therefore not a missing column, it is a different kind of row.

**The tempting shortcut is rejected:** logging one `brief_export` against every provider shown on the results page. The family did not do anything to those providers, the counts are the only evidence the product has that it works, and inflating them corrupts the one dataset whose entire value is being trustworthy — see What the numbers are worth. It is also a sentence that could not be said out loud to a provider.

**Making `entity_id` nullable was considered and rejected.** It would cost the not-null invariant and the FK validation on the core column of the best-designed table in the schema, need a CHECK that exactly one of two columns is set, need a second cap path for null-entity rows, and add `where entity_id is not null` to every existing query — all to accommodate a row that is not about a provider.

### Scope, stated so the table does not become a junk drawer

`city_events` holds events **about a city**, with `city_id` not null. It is **not** a general page-events table. Page-level events with no city — a completed cost estimate, a read of `/sto-uciniti-prvo` — belong in a sibling table when they are wanted, because they would key on a page identifier rather than a city and need different cap semantics. Two small tables that each mean one thing beat one table with nullable columns that means several, which is the property that makes `events` good.

### Table

| column | type | constraints | notes |
|---|---|---|---|
| id | bigint | generated always as identity, PK | |
| city_id | uuid | FK → cities.id, not null, on delete cascade | the same validation benefit `entity_id` gives `events` — the function cannot record an event for a city that does not exist |
| occurred_at | timestamptz | not null | truncated to the hour by the function, stored UTC. Not a client parameter |
| event_type | enum `city_event_type` | not null | `brief_export` at first. Anticipated values below |
| source | enum `event_source` | not null | reused, not redefined — the buckets and their reasoning are identical |
| device | enum `event_device` | not null | reused |

**Index:** `(city_id, occurred_at)`, mirroring `events` and serving both reporting and the cap.

### Anticipated enum values

Recorded so the enum's shape is deliberate rather than accidental. Adding a value later is a one-liner that leaves existing rows valid, so only the first ships.

| value | what it buys |
|---|---|
| `brief_export` | the sheet a family carried away. **First and only value in the initial migration** |
| `results_view` | the denominator the product does not have. Per-provider `detail_view` cannot distinguish *"80 families saw the Rijeka list and none called"* from *"nobody reached Rijeka"* — and those imply opposite next moves, which is the question [SPEC.md](SPEC.md) says `events` exists to answer |
| guided vs. direct arrival | whether the three-screen flow earns its existence or everyone bypasses it from search. Cheapest as two values (`results_view_guided` / `results_view_direct`) rather than a column |
| chosen `nacin`, per city | a real cremation-intent rate by city, which nobody in Croatia holds — and with only two crematoria, intent against geography is a genuinely sellable aggregate. Still no identifier, hour-truncated, aggregate only. Note this is narrower than the combination Instrumentation rules out: `situacija` + `nacin` + `pokojnik` together start to look like a fingerprint, a single axis does not |

### `log_city_event`

Same posture as `log_event`, which is the template: `security definer`, `set search_path = public, pg_temp`, `returns void`, signature `log_city_event(p_city_id uuid, p_event_type city_event_type)`. `occurred_at`, `source` and `device` are derived server-side from request headers by the identical rules, and the client cannot assert them. The same self-identified-bot filter applies, and rejection is the same silent `return`.

**Caps are per event type, and this is the one thing that must not be copied verbatim.** The existing 60/hour cap is justified by *"a pilot-city funeral home will never legitimately see 60 phone clicks in one hour."* That reasoning holds for `brief_export`. It does **not** hold for a view-type event — Zagreb on a working site would exceed 60 results views in an hour legitimately, and the function discards silently, so the ceiling would appear in the data as a plateau nobody could explain. A single shared cap is therefore a defect waiting for traffic, and the per-type table goes in from the start.

### RLS and grants

Identical to `events`, for identical reasons: RLS enabled, **no read policy at all**, and

```sql
revoke all on table public.city_events from anon, authenticated;
grant execute on function public.log_city_event(uuid, city_event_type) to anon, authenticated;
```

### Client-side rules

All of Client-side rules apply unchanged. Two bite specifically here:

- **The environment guard** — `shouldLog()` in `lib/instrumentation.ts` already covers it and must be reused rather than reimplemented.
- **Fire and forget** — a `brief_export` is logged on a deliberate gesture, and a failed log must never delay the share or the print.

### The case that does not fit, recorded before it is discovered

**Demand for a city we do not cover.** If a *"my city isn't listed"* affordance is ever added, the city the visitor wanted has no `cities` row, so the FK rejects the write — and that is the single highest-value expansion signal available. Not a reason to change this design: the fix when it is wanted is a `cities` row carrying a not-covered status, not a nullable FK.

Likewise, the `/usluga/{slug}` listings are city **and** service scoped and do not fit a two-column table. They would need their own shape.

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

`events` is the one table with **no read access**. Two reasons: the `anon` key is public, so a SELECT policy would let any visitor — including a competing provider — read every provider's click counts; and those counts are the only evidence the product has that it sends anyone business. The log is written through `log_event` and read only via privileged Studio / CLI access.

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
| `20260903120000_pilot_cities.sql` | six `cities` rows — Zagreb, Rijeka, Zadar, Osijek, Pula, Dubrovnik |
| `20260903120500_services_two_additions.sql` | `posredovanje-grobnog-mjesta`, `ugovaranje-unaprijed` — the lookup goes from 16 to 18 rows |
| `20260903121000_split_corrections.sql` | `mbs` held a DZS MB rather than an MBS in four Split rows; Bila ruža's `oib` failed its checksum |
| `20260903123000…132000_entities_{city}.sql` | the 38 six-city providers, one migration per city, conventions documented in the Zagreb file |
| `20260903133000_entity_services_pilot_cities.sql` | 163 service rows across 22 of the 38 |
| `20260907100000_split_corrections_okolica_review.sql` | five corrections to the live Split rows — Lovrinac's and Zec's addresses moved off their registered seats to the offices their sites give customers, Tonkić's two published mobiles added, Bila ruža's hours corrected to the funeral office window, `last_verified_at` bumped on all seven |
| `20260907101000_entities_split_okolica.sql` | six providers from the okolica — Hrvojka, Cipetić, Cvjećarnica Vesna, KDGS Solin, Priba, Orhideja — all under the `split` city row with the town in `address` |
| `20260907102000_entity_services_split_okolica.sql` | 26 service rows across five of the six; Priba has none, per the registry-only rule |
| `20260914100000_delete_out_of_scope_entities.sql` | **the first migration to delete entity rows** — Memorial (pet funerals only), Miroševac, Spokoj, and the Zagreb Tihi dom (not the business behind `tihi-dom.hr`, which is an Istrian obrt). 51 → 47 |
| `20260914101000_enrich_entities_from_websites.sql` | six rows enriched from their own sites — memento-mori, skroce-breza, mir-galic, muskovac, priba, suza-adria. Skroče Breza's address moved to Bože Peričića 10; Muškovac's second phone **added not replaced**; Suza Adria's only line re-typed `mobile` → `emergency` |
| `20260914102000_cities_slavonski_brod_velika_gorica.sql` | two `cities` rows — the eighth and ninth. 7 → 9 |
| `20260914103000_entities_slavonski_brod_velika_gorica.sql` | eight providers (4 Slavonski Brod, 4 Velika Gorica) plus **`miraj` relocated** from Zagreb to Velika Gorica by `city_id` update, keeping its slug and nine services. 47 → 55 |
| `20260914104000_entity_services_2026_09_14.sql` | 75 service rows across the five enriched and eight new providers; zero-service rows 17 → 8 |
| `20260921120000_city_events_and_log_city_event.sql` | `city_event_type` enum (`brief_export` only); the `city_events` table and its `(city_id, occurred_at)` index; `log_city_event()` with a **per-event-type** cap; RLS enabled with no policies; `revoke all` on the table and `grant execute` on the function. `event_source` and `event_device` are reused, not redefined |
| `20260924120000_entry_referrer_attribution.sql` | **applied 2026-09-24.** `bucket_source(text)` extracted from the two log functions so they cannot drift; `log_event` and `log_city_event` dropped and recreated with a defaulted `p_referrer text`, bucketing the caller's **entry** referrer instead of the RPC's own `referer` header; grants reissued for the new signatures (a drop takes privileges with it). Fixes `source` being `internal` on 100% of rows — see Attribution. **Deploy the migration before the frontend**: the parameter is defaulted, so a client still calling with two arguments keeps working and logs `unknown` |

**The 2026-09-14 batch was written and pushed in one pass** at the project owner's explicit direction (*"write all chunks and push to db immediately"*), which waived the chunk-by-chunk migration review in `CLAUDE.md`. Every guard in all five passed, so the counts they assert are confirmed against the live database: **55 entities across 9 cities, 8 rows still carrying no services.** Research and the full decision log are in `data/DATA_REVIEW_2026-09-14.md` (gitignored).

**The 2026-09-03 rows above were absent from this table until 2026-09-07.** Worth naming rather than quietly fixing: `supabase/migrations/` is gitignored, so a migration missing from this table is a migration with **no record in the repo at all**. The gap survived a whole expansion because nothing enforces it.

**Ordering constraint, as implemented:** `entities.slug` is `not null` with a composite unique constraint and seven pilot rows already existed, so it was added nullable, backfilled keyed on `oib` — stable, unlike `name`, which carries the trading-name changes from `20260827115739` — and only then constrained. `set not null` is the guard: it would have failed and rolled back the migration had any row been missed.

Note on the first migration: it was edited after it had already been applied to the hosted database. Supabase tracks applied migrations by version rather than content, so the edit never reached production — the corrective migration exists to close that gap. **An applied migration must not be edited in place; corrections go in a new migration.**

### A comment in an applied migration that the source contradicts (2026-09-07)

The rule directly above has a consequence that is easy to miss: **a wrong *comment* in an applied migration is also uneditable**, and a comment is what a later reader trusts. One exists, and this is its correction.

`20260903121000_split_corrections.sql` changed Bila ruža's `oib` to `57193004795` and recorded, as a warning:

> Note there is a second, distinct "BILA RUŽA, obrt … vl. Katija Vuco" at Ulica Templarskog reda 1A, Split with primary NKD 32.99 (manufacturing). That is NOT this business; do not merge them on the strength of the name.

**bilaruza.com presents both addresses as its own** — Templarska ulica 1a as the main address and Poljička ulica 22 as the funeral-services address, with the funeral phones on the second. fininfo serves the same record id (`361221`) under both a *vl. Katija Vuco* and a *vl. Marija Peričić* slug, and the identifier it labels "OIB" there (`91097100`) is eight digits, so it is an MBO.

The OIB was chosen on an address-and-phone match — the migration says so, and calls it corroboration by address and phone rather than by a registry record. If the two names are one business with two premises, that corroboration was matching against the wrong half. **`57193004795` is a valid OIB and may well be the right one; what is gone is the reason to believe it.** Settling it needs the Sudski registar (not configured) or the Obrtni registar (a Never-tier boundary), so it stays as it is, knowingly.

## Open questions

None outstanding against the schema.

### Resolved

- ~~**URL namespace collision between entity and service slugs.**~~ Both wanted the same shape — `/pogrebne-usluge/split/cagalj` for a provider, `/pogrebne-usluge/split/kremiranje` for a service listing — with nothing constraining `entities.slug` and `services.slug` against each other. Resolved in [SPEC_frontend.md](SPEC_frontend.md) → Routing and URLs by segmenting the namespace: indexable service listings live at `/pogrebne-usluge/{grad}/usluga/{usluga}`, and flow/filter state stays in query parameters. The literal `usluga` segment makes the collision structurally impossible rather than accidentally absent, so a future provider named "Urne" is harmless. No schema change was involved either way.

- ~~**`services.slug` language.**~~ Renamed to Croatian in `20260902102000_services_slug_croatian.sql`; see [Seed data](#seed-data-services).

## Next step

The schema is complete and applied. What remains is not database work:

1. **Build the frontend** per [SPEC_frontend.md](SPEC_frontend.md). The client-side rules above are binding on it.
2. **Data quality, ongoing** — `working_hours` is populated for roughly one of seven providers, and it drives the open-now status and the after-hours phone selection. This degrades the frontend rather than blocking it.
