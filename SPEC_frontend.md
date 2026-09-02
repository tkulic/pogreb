# SPEC: Frontend

> Spec module — the Phase 1 public frontend. See [SPEC.md](SPEC.md) for project context and scope, and [SPEC_database.md](SPEC_database.md) for the schema this reads from.
>
> Status: **specified, nothing built.** The frontend directory does not exist yet. The user story, the three-screen flow, the results page and its ranking rules, the routing, and the visual system are settled; what remains open is listed under [Open questions](#open-questions), and what blocks a build under [Data dependencies](#data-dependencies-that-gate-the-build).
>
> **Naming convention:** UI copy and all URL paths/query parameters are Croatian; code, component names and identifiers are English. See [SPEC.md](SPEC.md) → Naming Convention.

## What this is

A public, read-only Next.js app over the hosted Supabase project. It has one job: get a grieving family from "someone has died and I don't know what to do" to a phone number they can dial, in under a minute, without asking them to research anything.

**Not** a search engine, not a comparison tool, not a lead-generation form. The three German portals surveyed during design ([bestatter-preisvergleich.de](https://www.bestatter-preisvergleich.de/), [bestattungen.de](https://www.bestattungen.de/), [bestattungsvergleich.de](https://www.bestattungsvergleich.de/)) all end their flow in a contact form and monetise the lead. Phase 1 deliberately ends in the actual list of providers, with no email gate and nothing to submit — see [SPEC.md](SPEC.md) → Phase 1 scope, where lead forms and monetisation are out of scope.

Two consequences of that, which are requirements rather than side effects:

- **No personal data is ever collected.** No email, no name, no phone number, no account. There is no submit button anywhere in the product.
- **No cookie banner.** The no-PII design of `events` ([SPEC_database.md](SPEC_database.md) → Usage logging) is what earns this. All three reference sites have a consent wall; not having one is a visible usability advantage and must not be traded away.

## The user story

> I am organising a funeral. Someone has just died, or is dying. I have hours, not days, and no capacity to research anything.
>
> I don't want to search, compare, or work through a questionnaire. I want to be asked as little as possible and then be told, in plain language, **who I should call first and why** — with the phone number right there, working at 3am.
>
> I need to trust that the list isn't sold. If I'm unsure about anything I'm asked, I need to be able to say "I don't know" and still get an answer. And if I don't want to be led at all, I need one tap to just see everyone.

### What the flow is actually for

With 7 providers in the Split pilot, a filter cannot do much work. Four of the sixteen services — `organizacija-pogreba`, `cvjetni-aranzmani`, `prijevoz-pokojnika`, `prijevoz-pokojnika-inozemstvo` — are offered by all 7 and therefore discriminate nothing. The only service that genuinely splits the pilot list is `kremiranje` (4 of 7).

So the flow's value is **not filtering**. It is orientation and confidence: turning "I have no idea where to start" into "here are these few, and here is why these few". Every design decision below follows from that. A flow that filtered well but explained nothing would be the wrong product.

## Flow overview

Three question screens, then the results. The results are the destination, not a fourth step.

| screen | question | required | what it changes |
|---|---|---|---|
| 1 | Situacija — what has happened | no | ranking (urgency), guidance shown, tone |
| 2 | Mjesto — where the funeral is | **yes** | which providers exist at all |
| 3 | Potrebe — cremation or burial (+ where the deceased is) | no | filtering (`kremiranje` only) and the reason lines |
| — | Rezultati | — | the list |

Every screen is skippable except screen 2, and screen 2 is pre-answered when the user arrives from a city URL.

## Screen 1 — Situacija

**Question:** *Što se dogodilo?*

Three large tiles, one tap, no free text:

| tile label | `situacija` value | meaning |
|---|---|---|
| Osoba je preminula | `preminuo` | urgent path |
| Osoba je u posljednjim danima | `posljednji-dani` | imminent path |
| Planiram unaprijed | `planiranje` | planning path |

All three reference sites open with this same split rather than a search box, and it is the single most valuable pattern taken from them: it is a statement of situation, not a filter, and it sets urgency, ranking and tone in one tap.

**Also on this screen, both mandatory:**

- **The bypass.** A text link, not a button: *"Preskoči pitanja i prikaži sve pogrebnike"*. Goes straight to the unfiltered results for the pilot city. Someone who does not want to be led must be one tap from the list.
- **The guidance link**, shown only for `preminuo` and `posljednji-dani`: *"Što učiniti prvo"* → `/sto-uciniti-prvo`. This answers the question behind the question, which is broader than "which provider".

**What `situacija` does downstream:**

- `preminuo` — `available_24_7` becomes a ranking term (see chunk 2), and the results page carries a guidance strip.
- `posljednji-dani` — same list, no 24/7 ranking boost, different guidance strip.
- `planiranje` — no urgency ranking; `nadgrobni-spomenici` and `uredenje-groba` become relevant rather than noise.

`situacija` is never used to *exclude* a provider. It only reorders and reframes.

## Screen 2 — Mjesto

**Question:** *Gdje je pogreb?* with the hint *"obično u mjestu gdje je osoba preminula"*.

Deliberately not "where are you" and not "where is the deceased": a Split provider conducting a burial at the Podstrana cemetery is routine, and only the funeral's location is stable enough to select on.

### The catchment decision

`cities` currently holds exactly one row (Split), and it conflates two different concepts:

- where providers **are** — Split, all 7 of them
- where the **funeral** is — Podstrana, Solin, Kaštela, Klis, Stobreč, Žrnovnica, Omiš, Trogir and more, nearly all with no provider of their own

Under the current model a user in Podstrana cannot be represented at all. **Decision for Phase 1: treat the pilot unit as a catchment area, not a municipality.** The screen offers one option — *"Split i okolica"* — and the page states the covered area explicitly beneath it:

> Pogrebnici koji rade u Splitu i okolici — Podstrana, Solin, Kaštela, Klis, Stobreč, Žrnovnica, Omiš, Trogir.

A user from Podstrana recognises themselves and gets all 7. This needs no schema change and no new data, and at pilot scale it loses nothing, because all 7 serve the whole area.

Three constraints on this, all binding:

1. **The claim is about the pilot area, not about individual providers.** No provider's service radius has been verified. Copy may say *"pogrebnici u Splitu i okolici"*; it may never say *"ovaj pogrebnik radi u Podstrani"*.
2. **The settlement list is a product claim, confirmed by the project owner** — Podstrana, Solin, Kaštela, Klis, Stobreč, Žrnovnica, Omiš, Trogir. It is not derived from data and must not be extended by guesswork ([SPEC.md](SPEC.md) → Never: fabricating business data); adding a settlement is an owner decision, not an implementation one.
3. **No distance or proximity claims anywhere.** `entities.latitude` / `longitude` exist as columns but are null for all 7, and `cities` has no coordinates at all. Any "near you" or "X km away" wording is unsupported by the data.

With one city, this screen is a single button. It becomes a real choice at city #2 and a text input only when the settlement count makes buttons impractical.

### Where this goes later (not built now)

The catchment framing is the cheap form of a model the product will eventually need. Naming the end state here so the framing does not have to be un-learned:

- **Next** — a frontend-only static settlement→catchment map, so typing "Podstrana" resolves. No database, fully reversible. Needed only once screen 2 becomes a text input.
- **Eventually** — a `places` table separating settlement from provider-city, plus coordinates and a per-provider service radius. That is a schema change and therefore ask-first ([SPEC.md](SPEC.md) → Ask first), and premature at 7 providers.

`/pogrebne-usluge/podstrana` as an indexable page listing Split providers is a genuine SEO opportunity with no competition, and legitimate if each page says something specific (which cemetery, which providers work it). Fifteen near-identical pages would be thin content. Deferred, but the catchment framing keeps it available.

## Screen 3 — Potrebe

### Why this is not a service picker

The 16 rows in `services` are a **supply-side taxonomy** — what a provider sells. A family in the first hours needs a **demand-side question** — what they have to decide. Any subset of the taxonomy reads as arbitrary to them: offering "Uređenje groba" but not "Lijesovi" is incoherent, because a casket is not a filter, it is an item chosen with the provider, in person, an hour later. Every provider has caskets.

So screen 3 asks what the family is actually facing.

### Question 3a — always shown

**Question:** *Kremiranje ili ukop?*

| option | `nacin` value | effect on the list |
|---|---|---|
| Kremiranje | `kremiranje` | filters to providers offering `kremiranje` — 4 of 7 in the pilot |
| Ukop | `ukop` | **no filter** (see below) |
| Još ne znam | omitted | no filter |

This is the one genuine either/or, it is the first thing every provider asks, and it is the only question in the flow that meaningfully narrows the pilot list.

**`ukop` filters nothing, and the UI must not imply otherwise.** All 7 providers do burials — `organizacija-pogreba` is universal and there is no `ukop` service row. `ukop` and *"Još ne znam"* therefore produce an identical list; what differs is the reason lines and the copy. Stating this here so nobody later "fixes" it by inventing a service row.

### Question 3b — conditional on sourcing

**Question:** *Gdje je pokojnik sada?*

| option | `pokojnik` value |
|---|---|
| Kod kuće | `kuca` |
| U bolnici | `bolnica` |
| U domu za starije | `dom` |
| U inozemstvu | `inozemstvo` |
| Ne znam | omitted |

This is the strongest question on any of the three reference sites, because it decides what happens in the next hour — who may collect the deceased, and how fast.

**It is a guidance question, not a filter, and the spec is explicit about that:** it changes the guidance strip on the results page and nothing else. It does not reorder or exclude providers. Even `inozemstvo` filters nothing, because `prijevoz-pokojnika-inozemstvo` is offered by all 7.

**Decided: 3b ships.** Its guidance text is a claim about Croatian procedure (who confirms death, what document is needed, what the family must do before a provider can act), so it must come from a source the project owner supplies — writing it from the German equivalents would be fabrication ([SPEC.md](SPEC.md) → Never). Until that source is in hand the question can be built and wired; the guidance strip renders empty rather than guessed. Tracked under [Open questions](#open-questions).

## Navigation and state rules

Binding on the implementation:

1. **State lives in the URL, not only in React state.** `/pogrebne-usluge/split?situacija=preminuo&nacin=kremiranje`. Croatian parameter names and values ([SPEC.md](SPEC.md) → Naming Convention). This makes a result set shareable — a family member sends the link to a sibling — survives refresh, and is the surface the rest of the routing hangs off.
2. **Back always works and preserves answers.** During design review, bestattungen.de's own wizard discarded every selection and returned four validation errors at once on the first Continue. That failure mode is the reason this is a numbered requirement.
3. **Every screen is skippable except screen 2**, which is pre-answered from the city path segment and then not shown at all.
4. **Every question carries an explicit escape** — *"Još ne znam"*, *"Ne znam"*, *"Nije važno"*. Taken directly from bestatter-preisvergleich, which offers "Weiß noch nicht" on every question, and it is the most humane thing on that site.
5. **No validation errors are possible.** Nothing is required, nothing is typed, so nothing can be wrong. The flow must never block on input.
6. **Results are reachable in at most three taps**, and in one tap via the screen 1 bypass.
7. **No modals, no carousels, no animation on the path to results.**

## Results page

The destination of the flow, and the page the whole product exists to render.

### Block structure, top to bottom

1. **Header** — title, *"Split i okolica"*, the settlement list, closing gold rule.
2. **Context strip** — *"Sedam pogrebnika · odabrali ste: Osoba je preminula · Kremiranje"*, with a *"Promijeni odgovore"* link back into the flow (which must arrive with the current answers still selected).
3. **Guidance strip** — conditional on `situacija` and `pokojnik`; links to `/sto-uciniti-prvo`. Renders empty until the sourced text exists (see screen 3b).
4. **`NAJBOLJE ODGOVARA · N`** — the shortlist.
5. **`OSTALI POGREBNICI · N`** — everyone else, quieter but complete.
6. **Transparency footer** — *"Prikazujemo sve registrirane pogrebnike u Splitu i okolici. Nitko nam ne plaća za bolju poziciju."*

### Guarantees

These are the page's contract with the user, and they are why the transparency footer is honest:

- **Every provider in the city appears on the page, always.** The two blocks partition the set; they never subset it. No pagination, no "show more" — at pilot scale seven rows fit.
- **The page is never empty.** The shortlist block may be, the page may not.
- **`N` is stated in both headings**, so the reader can see the partition adds up to the count in the context strip.

### Partition and shortlist size

Let *M* = providers matching every selected criterion (currently only `nacin=kremiranje`; `ukop` and every unanswered question match everything).

| case | shortlist | others |
|---|---|---|
| *M* ≥ 1 | top `min(4, |M|)` by ranking | all remaining, in ranking order |
| *M* = 0 | block omitted, with the line *"Nijedan pogrebnik u Splitu i okolici ne nudi [uslugu]. Prikazujemo sve."* | all 7 |

The cap of 4 is what makes it a shortlist rather than a re-sorted list. *M* = 0 is unreachable with current pilot data — the only filter is `kremiranje` and 4 providers offer it — so it is a defensive rule, not a live case.

A card also **drops out of the shortlist if no reason line can be composed for it** (below). A card in the shortlist that cannot say why it is there does not belong there.

### The reason line

**Mandatory on every shortlist card.** It is the difference between a justified shortlist and an opaque ranking, and opacity is exactly what makes the German portals read as brokers.

Composed from stored facts only, deterministic, **at most two clauses**, joined by `·`:

- **Clause 1 — availability.** `available_24_7` → *"Dostupni 0–24"*. Else any phone with `type = 'emergency'` → *"Dežurna linija"*. Else omitted.
- **Clause 2 — the most distinguishing remaining fact**, first match wins:
  1. **Rarest service** — a service this provider offers that ≤2 providers in the city offer, rendered as its short display phrase (*"klesarske usluge"*, *"ekshumacija"*). Most rare wins ties.
  2. **Widest range** — this provider has the most `entity_services` rows in the city → *"najveći izbor usluga"*.
  3. **Match confirmation** — a filter was selected and this provider satisfies it → *"nudi kremiranje"*.
  4. Otherwise omitted.

Worked against the pilot data, this reproduces the approved mockup exactly:

| provider | clause 1 | clause 2 | line |
|---|---|---|---|
| Bila ruža | 24/7 | no rare service, not widest → match | Dostupni 0–24 · nudi kremiranje |
| Bradvica | emergency line | no rare service, not widest → match | Dežurna linija · nudi kremiranje |
| Zec | emergency line | widest range (12 rows) | Dežurna linija · najveći izbor usluga |
| Lovrinac | emergency line | rarest (`nadgrobni-spomenici`, 1 of 7) | Dežurna linija · klesarske usluge |

Both clauses empty → the card moves to the others block.

### Card anatomy — shortlist

Rendered per the **Kamen** direction (chunk 3). Content and order:

1. **Name** — `entities.name`, Cinzel caps. The trading name as stored, which is what families know (see [SPEC_database.md](SPEC_database.md) — *"Pogrebne usluge Zec"*, not *"Adepto d.o.o."*).
2. **24-hour mark** — filled gold, top right, only when `available_24_7`.
3. **Address** — `address` + city name. Head office only; never implies branch coverage.
4. **Reason line** — Cinzel, gold.
5. **Service list** — every service the provider offers, in canonical seed order ([SPEC_database.md](SPEC_database.md) → Seed data), joined by `·`. No truncation and no "+N more": at 12 rows maximum this is three lines, and a family scanning for one specific service should not have to expand anything.
6. **Contact actions** — see below.

### Contact actions

**Neither CTA displays the address it acts on.** A visible phone number can be dialled by hand, which produces the conversion without producing the `phone_click` that is the product's only evidence it happened ([SPEC_database.md](SPEC_database.md) → What the numbers are worth). The number is therefore revealed *by* the click that logs it.

**Primary — `Nazovi`.** Dark fill `--ink`, `--gold-on-ink` label, ≥48px tall, full width on the urgent paths.

- Markup is a real `<a href="tel:+385…">` on the display-selected number (selection rule under [Provider detail page](#provider-detail-page)) — not a div with a handler, which is required both for keyboard use and for `event.isTrusted` to mean anything.
- The label is `Nazovi` alone, with the phone glyph. No number.
- **On click:** log `phone_click` fire-and-forget, then reveal the number in place beneath the button, itself a `tel:` link. The reveal is synchronous and must never wait on the log.
- One piece of markup is correct on both platforms: on mobile the browser dials natively and the revealed number is there if the handoff fails; on desktop, where `tel:` usually does nothing visible, **the reveal is the outcome**.
- Once revealed it stays revealed for that page view. Clicking the revealed number logs again — that is a real second call attempt, and the hourly cap inside `log_event` bounds any abuse.

**Secondary — `Pošalji e-mail`.** Outlined `--ink`, transparent fill, ≥48px. Rendered **only when `entities.email` is non-null**; when absent the card reserves no space and shows no disabled control.

- A real `<a href="mailto:…?subject=Upit%20o%20pogrebnim%20uslugama">`.
- **Subject prefilled, body never.** A prefilled body would put words in a grieving person's mouth.
- The label says what actually happens. Not `Pošalji upit`, which would imply an in-product form this product deliberately does not have ([SPEC.md](SPEC.md) → Out of scope).
- **No reveal step.** `mailto:` works reliably on desktop, unlike `tel:`, so the click and the outcome coincide. Logs `email_click`.
- Outlined, never filled — the one-dark-mass-per-card rule holds, so the phone action stays visibly primary.

**Relative prominence follows `situacija`**, because the appropriate channel genuinely differs:

| `situacija` | layout |
|---|---|
| `preminuo`, `posljednji-dani` | phone full width; email below, auto width |
| `planiranje` | phone and email side by side, equal width — nobody pre-planning needs a dežurni line, and email is a reasonable first contact |

Phone stays filled and first in every case; only the weight of the email option changes.

**Accepted cost.** Hiding the number is a small usability tax on a product whose first priority is usability, paid to protect the one metric the pitch rests on. The mitigations are that the detail page lists every number openly (below), and that any leak *undercounts* — which is the safe direction to be wrong, since an overstated click count would destroy the number's credibility entirely.

### Card anatomy — others

Deliberately quieter, and reduced rather than restyled: **name, address, and the 24-hour mark outlined rather than filled** if applicable. No service list, no reason line.

**No contact action and no visible number or email address** — the whole card is a link to the detail page. That costs one extra tap for the providers that matched least, and buys two things: the hierarchy stays intact (a second pair of buttons per row would flatten it), and the contact action happens on a page where a `detail_view` has already been recorded, so nothing is dialled off an untracked surface.

### Ranking rules

Computed in the app, not in SQL: one query fetches the city's providers with their services, and ranking is a pure function over that array — which keeps it unit-testable and keeps the rules in one readable place. At 7 rows performance is irrelevant.

In order:

1. **Criteria match** — matching providers above non-matching. This is what produces the block partition.
2. **Urgency**, applied only when `situacija = 'preminuo'`: `available_24_7` first, then presence of an `emergency` phone.
3. **Record completeness** — one point each for: any phone; an `emergency` or `mobile` phone; `working_hours` present; `email`; `website`; ≥5 service rows. A listing that cannot be acted on is worth less to the reader than one that can.
4. **Name, A–Z**, collated with the `hr` locale so Č, Ć, Š, Ž and Đ sort correctly rather than falling to the end of the alphabet.

**A caveat to keep visible:** completeness ranks providers partly by how thoroughly *we* researched them, not by anything they did. It sits last of the substantive terms, after availability, and the remedy is to complete the data rather than to weight it differently. Worth revisiting if a provider ever complains, because the complaint would be fair.

**Deliberately not ranking terms:**

- **`events` click or view counts.** Ranking on them makes the metric self-fulfilling and destroys its value as evidence for any future pay-per-lead conversation ([SPEC_database.md](SPEC_database.md) → What the numbers are worth). This is the tempting one; it stays out.
- **Anything paid.** No charging in Phase 1 ([SPEC.md](SPEC.md) → Never), and the transparency footer is a promise.
- **Random or rotating order.** Non-deterministic order breaks the shareable-URL guarantee and makes *"here is why these"* unverifiable.
- **Price.** No provider in the pilot publishes one — `price_from` and `price_to` are null throughout.

The rules are published, not just documented: the transparency footer links to a short `/kako-rangiramo` page stating them in plain Croatian.

## Provider detail page

`/pogrebne-usluge/split/{slug}`, using the stored `entities.slug` — never re-derived at query time ([SPEC_database.md](SPEC_database.md) → Deriving `entities.slug`). Unknown slug → 404, not a redirect to the city page.

**Above the fold, in this order:** name, 24-hour mark, call button, address, open-now status.

### Phone selection

Which number the primary action dials — one rule, shared with the shortlist card:

- If the provider is **currently outside its posted hours** and an `emergency` phone exists → that number, and the button carries the note *"dežurni telefon"*.
- Otherwise → `phones[0]`, the stored primary.

This is the whole point of typing phones in the schema: after hours the office line is useless, and the emergency line is the entire value of the listing.

**The detail page differs from the list page in one respect: every number is shown.** All numbers are listed beneath the button with their type in Croatian (`office` → *ured*, `mobile` → *mobitel*, `emergency` → *dežurni*), each a `tel:` link that logs `phone_click`. The button itself still reads `Nazovi` without a number, for consistency, and needs no reveal step here because the list below already provides it.

That is a deliberate exception. Choosing between a provider's office and dežurni line is core value on this page — and hiding all of them behind clicks would be hostile on the one page a family reaches when they have decided who to call. It also gives the number a no-JavaScript path, which the list page's reveal does not have. The cost is that a number can be dialled off this page without a `phone_click`; that leak is bounded, it always follows a recorded `detail_view`, and it undercounts rather than overcounts.

### Open-now computation

- Computed in **`Europe/Zagreb`**, which observes DST. Getting this wrong is the standard way this kind of feature quietly misleads people ([SPEC_database.md](SPEC_database.md) carries the same warning for reporting queries).
- The three day forms from the schema map as: `{from,to}` → open/closed by clock; `{closed: true}` → *zatvoreno*; `{by_arrangement: true}` → *po dogovoru*, and never a closed state.
- **An absent day means unknown and renders as nothing.** It must never render as *zatvoreno*. Wrongly telling a family a provider is closed is the worst failure this page can produce.
- `working_hours` null entirely → no hours section, and no open/closed claim anywhere on the page.
- `available_24_7` true → the open-now status is always *"Dostupni 0–24"*, regardless of `working_hours`.

### Rest of the page

- **Full service list**, canonical seed order. A price appears only where `price_from` / `price_to` is non-null, prefixed *"od"* and carrying an *"orijentacijski"* caveat. Currently this renders for nobody.
- **Website and email** as secondary text links. Never styled as the primary action.
- **`last_verified_at` is not displayed**, and **no freshness claim of any kind appears** — not even a soft *"podaci se redovno provjeravaju"*. With manual entry the date will go stale, and a visible stale date damages trust more than no date; an unverifiable reassurance is worse than both. The field stays internal, for data-quality triage.
- **Back link to the results, preserving the query parameters**, so returning does not restart the flow.
- **No map.** Coordinates are null for all 7, and a mapping API is a new external integration ([SPEC.md](SPEC.md) → Ask first).

## Routing and URLs

| route | purpose |
|---|---|
| `/` | screen 1 (Situacija) |
| `/pogrebne-usluge/{grad}` | results; screen 2 answered by the path, screens 1 and 3 by query params |
| `/pogrebne-usluge/{grad}/{pogrebnik}` | provider detail |
| `/pogrebne-usluge/{grad}/usluga/{usluga}` | indexable service-filtered listing |
| `/sto-uciniti-prvo` | guidance page |
| `/kako-rangiramo` | the ranking rules in plain Croatian |

### Resolving the entity/service slug collision

This settles the open question in [SPEC_database.md](SPEC_database.md) → Open questions, which correctly deferred it here. **Option 1 — segment the namespace.** The two kinds of thing are separated because they are not the same kind of thing:

- **Flow and filter state → query parameters.** `?situacija=…&nacin=…&pokojnik=…`. Not canonical pages: each carries `rel=canonical` to the bare city page and is excluded from the sitemap. Collision is impossible, the URL stays shareable, and this is where the wizard's answers already live.
- **Indexable service listings → `/usluga/{slug}`.** The literal `usluga` segment makes the collision *structurally* impossible rather than accidentally absent — it survives a future provider named "Urne", which is the exact case that made the current arrangement unguarded rather than merely unbroken.

`/kremiranje/split` (option 2) is rejected: it reads well and matches search intent, but it puts a data-driven vocabulary at the URL root, colliding with every future top-level route (`/o-nama`, `/sto-uciniti-prvo`, `/kako-rangiramo`) and creating a second route tree with a second template to maintain.

### Which service pages exist

A service page is generated only when the service, in that city, has **≥3 providers and fewer than all of them.** Both halves matter: below three the page is thin content, and at all-of-them the page is a duplicate of the city page under a different URL.

Applied to the Split pilot, six pages qualify:

| generated | not generated |
|---|---|
| `osmrtnice` (6), `sredivanje-dokumentacije` (6), `lijesovi` (6), `kremiranje` (4), `glazba-na-pogrebu` (4), `uredivanje-pokojnika` (3) | all-7: `organizacija-pogreba`, `prijevoz-pokojnika`, `prijevoz-pokojnika-inozemstvo`, `cvjetni-aranzmani` · under-3: `uredenje-groba` (2), `fotografiranje-pogreba` (2), `nadgrobni-spomenici` (1), `ekshumacija` (1) · unused: `urne`, `balzamiranje` |

The route exists before most of its pages do, and the set changes as data lands — so the rule is evaluated at build time from the data, never hardcoded as a list.

## Visual system — Kamen

Chosen from three rendered directions on a design canvas; the two unchosen ones (Ploča, Arhiv) and the earlier round remain there for reference: <https://claude.ai/code/artifact/8d8d6b3e-1215-443d-a8f6-8aa19ab5ebfc>

### The idea, and why it constrains what follows

Dignity in this domain has never come from ornament. It comes from **inscription and permanence** — carved letters, a cut rule, a name in stone. That is a real constraint, not a mood: carved inscription is *dark letters in pale stone*, never the reverse, which is why this is a light-ground design despite being a black-and-gold one. The reference is local and literal — Brač limestone, the Diocletian colonnade, Lovrinac.

Two rules fall directly out of it and govern every decision below:

- **Gold is a cut line, not a surface.** Hairlines, tracked labels, the reason line, the 24-hour mark. Never a fill behind body text, never a gradient, never a whole-card border. Gold as a surface is the exact point where classical turns kitsch.
- **The single heaviest thing on any screen is the call button**, because it is the most important action. Nothing else gets a solid dark fill — the email CTA beside it is outlined precisely so this stays true.

`Kamen` also means no containers: entries are separated by gold rules the way lines are cut on one tablet. This is what distinguishes it from the rejected Ploča variant, and it is the reason the design still reads calmly at 40 providers.

### Colour tokens

Exact values, as approved in the mockup. Warm and desaturated throughout — no pure white and no pure black anywhere.

| token | value | use |
|---|---|---|
| `--stone` | `#E9E5DB` | page ground |
| `--stone-inset` | `#DDD8CC` | image band, inset strips |
| `--ink` | `#1E1B16` | business names, headings, call-button fill |
| `--ink-body` | `#443F35` | service lists, body copy |
| `--ink-quiet` | `#3B362D` | names in the others block |
| `--text-secondary` | `#756E60` | addresses, footer |
| `--text-label` | `#857D6D` | uppercase tracked labels |
| `--text-muted` | `#8C8474` | helper lines |
| `--gold` | `#8A6C28` | rules, labels, filled 24-hour mark |
| `--gold-link` | `#7A5F22` | links (hover `#5C4718`) |
| `--gold-on-ink` | `#DFC489` | call-button text and icon |
| `--rule-gold` | `rgba(138,108,40,.55)` | shortlist entry separators |
| `--rule-quiet` | `rgba(30,27,22,.13)` | others-block separators |

Round 1's brighter gold was tuned for a black ground and is not legible here — `#8A6C28` is the light-ground value and replaces it everywhere.

**Stone texture**, on the image band and inset strips only: two `repeating-linear-gradient`s over `--stone-inset`, at `102deg` (`rgba(30,27,22,.045)`, 1px on 7px) and `14deg` (`rgba(30,27,22,.03)`, 1px on 11px). Deliberately near-invisible; it exists so the band does not read as a flat grey box when no image has loaded.

### Single theme, deliberately

Kamen is committed to one visual world: **no dark mode, no `prefers-color-scheme` handling, no theme toggle.** Inverting it inverts the concept, and a toggle is one more control on a page whose job is to have almost nothing on it. The ground and every colour are painted explicitly so the page holds regardless of host or browser setting.

### Typography

Two faces, each with one job. Round 1 established that a single Garamond serving both fails at data sizes — that finding is what fixed this split.

- **Cinzel** (400/600) — the dignity carrier: business names, page and section headings, the reason line. Roman capitals need tracking, so **never below `.04em`**, and never below **12px**. Never used for body copy.
- **Archivo** (400/500/600) — the legibility carrier: addresses, service lists, labels, button text, footer, all guidance prose. Everything the reader actually has to get through quickly.

Loaded from Google Fonts, the one font host permitted. Fallback stacks declared on every rule: `Cinzel, Georgia, serif` and `Archivo, 'Helvetica Neue', Arial, sans-serif` — both fallbacks have full Croatian coverage, so a font failure degrades rather than breaks.

**Type scale** (design width 390px):

| role | face | size | tracking |
|---|---|---|---|
| page title | Cinzel 600 | 22px | .08em |
| city line | Cinzel 400 | 14.5px | .13em |
| section heading | Cinzel 600 | 13px | .18em |
| card name | Cinzel 600 | 17px | .05em |
| card name (others) | Cinzel 400 | 14px | .05em |
| reason line | Cinzel 400 | 13px | .04em |
| uppercase label | Archivo 400 | 10.5px | .17em |
| context value | Archivo 400 | 14.5px | — |
| address | Archivo 400 | 13px | — |
| service list | Archivo 400 | 12.5px, lh 1.75 | — |
| button label | Archivo 500 | 14px | .05em |
| footer | Archivo 400 | 12px, lh 1.8 | — |

**Floor:** 12px for anything carrying real content. 10.5px is permitted only for uppercase tracked labels, which are navigational rather than informational.

### The diacritic constraint

**Binding, and checked before any face is locked in.** Every display face must render **Č č Ć ć Ž ž Š š Đ đ** from the face itself, not from a fallback. Falling back mid-word is the most visible quality failure available to a Croatian-facing product, and classical display faces are exactly where it happens.

Test string, rendered in every face at every weight used:

> `Čč Ćć Žž Šš Đđ` — `Pogrebne usluge Čagalj · Žrnovnica · Đakovo · Šibenik`

**Cinzel's `latin-ext` coverage must be verified against the live Google Fonts payload**, not assumed — `Đ`/`đ` is the likely gap. If it falls back, Kamen needs a substitute inscriptional face and the candidates to test are Cormorant SC, Spectral SC, or a self-hosted alternative; the direction survives the substitution, since it rests on Roman capitals rather than on Cinzel specifically. This check is a build gate, listed below.

### Layout and shape

- Single column, mobile-first, **390px design width**, **22px page gutter**. On wider viewports the column caps at **560px, centred** — a list page gains nothing from a second column.
- **Flex/grid with `gap` throughout**, never per-element margins for sibling spacing.
- Section separation 26–32px; card internal gap 9–10px.
- **No `border-radius` anywhere. No shadows. No gradients** other than the stone texture.
- All rules are 1px. The double rules belong to the rejected Arhiv variant and are not part of Kamen.
- **Hit targets:** both contact buttons ≥48px tall; every other tappable element ≥44px.

**Exactly two button styles exist**, and no third may be added:

| style | fill | border | label | used for |
|---|---|---|---|---|
| primary | `--ink` | none | `--gold-on-ink`, Archivo 500, 14px, .05em | `Nazovi` |
| secondary | transparent | 1px `--ink` | `--ink`, Archivo 500, 14px, .05em | `Pošalji e-mail` |

Both square, both ≥48px, neither with a radius or shadow. A revealed phone number rendered beneath the primary button is not a third style — it is a `--gold-link` text link at 14px with tabular figures.
- Wide content gets its own `overflow-x: auto` container; the page body never scrolls sideways.

### Icons

**Exactly one icon exists in the product:** the phone glyph on the call button. Inline SVG, stroke-based, 1.8px stroke on a 24px grid, `currentColor`. No icon set, no emoji, anywhere.

### Image policy

Images are in scope and chosen by the project owner — this is the frame they sit in, not a ban.

- **One image maximum per page**, and only where it does work: the results header band, and the top of `/sto-uciniti-prvo`. The provider detail page uses `logo_url` at small size if present, never as a hero.
- **Subject:** stone, architecture, light — Brač limestone, the Diocletian colonnade, cemetery architecture. **Never people, never hands, never candles, never lilies.** That imagery is the funeral industry's own native slop and it loses the register instantly.
- **Treatment:** bounded band with a 1px gold rule beneath. Never full-bleed, never behind text, never carrying a text overlay. Desaturated toward the stone palette so it reads as part of the ground rather than a photograph pasted onto it.
- **Aspect** ~2.6:1 (390×150 at design width). Served as WebP/AVIF at 2×, with explicit `width`/`height` to prevent layout shift.
- Illustration is allowed on identical terms — engraving-style line art, ink on stone.
- **Every page must render correctly with no image at all.** The stone texture exists for exactly this state, and the POC ships whether or not any image has been chosen.

### Motion

**None on the path to results.** No scroll reveals, no fades, no skeleton shimmer, no page-load sequence. The only permitted state changes are the focus ring and the tile press state. `prefers-reduced-motion` is satisfied trivially, because there is nothing to reduce.

### Accessibility

- **Contrast must be measured, not assumed.** Two pairs are the ones at risk: `--gold` on `--stone` (the reason line, at 13px) and `--text-label` on `--stone`. If either misses WCAG AA for its size, darken to `--gold-link` (`#7A5F22`) rather than enlarging the type — the type scale is load-bearing.
- **Visible focus state on every interactive element**: 2px `--ink` outline, 2px offset. Outlines are never removed.
- The call button is a real `<a href="tel:…">`, not a div with a handler — required for keyboard use, and required for `event.isTrusted` gating to mean anything.
- One `<h1>` per page; section headings are `<h2>`.
- **The 24-hour mark is never colour-only** — it carries the text `24 SATA`. Same for the outlined variant in the others block.

## Instrumentation

Applying [SPEC_database.md](SPEC_database.md) → Client-side rules to these specific screens. Those rules are binding; what follows is where each one bites here.

1. **`detail_view` fires from a client component in `useEffect` after mount — never from the server component.** This is the highest-risk instance of that rule in the product: the results page links to up to seven detail pages, so Next.js `<Link>` prefetch on hover would otherwise log a view for every provider a user merely scrolled past, inflating precisely the providers drawing the most attention. Prefetch fetches the RSC payload without mounting client components, so a post-mount effect is immune.
2. **Environment guard** — log only when `process.env.NODE_ENV === 'production'` **and** the hostname is the real host. `npm run dev` points at the production database, so without this the developer's own refreshes are the largest contributor in month one.
3. **`phone_click`** on the shortlist `Nazovi` button, on the number it reveals, on the detail-page button, and on every number in the detail-page list. Gated on `event.isTrusted`. The others block has no phone action, so nothing there can fire. **The log call must never gate the reveal** — reveal synchronously, log fire-and-forget, in that order.
4. **`email_click`** on the shortlist `Pošalji e-mail` button and on the detail page's email link. This is a change from the original design, where `email_click` was a detail-page-only event; the list-page email CTA makes it a primary-surface signal, and for the `planiranje` path probably the dominant one.
5. **`website_click`** on the detail page's website link.
6. **Fire and forget** — `supabase.rpc('log_event', …)` unawaited, errors swallowed. A failed log must never delay a `tel:` handoff or a `mailto:` handoff. The contact is the point; the metric is not.
7. **One log per mount**, guarded against StrictMode's double-invoked effects.

**Not logged in Phase 1: the flow's answers.** Knowing which services families actually ask for would be genuinely valuable, but it needs a new `event_type` or a new column — ask-first ([SPEC.md](SPEC.md) → Ask first) — and a combination of `situacija` + `nacin` + `pokojnik` starts to look like a fingerprint, which is the boundary that keeps `events` outside GDPR scope. Out.

**One consequence worth recording:** the shortlist means ranking position now affects clicks. That makes the deferred per-card impression event ([SPEC.md](SPEC.md) → Future considerations) more meaningful than its note implies — without it, a provider's click count cannot be separated from where the ranking put them. Still deferred; adding an enum value later stays a one-liner.

## Out of scope for the POC

| not built | why |
|---|---|
| Map view | coordinates null for all 7; a mapping API is a new external integration (ask-first) and adds no decision value at 7 providers |
| Reviews / ratings | no review data exists, and inventing it is a Never |
| Price calculator, cost tables | zero `price_from` rows; this is the entire model of the German portals and we cannot honestly run it |
| Geolocation, distance sort, "blizu mene" | no coordinates, and no user location is collected |
| Side-by-side comparison table | seven cards on one screen already is the comparison |
| Lead form, contact form, email capture, callback request | out by [SPEC.md](SPEC.md) scope; also the thing that would force a consent banner |
| Provider login / claim-your-listing | `owner_id` exists in the schema; the flow is Phase 2 |
| Multi-city typeahead | one city — screen 2 is a button |
| Dark mode | Kamen is single-theme by design |
| English or any second language | the market is Croatian; an English version would be scope with no audience |
| PWA, offline, install prompt | a one-visit product |
| Obituary listings, condolence book, digital memorials | adjacent products, not this one |

## Data dependencies that gate the build

None of these are frontend work, and all of them block or degrade it.

| dependency | gates | status |
|---|---|---|
| `entities.slug` + `unique (city_id, slug)` | every detail route | **applied** — `20260902101500` |
| `events` + `log_event` | all instrumentation | **applied** — `20260902102500` |
| `services.slug` Croatian rename | `/usluga/{slug}` routes and `nacin` values | **applied** — `20260902102000` |
| Production hostname in `log_event` | `source = 'internal'` attribution | **applied** — `20260902143000`; `pogreb.net` and subdomains, plus localhost |
| `working_hours` for all 7 providers | open-now status, after-hours phone selection | populated for roughly one provider |
| `available_24_7` / `emergency` phone reconciliation | urgent-path ranking, after-hours phone | **resolved** by the project owner |
| `entities.email` | the email CTA | populated for all 7; nullable in schema, so the CTA stays conditional |
| Trusted Croatian procedure source | screen 3b guidance strip, `/sto-uciniti-prvo` | with the project owner |
| Cinzel diacritic verification | the whole type system | **not yet checked** |
| Header-band imagery | nothing — pages render without it | not started |

The schema is complete as of 2026-09-02 — nothing in the database blocks a build. What remains gating or degrading it is data and assets, not DDL. The one future migration is the production hostname, needed at deploy time rather than at build time.

## Open questions

- **Screen 3b guidance text.** The project owner is supplying a trusted Croatian source for the *"Gdje je pokojnik sada?"* guidance and for `/sto-uciniti-prvo`. Both render empty until it arrives; neither is written from the German checklists.
- **No-JavaScript path on the list page.** The reveal-on-click behaviour means that with scripting unavailable, the list page's `Nazovi` still dials on mobile (it is a real `tel:` link) but reveals nothing on desktop. The detail page is the fallback, since it lists every number as plain markup. Acceptable, but worth a decision if analytics ever show meaningful no-JS traffic.

### Resolved

- ~~**`available_24_7` contradicts `phones` for two providers**~~ — resolved by the project owner at the data level. The phone-selection rule can rely on `available_24_7` and `phones[].type` agreeing.

- ~~**Croatian copy review**~~ — confirmed by the project owner: `ukop`, *"Osoba je u posljednjim danima"*, and the settlement list all stand.
- ~~**Whether screen 3b ships**~~ — it ships; see above.
- ~~**Entity/service URL namespace collision**~~ — resolved above as `/usluga/{slug}`, closing the open question carried in [SPEC_database.md](SPEC_database.md).
