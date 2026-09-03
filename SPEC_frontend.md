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

## Landing page

`/` is the landing page, and the flow begins one tap later at `/?korak=situacija`.

It exists because the flow could not answer the one question a stranger arrives with. Someone landing from a search result previously met *"Što se dogodilo?"* with no indication of what the site was, who was asking, or what would happen to their answer — which is a great deal to ask of a person in the first hours after a death, and it is also the moment a visitor decides whether this is a directory or a lead broker.

**Structure, in order:** what this is and one primary action, both above the fold; the image band; *"Kako radi"* in three steps; *"Što obećavamo"*; the settlement list and the two prose pages.

Three rules on it:

1. **One primary action.** `Pronađite pogrebnika` is the heaviest thing on the screen, and the bypass beside it is a text link rather than a second button — two buttons would split the action in two. Everything below the fold supports the decision to tap it and must not compete with it.
2. **The promises are the product's actual differentiators**, stated plainly: everyone is listed, nobody pays for position, no personal data is collected, it is free. These are the things the three German reference sites cannot say, and they are worth more here than any description of features.
3. **It states the count from live data** — *"Popis svih sedam pogrebnika…"* — rather than asserting completeness in the abstract. If the count changes the sentence changes with it.

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
| ~~Planiram unaprijed~~ | `planiranje` | planning path — **currently hidden** |

**`planiranje` is hidden from the screen, not removed from the code.** Pre-planning is a different product with a different pace — the whole flow is built for someone who has hours rather than days — and whether it belongs here at all is an open question. Hiding the tile is the reversible half of that decision: the value still parses from a URL, still ranks, and still drives copy, so an old shared link keeps working and re-enabling it is one entry in `VISIBLE_SITUACIJA` (`web/lib/copy.ts`). If it is ever dropped for good, the `planiranje` member of `Situacija`, its label, and the urgency note in `lib/ranking.ts` go with it.

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

**Decided: 3b ships, and its guidance text is now written and sourced.** The text is a claim about Croatian procedure — who confirms death, what document is issued, what the family must do before a provider can act — so it was never going to be written from the German equivalents, which would be fabrication ([SPEC.md](SPEC.md) → Never).

It was instead researched from **primary sources**, at the project owner's direction, and every sentence is traceable to one of three:

