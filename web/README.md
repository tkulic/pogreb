# web

The Phase 1 public frontend. Next.js App Router, TypeScript, CSS Modules over a
CSS-custom-property token layer.

`SPEC_frontend.md` in the repo root is the source of truth for the flow, the
routing, the ranking rules and the **Kamen** visual system. Where this README
and the spec disagree, the spec wins.

## Setup

```
cp .env.example .env.local     # then fill from the Supabase dashboard
npm install
npm run dev
```

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are needed.
Both are meant to ship in the browser. The `service_role` key must never appear
here or anywhere in this app — it bypasses RLS entirely.

## ⚠️ `npm run dev` points at the production database

There is no local database and no staging environment. Every query runs against
real data, and every write would too — which is why there is exactly one write
path, `log_event`, and why it is wrapped in an environment guard that logs only
when `NODE_ENV` is production *and* the hostname matches
`NEXT_PUBLIC_SITE_HOST`. **Never bypass that guard**, not even temporarily:
without it, local page refreshes become the largest contributor to the `events`
table, and the numbers it exists to produce stop being quotable.

## One origin, deliberately

The pages load nothing from a third party. Fonts are self-hosted in
`public/fonts/` rather than fetched from Google, because a Google Fonts request
transmits the visitor's IP address to a third party on every page load — and
the product's freedom from a consent banner depends on no such transfer
happening. Next.js telemetry is disabled for the same reason:

```
npx next telemetry disable
```

That setting is stored per machine, not in the repo, so **run it once on any
new machine**.

`log_event` to our own Supabase project is intended to remain the only outbound
request the pages make. Adding a CDN, analytics script, embedded map or
external icon set is an *Ask first* decision with a GDPR consequence — see
`SPEC.md` → Boundaries.

## Commands

| command | |
|---|---|
| `npm run dev` | development server |
| `npm run build` | production build; also runs the TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | unit tests (Vitest) |

## Croatian diacritics

The display face must draw `Č č Ć ć Ž ž Š š Đ đ` **correctly**, which is not the same as having glyphs for them. The original face, Cinzel, has all ten and draws `Đ`/`đ` with a macron above instead of a stroke through the stem — `Đakovo` rendered as `D̄akovo`. That is what cost it the job; the face is now Spectral SC.

Both faces are vendored in `public/fonts/`, so the payload cannot change underneath us. If you ever swap or version-bump a face, open `/specimen` and check the diacritic line by eye: the stroke must cut through the stem, not float above it.

## `/specimen`

A `noindex` development page rendering every colour token with its measured
contrast ratio, the full type scale, the diacritic test string in both faces,
and both button styles. Not part of the product — it exists so a regression in
the visual system is visible in one glance.