| source | supports |
|---|---|
| [gov.hr — Postupak kod smrtnog slučaja](https://gov.hr/hr/postupak-kod-smrtnog-slucaja/760) | who to call by place of death; the documents the mrtvozornik issues; the three-day reporting deadline and who is obliged to report; that the family chooses the provider directly or through the institution |
| [Pravilnik o načinu pregleda umrlih (NN 46/2011)](https://narodne-novine.nn.hr/clanci/sluzbeni/2011_04_46_1067.html) | art. 8 — examination within 12 hours for a death outside a health institution; art. 10 — *Potvrda o smrti* in four copies and where each goes; art. 15 — burial ordinarily 24–48 hours after death, and the *dozvola za ukop* required before transfer |
| [MVEP — Prijava smrti](https://mvep.gov.hr/konzularne-informacije-99074/maticarstvo-prijava-rodjenja-braka-ili-smrti/prijava-smrti-179979/179979) | death abroad — the embassy or consulate; the *sprovodnica* required to repatriate remains; that an urn of ashes needs none |

Three rules bind any future edit, and they are enforced in `lib/guidance.ts` where the text lives:

1. **A sentence that cannot be attributed to a listed source does not go in.** Funeral-home marketing pages are not a source.
2. **It is a description of the ordinary procedure, not legal advice.** Where practice varies, say what usually happens.
3. **Deadlines and document names are quoted, not paraphrased** — *"u roku od tri dana"*, *Potvrda o smrti*, *sprovodnica*. A family repeating the wrong word at a counter is a real cost.

**The sources are rendered on `/sto-uciniti-prvo` itself**, not merely recorded in the code — the same reasoning that publishes the ranking rules rather than only documenting them.

⚠️ **Still pending: a native-speaker read and the owner's sign-off.** The facts are sourced; the Croatian phrasing has not been reviewed. Tracked under [Open questions](#open-questions).

## Navigation and state rules

Binding on the implementation:

1. **State lives in the URL, not only in React state.** `/pogrebne-usluge/split?situacija=preminuo&nacin=kremiranje`. Croatian parameter names and values ([SPEC.md](SPEC.md) → Naming Convention). This makes a result set shareable — a family member sends the link to a sibling — survives refresh, and is the surface the rest of the routing hangs off.
2. **Back always works and preserves answers.** During design review, bestattungen.de's own wizard discarded every selection and returned four validation errors at once on the first Continue. That failure mode is the reason this is a numbered requirement.
3. **Every screen is skippable except screen 2**, which is pre-answered from the city path segment and then not shown at all.
3a. **Every page carries the site header** — a wordmark that always returns to the landing page, plus a contextual back link, and a `n / 3` step counter inside the flow. The back link is a real `<Link>` to a known URL rather than `history.back()`: history can hold anything, including another site, and a back control that sometimes leaves the product is worse than none. It also keeps the header working with no JavaScript, like the rest of the flow.
4. **Every question carries an explicit escape** — *"Još ne znam"*, *"Ne znam"*, *"Nije važno"*. Taken directly from bestatter-preisvergleich, which offers "Weiß noch nicht" on every question, and it is the most humane thing on that site.
5. **No validation errors are possible.** Nothing is required, nothing is typed, so nothing can be wrong. The flow must never block on input.
6. **Results are reachable in at most three taps**, and in one tap via the screen 1 bypass.
7. **No modals, no carousels, no animation on the path to results.**

## Results page

The destination of the flow, and the page the whole product exists to render.

### Block structure, top to bottom

1. **Site header** — wordmark home link and a back link into the questions. Shared with every other page.
2. **Header** — title, *"Split i okolica"*, and the answers read back on one quiet line with a *"promijenite"* link into the flow (which must arrive with the current answers still selected). Closing gold rule.
3. **`NAJBOLJE ODGOVARA · N`** — the shortlist.
4. **`OSTALI POGREBNICI · N`** — everyone else, quieter but complete.
5. **Guidance strip** — conditional on `situacija` and `pokojnik`; links to `/sto-uciniti-prvo`. Text is sourced from the primary references listed under [screen 3b](#question-3b--conditional-on-sourcing). Omitted entirely — rules and link included — when neither answer has guidance attached, rather than rendering an empty bordered strip.
6. **Transparency footer** — *"Prikazujemo sve registrirane pogrebnike u Splitu i okolici. Nitko nam ne plaća za bolju poziciju."*, then the settlement list.

**Two things moved here after the page was built and reviewed, and both were hierarchy problems rather than content problems:**

- **The provider count is gone from the header.** It used to open the context strip — *"Sedam pogrebnika · odabrali ste…"* — in the most prominent position on the page. Both section headings already carry `· N`, so it was the same number stated three times, and it was the first thing the eye met on a page whose job is to present providers.
- **The guidance strip moved below the two blocks.** Above them it read as the page's main content and pushed the actual service into second place. It is genuinely useful and honestly sourced, but a family that arrived here to find someone to call should meet the providers first; below the list it catches the reader who did not find what they needed. The settlement list moved to the footer for the same reason — it qualifies the claim rather than introducing it.

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
  1. **Rarest *eligible* service** — a service this provider offers that ≤2 providers in the city offer **and** that is a reason to choose a provider, rendered as its short display phrase (*"klesarske usluge"*). Most rare wins ties; ties at equal rarity break on canonical seed order, so the output is deterministic.
  2. **Widest range** — this provider has strictly the most `entity_services` rows in the city → *"najveći izbor usluga"*. A strict maximum: if two providers tie for the most rows, neither is the widest.
  3. **Match confirmation** — a filter was selected and this provider satisfies it → *"nudi kremiranje"*.
  4. Otherwise omitted.

Worked against the pilot data, this reproduces the approved mockup exactly:

**Rarity alone is not sufficient, and this was learned by shipping it.** Implemented literally against the pilot data, the clause produced *"Dežurna linija · ekshumacija"* for Lovrinac and *"Dežurna linija · urne"* for Zec. Both are true, both are rare, and both are the wrong thing to say to someone whose relative died tonight. Worse, it made the widest-range clause **unreachable** — the widest provider in the city always tripped the rare-service rule first.

So a rare service must also be **decision-driving**. Three kinds are excluded, held in `REASON_ELIGIBLE_SERVICES` (`web/lib/services.ts`):

| excluded | which | why |
|---|---|---|
| goods chosen in person | `urne`, `lijesovi` | the same argument that rejects a service picker above — a casket is not a filter, it is an item chosen an hour later, with the provider |
| out of register | `ekshumacija` | a real service and a real search term, but not something that recommends a funeral director in the first hours |
| nice-to-have extras | `fotografiranje-pogreba` | genuinely useful when relatives cannot travel, but it does not drive the choice, and it crowds out a stronger clause |

That list is **copy, not logic** — an editorial judgement about what recommends a funeral director, and the project owner's to change. Adding a service back is safe: the rarity threshold still gates it.

| provider | clause 1 | clause 2 | line |
|---|---|---|---|
| Bila ruža | 24/7 | no eligible rare service, not widest → match | Dostupni 0–24 · nudi kremiranje |
| Bradvica | **24/7** | no eligible rare service, not widest → match | Dostupni 0–24 · nudi kremiranje |
| Zec | emergency line | widest range (12 rows) | Dežurna linija · najveći izbor usluga |
| Lovrinac | emergency line | rarest eligible (`nadgrobni-spomenici`, 1 of 7) | Dežurna linija · klesarske usluge |

**Bradvica's clause 1 changed from the mockup** — it reads *"Dostupni 0–24"* rather than *"Dežurna linija"* because `available_24_7` became true in the availability reconciliation the project owner resolved. That is data drift correctly reflected, not a rule change.

These four lines are asserted exactly in `web/lib/ranking.test.ts` against a fixture captured from the live database, so a change to the rules or the data that breaks them fails the suite rather than silently reaching the page.

Both clauses empty → the card moves to the others block.

**Ranking, the partition and the reason line are one pure function** over the array the city query returns — `web/lib/ranking.ts`, with no database access, no clock and no randomness in it. That is what makes the guarantees above testable rather than merely stated: the partition adding up, the shortlist cap, the "no reason line, no shortlist" rule and the stable ordering are all unit tests.

### Card anatomy — shortlist

Rendered per the **Kamen** direction (chunk 3). Content and order:

1. **Name** — `entities.name`, Spectral SC caps. The trading name as stored, which is what families know (see [SPEC_database.md](SPEC_database.md) — *"Pogrebne usluge Zec"*, not *"Adepto d.o.o."*).
2. **24-hour mark** — filled gold, top right, only when `available_24_7`.
3. **Address** — `address` + city name. Head office only; never implies branch coverage.
4. **Reason line** — Spectral SC, gold.
5. **Service list** — every service the provider offers, in canonical seed order ([SPEC_database.md](SPEC_database.md) → Seed data), joined by `·`. No truncation and no "+N more": at 12 rows maximum this is three lines, and a family scanning for one specific service should not have to expand anything.
6. **Contact actions** — see below.

### Contact actions

**Neither CTA displays the address it acts on.** A visible phone number can be dialled by hand, which produces the conversion without producing the `phone_click` that is the product's only evidence it happened ([SPEC_database.md](SPEC_database.md) → What the numbers are worth). The number is therefore revealed *by* the click that logs it.

**Three actions on one row, equal thirds.** `Nazovite` · `Pošaljite e-mail` · `Web stranica`. The row is the main lever on page height: at seven providers, stacking these would add roughly a screenful, and height is what made the list read as an undifferentiated wall.

Equal widths mean **colour alone carries the hierarchy**, so the one-dark-mass-per-card rule stops being a stylistic preference and becomes the only thing marking the primary action. Nothing else on a card may be filled.

Actions render only when the underlying field is non-null, and the row collapses to two columns or one rather than leaving a gap where a missing action would be. No disabled controls, ever.

**Labels are vi-form imperatives.** `Nazovite`, not `Nazovi`. The ti-form is familiar singular address, and using it on a stranger arranging a funeral is the wrong register in Croatian — a real defect, not a stylistic preference, and it is why the earlier `Nazovi`/`Pošalji` labels were replaced. At the 390px design width all three labels hold one line at 12.5px; at 360px `Pošaljite e-mail` wraps to two, and the buttons stay equal in width and height because 48px is a minimum rather than a fixed height.

**Primary — `Nazovite`.** Dark fill `--ink`, `--gold-on-ink` label, ≥48px tall.

- Markup is a real `<a href="tel:+385…">` on the display-selected number (selection rule under [Provider detail page](#provider-detail-page)) — not a div with a handler, which is required both for keyboard use and for `event.isTrusted` to mean anything.
- The label is `Nazovite` alone, with the phone glyph. No number.
- **On click:** log `phone_click` fire-and-forget, then reveal the number in place beneath the button, itself a `tel:` link. The reveal is synchronous and must never wait on the log.
- One piece of markup is correct on both platforms: on mobile the browser dials natively and the revealed number is there if the handoff fails; on desktop, where `tel:` usually does nothing visible, **the reveal is the outcome**.
- Once revealed it stays revealed for that page view. Clicking the revealed number logs again — that is a real second call attempt, and the hourly cap inside `log_event` bounds any abuse.

**Secondary — `Pošaljite e-mail`.** Outlined `--ink`, transparent fill, ≥48px. Rendered **only when `entities.email` is non-null**.

- A real `<a href="mailto:…?subject=Upit%20o%20pogrebnim%20uslugama">`.
- **Subject prefilled, body never.** A prefilled body would put words in a grieving person's mouth.
- The label says what actually happens. Not `Pošaljite upit`, which would imply an in-product form this product deliberately does not have ([SPEC.md](SPEC.md) → Out of scope).
- **No reveal step.** `mailto:` works reliably on desktop, unlike `tel:`, so the click and the outcome coincide. Logs `email_click`.

**Secondary — `Saznajte više`.** Outlined, identical to the email action, and **always rendered** — the detail page always exists, so this action never disappears and the row is never empty.

**It links to our own detail page, not to the provider's website**, and that is the deliberate choice:

- The detail page is where the provider is actually presented — every number with its type, opening hours, the full service list. A visitor sent straight to the provider's own site leaves the product at the moment they were still deciding, and this is the step where the product is meant to be doing the comparing.
- It keeps any outbound click on a page where a `detail_view` has already been recorded, so nothing is dialled or followed off an untracked surface. That is the same reasoning the [others block](#card-anatomy--others) already uses, now applied to the shortlist as well.

**It logs nothing itself.** The destination fires `detail_view` on mount; logging here too would count one navigation twice. It renders as a Next `<Link>` rather than a plain `<a>` — `ActionLink` chooses from the href, so an internal path gets client-side navigation and `tel:` / `mailto:` do not.

**Layout no longer varies by `situacija`.** An earlier revision gave `planiranje` a side-by-side arrangement and the urgent paths a full-width phone; the three-across row supersedes both. With `planiranje` currently hidden from screen 1 (see [Screen 1](#screen-1--situacija)) the distinction had no live case anyway.

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
| `/` | landing page — what the service is, and the way into the flow |
| `/?korak=situacija\|mjesto\|potrebe` | the three question screens; not canonical, `noindex` via `robots` |
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
| `--text-secondary` | `#6D6659` | addresses, footer |
| `--text-label` | `#6D6659` | uppercase tracked labels |
| `--text-muted` | `#6D6659` | helper lines |
| `--gold` | `#7A5F22` | rules, gold labels, the reason line, both 24-hour marks |
| `--gold-link` | `#7A5F22` | links (hover `#5C4718`) |
| `--gold-on-ink` | `#DFC489` | call-button text and icon |
| `--rule-gold` | `rgba(138,108,40,.55)` | shortlist entry separators |
| `--rule-quiet` | `rgba(30,27,22,.13)` | others-block separators |

Round 1's brighter gold was tuned for a black ground and is not legible here — the light-ground value replaces it everywhere.

**Four values changed from the approved mockup after contrast measurement** (see [Accessibility](#accessibility) for the numbers). The changes are corrections to the mockup, not a new direction:

- **`--gold` `#8A6C28` → `#7A5F22`.** The mockup value measured 3.92:1 on stone, below AA, and it carries real text — the reason line at 13px and the tracked gold labels — as well as the 24-hour mark. Darkening it is the remedy this spec already prescribed. It now equals `--gold-link`; the two token names are kept because they mean different things and may diverge again, but any change to one must be re-measured against the other's use.
- **`--text-secondary`, `--text-label` and `--text-muted` all → `#6D6659`.** All three failed AA (4.02, 3.24, 2.95), and the minimum hue-preserving darkening that clears 4.5:1 lands all three within one unit of each other. Three tokens that must sit at the same lightness to be legible are one token. **Hierarchy between them comes from size, case and tracking, never from colour** — 10.5px uppercase at .17em for a label, 13px sentence case for an address. The three names are kept so the intent of each use site stays readable, but they are one value and must be changed together.

`--stone-inset` `#DDD8CC` is too dark to carry any of these: on it, even the corrected values measure 4.00–4.23. **`--stone-inset` is therefore the image band and decorative strips only, and never a ground for text.** The context strip renders on plain `--stone`.

**Stone texture**, on the image band and inset strips only: two `repeating-linear-gradient`s over `--stone-inset`, at `102deg` (`rgba(30,27,22,.045)`, 1px on 7px) and `14deg` (`rgba(30,27,22,.03)`, 1px on 11px). Deliberately near-invisible; it exists so the band does not read as a flat grey box when no image has loaded.

### Single theme, deliberately

Kamen is committed to one visual world: **no dark mode, no `prefers-color-scheme` handling, no theme toggle.** Inverting it inverts the concept, and a toggle is one more control on a page whose job is to have almost nothing on it. The ground and every colour are painted explicitly so the page holds regardless of host or browser setting.

### Typography

Two faces, each with one job. Round 1 established that a single Garamond serving both fails at data sizes — that finding is what fixed this split.

- **Spectral SC** (400/600) — the dignity carrier: business names, page and section headings, the reason line. Roman capitals need tracking, so **never below `.04em`**, and never below **12px**. Never used for body copy.

  Spectral SC **replaced Cinzel**, which failed the diacritic gate — see [The diacritic constraint](#the-diacritic-constraint). The direction survives the substitution exactly as this spec predicted it would, because Kamen rests on Roman capitals rather than on Cinzel specifically. Spectral SC is a small-caps face, so lowercase input renders as small capitals and the intended inscriptional colour is unchanged; it is also sturdier than Cinzel at the small end, which the 12px floor and the 13px reason line both benefit from.
- **Archivo** (400/500/600) — the legibility carrier: addresses, service lists, labels, button text, footer, all guidance prose. Everything the reader actually has to get through quickly.

**Self-hosted, and never fetched from Google.** This reverses the earlier note that Google Fonts was the permitted font host, and the reason is the same one that keeps the product free of a consent banner: a request to `fonts.googleapis.com` or `fonts.gstatic.com` transmits the visitor's IP address to a third party on every page load. That is a transfer of personal data, and it would put the product back inside the territory a consent banner exists to cover — see [What this is](#what-this-is), where having no cookie banner is a stated requirement rather than a nicety. Self-hosting removes the transfer, and with it the last external runtime dependency the pages have.

Both families are SIL Open Font License 1.1, which permits redistribution and self-hosting; the licences ship alongside the files and must not be removed.

**Six files.** Archivo is variable on `wght` (`100..900`), so one file per subset covers 400/500/600. Spectral SC is static, so it needs one file per weight per subset:

| file | family | subset |
|---|---|---|
| `spectral-sc-400-latin.woff2` | Spectral SC 400 | `latin` |
| `spectral-sc-400-latin-ext.woff2` | Spectral SC 400 | `latin-ext` |
| `spectral-sc-600-latin.woff2` | Spectral SC 600 | `latin` |
| `spectral-sc-600-latin-ext.woff2` | Spectral SC 600 | `latin-ext` |
| `archivo-latin.woff2` | Archivo | `latin` |
| `archivo-latin-ext.woff2` | Archivo | `latin-ext` |

The `latin` / `latin-ext` split and its `unicode-range` values are Google's own subsetting, kept because it is good: a `latin-ext` file is fetched only by a page that actually renders a Croatian diacritic. Only these two subsets are vendored — Google also serves `cyrillic`, `cyrillic-ext` and `vietnamese` for Spectral SC, and the product needs none of them. Spectral SC 600 and Archivo are preloaded, being what the first screenful needs; the rest is left to `unicode-range` to pull in on demand. Provenance, versions and the licence sit in `web/public/fonts/README.md`.

Fallback stacks declared on every rule: `'Spectral SC', Georgia, serif` and `Archivo, 'Helvetica Neue', Arial, sans-serif` — both fallbacks have full Croatian coverage, so a font failure degrades rather than breaks.

**The same rule applies to anything else the pages might load.** No third-party CDN, no analytics script, no embedded map, no external icon set — the product ships one origin. `log_event` is the sole outbound call, it goes to our own Supabase project, and it carries no visitor identifier by design ([SPEC_database.md](SPEC_database.md) → Usage logging). Adding any third-party asset host is a decision with a GDPR consequence, not a build detail.

**Type scale** (design width 390px):

| role | face | size | tracking |
|---|---|---|---|
| page title | Spectral SC 600 | 22px | .08em |
| city line | Spectral SC 400 | 14.5px | .13em |
| section heading | Spectral SC 600 | 13px | .18em |
| card name | Spectral SC 600 | 17px | .05em |
| card name (others) | Spectral SC 400 | 14px | .05em |
| reason line | Spectral SC 400 | 13px | .04em |
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

**Cinzel failed this gate and was replaced by Spectral SC.** The failure is worth recording in full, because it defeated the obvious form of the check.

Cinzel has a glyph for all ten characters, so a `cmap` coverage test passes it. But it draws `Đ` and `đ` as `D` and `d` **with a macron above** rather than with a stroke through the stem — so `Đakovo` rendered as `D̄akovo`. The letters were present and wrong, and no coverage check can see that. It was caught by looking at the rendered page, not by the tooling, which is the lesson worth keeping: **coverage is necessary and not sufficient.**

The test that caught it was geometric rather than a coverage check: a stroke sits inside the letter's own vertical extent, while a macron clears it. Cinzel's `Đ` sat **130 font units** above its `D`; Spectral SC's sits at **0**. It was validated against both known cases before being trusted — failing Cinzel and passing Archivo, matching what the two visibly render.

**Current result: Spectral SC 400, Spectral SC 600 and Archivo all pass** — full coverage of the ten characters, `Đ`/`đ` correctly struck, and the test string fully covered across the `latin` and `latin-ext` subsets.

Every candidate tested other than Cinzel rendered `Đ`/`đ` correctly (Cormorant SC, Cormorant Garamond, Spectral SC, Marcellus SC, Marcellus, Forum, EB Garamond, Playfair Display SC, Sorts Mill Goudy, Gilda Display), so this is a Cinzel defect rather than a general hazard of inscriptional faces. Spectral SC was chosen over Cormorant SC — the other candidate this spec named — for weight at small sizes. Marcellus SC is the closest visual match to Cinzel but ships weight 400 only, which cannot serve the 600 roles in the type scale without synthetic bold.

**The automated check has since been removed**, deliberately: the payloads are vendored in the repo (see [Typography](#typography)), so they cannot change underneath us, and the risk it guarded against only returns when someone swaps or version-bumps a face. The constraint itself still binds. **If a face is ever replaced, check `Đ`/`đ` on `/specimen` before adopting it** — the stroke must cut through the stem, not float above it. Having the glyph is not the same as drawing it correctly, which is the entire lesson of this section.

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

- **Contrast has been measured, and the palette above is the corrected one.** Four of the thirteen tokens missed WCAG AA on `--stone` at the mockup values — two more than this spec anticipated — and all four were darkened rather than the type enlarged, because the type scale is load-bearing. Measured ratios against `--stone` `#E9E5DB`:

  | token | mockup | corrected | ratio |
  |---|---|---|---|
  | `--gold` | `#8A6C28` — 3.92 ✗ | `#7A5F22` | **4.79** ✓ |
  | `--text-secondary` | `#756E60` — 4.02 ✗ | `#6D6659` | **4.52** ✓ |
  | `--text-label` | `#857D6D` — 3.24 ✗ | `#6D6659` | **4.52** ✓ |
  | `--text-muted` | `#8C8474` — 2.95 ✗ | `#6D6659` | **4.52** ✓ |
  | `--ink-body` | `#443F35` | unchanged | 8.31 ✓ |
  | `--ink-quiet` | `#3B362D` | unchanged | 9.53 ✓ |
  | `--ink` | `#1E1B16` | unchanged | 13.64 ✓ |
  | `--gold-link` | `#7A5F22` | unchanged | 4.79 ✓ |
  | `--gold-on-ink` on `--ink` | `#DFC489` | unchanged | 10.13 ✓ |

- **The filled 24-hour mark carries `--stone` text on `--gold`** — 4.79:1. It must not use `--gold-on-ink` `#DFC489`, which measures 3.55 on the gold fill and fails; that token is for the `--ink` button fill only, where it measures 10.13.

- **Any new colour pairing is measured before it ships.** The two the mockup got wrong were both greys that look unremarkable and read as safe.
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
5. **`website_click`** on the detail page's website link, and nowhere else. The shortlist's third action goes to our own detail page rather than to the provider's site, so there is no outbound website click to log from the results page.
6. **Fire and forget** — `supabase.rpc('log_event', …)` unawaited, errors swallowed. A failed log must never delay a `tel:` handoff or a `mailto:` handoff. The contact is the point; the metric is not.
7. **One log per mount**, guarded against StrictMode's double-invoked effects.

**Not logged in Phase 1: the flow's answers.** Knowing which services families actually ask for would be genuinely valuable, but it needs a new `event_type` or a new column — ask-first ([SPEC.md](SPEC.md) → Ask first) — and a combination of `situacija` + `nacin` + `pokojnik` starts to look like a fingerprint, which is the boundary that keeps `events` outside GDPR scope. Out.

**One consequence worth recording:** the shortlist means ranking position now affects clicks. That makes the deferred per-card impression event ([SPEC.md](SPEC.md) → Future considerations) more meaningful than its note implies — without it, a provider's click count cannot be separated from where the ranking put them. Still deferred; adding an enum value later stays a one-liner.

## Known gaps, deliberately deferred

Not out of scope — accepted as incomplete, and tracked here so they are not rediscovered as surprises.

| gap | state |
|---|---|
| **Desktop layout** | The app is mobile-*only* rather than mobile-*first*. Every page caps at a 560px column and centres, which is correct on a phone and leaves a wide desktop window mostly empty — it does not break, but it reads as an unfinished phone app. Deferred by the project owner; a desktop treatment is a real design pass, not a media query, and the mobile experience is the one the product is actually used in. |
| **Landing page imagery** | The band renders as stone texture alone until an image is chosen. Working as designed — every page must hold with no image — but it is not the finished state. |
| **`planiranje` path** | Hidden from screen 1 and still fully wired. See [Screen 1](#screen-1--situacija). |
| **Croatian phrasing review** | See [Open questions](#open-questions). |

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
| Trusted Croatian procedure source | screen 3b guidance strip, `/sto-uciniti-prvo` | **researched and written** from gov.hr, NN 46/2011 and MVEP; pending a native-speaker read and owner sign-off |
| Display-face diacritic gate | the whole type system | **resolved** — Cinzel failed (`Đ`/`đ` drawn with a macron) and was replaced by Spectral SC, which renders correctly along with Archivo. Payloads are vendored; checked by eye on `/specimen` after any font change. See [The diacritic constraint](#the-diacritic-constraint) |
| Header-band imagery | nothing — pages render without it | not started |

The schema is complete as of 2026-09-02 — nothing in the database blocks a build. What remains gating or degrading it is data and assets, not DDL. The one future migration is the production hostname, needed at deploy time rather than at build time.

## Open questions

- **Croatian phrasing review of the guidance text.** The procedural content for the *"Gdje je pokojnik sada?"* strip and for `/sto-uciniti-prvo` is written and every claim is sourced (see [screen 3b](#question-3b--conditional-on-sourcing)). What remains is not sourcing but language: a native speaker should read it, and the project owner should sign it off, before launch. Facts checked; phrasing unreviewed.
- **No-JavaScript path on the list page.** The reveal-on-click behaviour means that with scripting unavailable, the list page's `Nazovi` still dials on mobile (it is a real `tel:` link) but reveals nothing on desktop. The detail page is the fallback, since it lists every number as plain markup. Acceptable, but worth a decision if analytics ever show meaningful no-JS traffic.

### Resolved

- ~~**`available_24_7` contradicts `phones` for two providers**~~ — resolved by the project owner at the data level. The phone-selection rule can rely on `available_24_7` and `phones[].type` agreeing.

- ~~**Croatian copy review**~~ — confirmed by the project owner: `ukop`, *"Osoba je u posljednjim danima"*, and the settlement list all stand.
- ~~**Whether screen 3b ships**~~ — it ships; see above.
- ~~**Entity/service URL namespace collision**~~ — resolved above as `/usluga/{slug}`, closing the open question carried in [SPEC_database.md](SPEC_database.md).
