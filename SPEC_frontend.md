# SPEC: Frontend

> Spec module — the Phase 1 public frontend. See [SPEC.md](SPEC.md) for project context and scope, and [SPEC_database.md](SPEC_database.md) for the schema this reads from.
>
> Status: **built and running locally.** The landing page, the three-screen flow, the results page, provider detail, the indexable service listings, the prose pages and the provider page all exist in `web/`, with ranking and opening hours under unit test.
>
> The layout is **masthead, reading column, footer** at every width — see [Layout and shape](#layout-and-shape). This replaced the sticky desktop rail, which is deleted, and closed the tablet-portrait gap with it. The landing page was rebuilt around the familiar shape (hero, how it works, why us, close) and its `<h1>` now names the reader's situation before the coverage claim — a deliberate reversal, reasoned through under [Landing page](#landing-page). The landing image band is filled by engraved line art rather than waiting on a photograph.
>
> **The product covers seven cities** — Zagreb, Split, Rijeka, Zadar, Osijek, Pula and Dubrovnik, **51 providers** — since the 2026-09-03 expansion and the 2026-09-07 Split okolica fill-in, which took Split from 7 providers to 13 ([SPEC_database.md](SPEC_database.md)). **Passages below that reason about "all 7" are pilot-era and describe Split as it was**; they are kept where the reasoning still holds and are wrong about the count. That turned screen 2 into a real question, replaced the landing page's single-city coverage strip with a city list, and made `cities[0]` a bug rather than a shorthand.
>
> `/za-pogrebnike` is the product's **only form**, for funeral directors. **It is now linked and indexable**: `PROVIDER_FORM_PUBLIC` was flipped to `true` on 2026-09-04, once `/privatnost` existed and the note beside the submit button pointed at it. See [The provider page](#the-provider-page). What remains open is listed under [Open questions](#open-questions), and what still degrades the build under [Data dependencies](#data-dependencies-that-gate-the-build).
>
> **One part of that gate is still open by decision.** `/privatnost` names no controller — it gives a contact address and states that no legal person stands behind the site. That is the contact half of GDPR art. 13(1)(a) and not the identity half. The project owner was shown the gap and chose to flip the flag anyway; it closes with a name, which is a one-line change in that page's `Tko obrađuje podatke` section.
>
> **Naming convention:** UI copy and all URL paths/query parameters are Croatian; code, component names and identifiers are English. See [SPEC.md](SPEC.md) → Naming Convention.

## What this is

A public, read-only Next.js app over the hosted Supabase project. It has one job: get a grieving family from "someone has died and I don't know what to do" to a phone number they can dial, in under a minute, without asking them to research anything.

**Not** a search engine, not a comparison tool, not a lead-generation form. The three German portals surveyed during design ([bestatter-preisvergleich.de](https://www.bestatter-preisvergleich.de/), [bestattungen.de](https://www.bestattungen.de/), [bestattungsvergleich.de](https://www.bestattungsvergleich.de/)) all end their flow in a contact form and monetise the lead. Phase 1 deliberately ends in the actual list of providers, with no email gate and nothing to submit — see [SPEC.md](SPEC.md) → Phase 1 scope, where lead forms and monetisation are out of scope.

Two consequences of that, which are requirements rather than side effects:

- **No personal data is ever collected from the people this product is for.** A visitor looking for a funeral director gives no email, no name, no phone number, and never signs in. There is no submit button anywhere on that path — not on the landing page, not in the flow, not on the results or detail pages.

  **The one exception is [`/za-pogrebnike`](#the-provider-page), and it is an exception to the audience rather than to the rule.** It carries a form for funeral directors — corrections, missing listings, collaboration — because the businesses being listed had no way to reach us at all, which was a tracked gap and an E-E-A-T problem. A provider writing to us about their own listing is initiating, about their own business, and can see exactly what they are sending. **A family never meets it**: it is not linked from the flow, the results or the detail pages, and the one link on the landing page sits after the close, set as the quietest thing on it.

  This does not soften the promise. The no-personal-data promise is addressed to the person looking for a funeral director, and it stays true for them word for word — which is why the promise wording was deliberately left unchanged when the form shipped.
- **No cookie banner.** The no-PII design of `events` ([SPEC_database.md](SPEC_database.md) → Usage logging) is what earns this, and the provider form does not touch it: it is a plain HTML POST that happens only when a provider presses a button, so nothing is stored, read back or tracked on any visitor's device. All three reference sites have a consent wall; not having one is a visible usability advantage and must not be traded away.

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

It exists because the flow could not answer the one question a stranger arrives with. Someone landing from a search result previously met screen 1's question with no indication of what the site was, who was asking, or what would happen to their answer — which is a great deal to ask of a person in the first hours after a death, and it is also the moment a visitor decides whether this is a directory or a lead broker.

**Structure, in order:** the `<h1>` and one primary action, both above the fold; the image band; *"Gradovi koje pokrivamo"*; *"Kako do pogrebnika"* in three steps; *"Zašto baš ovdje"* — the four promises — ending in a link to the full page; the closing action; the provider line (currently hidden). The landing page is the only page that lays out against the wide `--frame` rather than the reading measure ([Layout and shape](#layout-and-shape)), which is what lets the steps and the promises run horizontally.

Four rules on it:

1. **One primary action.** `Pronađite pogrebnika` is the heaviest thing on the screen, and the bypass beside it is a text link rather than a second button — two buttons would split the action in two. Everything below supports the decision to tap it and must not compete with it. **The closing CTA is the same action, not a second one** — repeating it at the foot of a longer page is the familiar shape, and it does not break the rule because there is still exactly one *kind* of heaviest thing on the screen.
2. **The promises are the product's actual differentiators**, stated plainly: everyone is listed, nobody pays for position, no personal data is collected, it is free, and the ranking rules are published rather than described. These are the things the three German reference sites cannot say, and they are worth more here than any description of features. Each one is stated in a sentence here and **in full on [`/nase-obecanje`](#the-promise-page), where it also carries what it rules out**.
3. **The `<h1>` names the reader's situation first and carries the search terms second**, both inside the same `<h1>` — a question about what has happened, then the product phrase. The wording is in `components/Landing.tsx`.

   **This reverses the rule that made the coverage claim the `<h1>`**, and the reasoning that rule rested on still stands — a stranger reads a count as the size of our database rather than the size of the market. What it got wrong is which question comes first. It was answering *how do we assert completeness* when the first thing a stranger arriving from a search result brings is *is this for me*. Naming their situation answers that in four words; the coverage claim then answers the second question, in the strip directly under the action, where it reads as evidence rather than as an opening boast.

   Two limits on the reversal, both binding:

   - **The empathy line gains a clause; it never displaces the keywords.** The product phrase stays inside the `<h1>`. This product's entire distribution channel is Croatian-language search, so an `<h1>` that reads beautifully and ranks for nothing is not a trade available to it.
   - **The situation named is the one the product is built for**, and it is put as a question rather than an assertion — it matches screen 1's urgent path, and the lede catches the reader it does not describe. An `<h1>` that told a visitor what had happened to them would be worse than a generic one.
4. **The claim is coverage, not a count** — but the subject changed with the city expansion, and so did what may be counted.

   The single-city coverage strip is gone. In its place is **a list of every covered city, each linking to its own page and carrying its coverage status**, under a note built from `nationalCoverageClaim` + `providerFloor` — both derived from the live rows, so neither can go stale.

   **Exact provider counts came off this page on 2026-09-07** (project owner). Each city used to carry its own — *"20 pogrebnika"*, *"2 pogrebnika"* — on the argument that a count beside a link the reader can check is a fact rather than a boast. What that missed is what the column actually did: it ranked the cities by size, and a family in Dubrovnik needs to know their town is covered, not that it is the smallest number on the page. Each city now reads **"svi registrirani"**, which is the same promise `coverageClaim` makes on the city page itself, in two words.

   Two numbers survive on this page, and both are shapes that cannot go stale:

   - **The city count**, because it is the size of the *product* rather than of our database — which is exactly what a stranger is trying to establish, and it moves in a direction that is unambiguously good news. This is the distinction the original objection to *"svih sedam pogrebnika"* actually drew.
   - **A floor, not a total** — `providerFloor` rounds down to the previous ten, so *"više od 50"* is true when written and can only become more true as providers are added. That property is the whole permission: a claim nobody has to maintain.

   **The `<h1>` no longer names a city**, and that is right for search rather than a concession: this page should rank for *pogrebne usluge*, and `/pogrebne-usluge/{grad}` — which has its own `<h1>`, its own metadata and its own `coverageClaim` — should rank for *pogrebne usluge split*. One page trying to be both would be weaker at each.

   The city list also **is the bypass**. It is set as text links rather than buttons so it cannot compete with the one primary action, and it replaces a single-city "show me everything" link, which had no meaning once there were seven cities to be "all" of.

   Three guardrails come with it, all binding:

   - **The wording is `coverageClaim` in `web/lib/copy.ts`, and it says "registrirani".** The qualifier is what we can stand behind — a provider operating with no registry entry we could find is exactly the case it is honest about. The claim is also about **the pilot area, not any provider's service radius**; both limits are `CATCHMENT`'s and they still apply.
   - **No exact provider count appears in customer-facing prose anywhere** (project owner, 2026-09-07). Two arguments, and only the first is about maintenance: a sentence built from two live counts — *"of the N providers listed, M offer…"* — has to be re-read every time the data moves; and the proportion was the fact the reader wanted, while the count made them do arithmetic first. `providerShare` in `web/lib/copy.ts` replaces them with a **worded share** read from the same live rows — *"većina pogrebnika"*, *"gotovo svaki pogrebnik"*, *"manji dio pogrebnika"* — so the wording still changes when the data does. It rewrote the service-page lede (was *"šest od sedam"*) and both count-built sections of `/sto-uciniti-prvo`. Every phrase it returns takes a **singular** verb by construction, which sidesteps the numeral-agreement trap `verbForm` exists for; `countOfTotal` is deprecated for prose and kept only for its numeral rules.
   - **`· N` on the results section headings stays**, and it is the one exception. It is not a claim about the market: it tells the reader how many cards follow, it is derived from the rendered list, and `N₁ + N₂` being the whole set is the partition guarantee those headings exist to make visible — see [Guarantees](#guarantees). Removing it is a two-line change if that reading is ever overruled.
   - **A city page ships only once that city's providers are actually verified.** Coverage stated ahead of the data would be the one version of this claim that is a lie, and it is also how a directory earns a thin-content penalty.

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

**Question:** *Gdje je pogreb?* — with a hint under it naming where a funeral usually takes place, since the answer is not obvious to someone who has never arranged one.

Deliberately not "where are you" and not "where is the deceased": a Split provider conducting a burial at the Podstrana cemetery is routine, and only the funeral's location is stable enough to select on.

### The catchment decision

`cities` currently holds exactly one row (Split), and it conflates two different concepts:

- where providers **are** — Split, all 7 of them
- where the **funeral** is — Podstrana, Solin, Kaštela, Klis, Stobreč, Žrnovnica, Omiš, Trogir and more, nearly all with no provider of their own

Under the current model a user in Podstrana cannot be represented at all. **Decision for Phase 1: treat the pilot unit as a catchment area, not a municipality.** The city is offered under its catchment label (`CATCHMENT[slug].label`), and the covered settlements are stated explicitly beneath the list on the results page rather than left to inference.

A user from Podstrana recognises themselves and gets all 7. This needs no schema change and no new data, and at pilot scale it loses nothing, because all 7 serve the whole area.

Three constraints on this, all binding:

0. **Every city in `cities` must have a `CATCHMENT` entry**, and the six added on 2026-09-03 were approved by the project owner with their locative forms (decision 12, `data/PILOT_CITIES_REVIEW.md`). A city without one still renders — every consumer falls back to `city.name` — but the fallback drops an uninflected proper noun into a locative slot, so `coverageClaim` reads *"u Zagreb"* rather than *"u Zagrebu"*. That is a visible defect, not graceful degradation, and it is the reason the entry is part of shipping a city rather than a follow-up.
1. **The claim is about the pilot area, not about individual providers.** No provider's service radius has been verified. Copy may say *"pogrebnici u Splitu i okolici"*; it may never say *"ovaj pogrebnik radi u Podstrani"*.
2. **The settlement list is a product claim, confirmed by the project owner** — Podstrana, Solin, Kaštela, Klis, Stobreč, Žrnovnica, Omiš, Trogir. It is not derived from data and must not be extended by guesswork ([SPEC.md](SPEC.md) → Never: fabricating business data); adding a settlement is an owner decision, not an implementation one.
3. **No distance or proximity claims anywhere.** `entities.latitude` / `longitude` exist as columns but are null for all 7, and `cities` has no coordinates at all. Any "near you" or "X km away" wording is unsupported by the data.

**City #2 arrived, and with it six more.** This screen is now seven buttons — one per covered city, ordered by name, each labelled with its `CATCHMENT` nominative (*"Zagreb i okolica"*). It stays buttons rather than a text input: seven is well inside what a list can carry, and the spec's threshold was always the settlement count making buttons impractical rather than the city count itself.

**The chosen city is now carried in the URL, and that closed a live defect.** While one city existed the answer could be thrown away, because there was nothing to remember — the flow simply sent everyone to `cities[0]`. With seven cities that silently routed a family who had chosen Zagreb to the Dubrovnik listing. The city now travels as `?grad=` (`parseGrad`, `flowHref` in `lib/answers.ts`).

Two rules on it:

1. **`grad` is not part of `FlowAnswers`.** `FlowAnswers` is the input to ranking, and the city is not a ranking term — it decides *which* providers are fetched, not how they are ordered. Keeping it out also stops `?grad=` leaking into the results URL, where the path already says the city and a second spelling would be a duplicate for search engines to reconcile.
2. **Screen 3 cannot render without it.** Arriving at `?korak=potrebe` with no valid city redirects to `?korak=mjesto`. That is not a validation error — nothing was typed and nothing is wrong — it is the one mandatory screen asserting itself, and it also catches a link shared before `?grad=` existed.

**The settlement lists moved off this screen.** Printing seven of them would bury the buttons, so the screen carries one line saying that every city includes its surrounding area and that the settlements are named with the results — and each city's list then appears on its own results page, where it qualifies that page's claim.

### Where this goes later (not built now)

The catchment framing is the cheap form of a model the product will eventually need. Naming the end state here so the framing does not have to be un-learned:

- **Next** — a frontend-only static settlement→catchment map, so typing "Podstrana" resolves. No database, fully reversible. Needed only once screen 2 becomes a text input.
- **Eventually** — a `places` table separating settlement from provider-city, plus coordinates and a per-provider service radius. That is a schema change and therefore ask-first ([SPEC.md](SPEC.md) → Ask first), and premature at 7 providers.

`/pogrebne-usluge/podstrana` as an indexable page listing Split providers is a genuine SEO opportunity with no competition, and legitimate if each page says something specific (which cemetery, which providers work it). Fifteen near-identical pages would be thin content. Deferred, but the catchment framing keeps it available.

## Screen 3 — Potrebe

### Why this is not a service picker

The 16 rows in `services` are a **supply-side taxonomy** — what a provider sells. A family in the first hours needs a **demand-side question** — what they have to decide. Any subset of the taxonomy reads as arbitrary to them: offering "Uređenje groba" but not "Lijesovi" is incoherent, because a casket is not a filter, it is an item chosen with the provider, in person, an hour later. Every provider has caskets.

So screen 3 asks what the family is actually facing.

### Question 3a — the whole screen

**Question:** *Kremiranje ili ukop?*

| option | `nacin` value | effect on the list |
|---|---|---|
| Kremiranje | `kremiranje` | filters to providers offering `kremiranje` — 4 of 7 in the pilot |
| Ukop | `ukop` | **no filter** (see below) |
| Još ne znam | omitted | no filter |

This is the one genuine either/or, it is the first thing every provider asks, and it is the only question in the flow that meaningfully narrows the pilot list.

**`ukop` filters nothing, and the UI must not imply otherwise.** All 7 providers do burials — `organizacija-pogreba` is universal and there is no `ukop` service row. `ukop` and *"Još ne znam"* therefore produce an identical list; what differs is the reason lines and the copy. Stating this here so nobody later "fixes" it by inventing a service row.

**Answering is the submit, as of 2026-09-04.** All three tiles link straight to the results, so nothing stands between choosing and seeing the list. The `Prikažite pogrebnike` button that used to sit at the foot of this screen is gone: it could only ever lead to one place, and on a screen a family reads in a hurry, a tap that changes nothing is a tap worth removing.

That change also repaired *"Još ne znam"*, which was a real defect rather than a style choice. It linked to `?korak=potrebe` with `nacin` cleared — the URL the reader was already on — so the tile rendered in the quiet grey style and then visibly did nothing when tapped. It now goes where the other two go, carrying no `nacin`, which is what it always meant.

### Question 3b — *Gdje je pokojnik sada?* — pulled 2026-09-04

**Not rendered.** The project owner removed it to cut screen 3 to a single question and a single tap. Everything behind it survives untouched — `Pokojnik` and its parsing in `lib/answers.ts`, `POKOJNIK_LABEL` in `lib/copy.ts`, `BY_POKOJNIK` in `lib/guidance.ts` — in exactly the state the hidden `planiranje` situation is in. **Restoring it is markup on screen 3 and nothing else.**

Two consequences while it is out: `pokojnik` is never set, so its guidance line never fires and the strip falls back to whatever `situacija` contributes; and a shared or bookmarked link that still carries `?pokojnik=` keeps working exactly as before, because the parser never stopped reading it.

The rest of this section records why it was built and what its text rests on. It stays accurate for whoever restores it.

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

   **The city is state too**, and it moves between the two halves of the URL: `?grad=` while the flow is running, the path segment once the results are shown. `lib/answers.ts` owns both spellings (`flowHref`, `resultsHref`) so that no page hand-builds a flow URL — which is how the results page's *"promijenite"* link came to point at the landing page instead of at the questions, silently breaking rule 2 below.
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
2. **Header** — title, *"Split i okolica"*, the coverage claim on one line, and the answers read back on one quiet line with a *"promijenite"* link into the flow (which must arrive with the current answers still selected). Closing gold rule.

   The coverage line is here rather than only in the footer because it is the reason to trust this page over a page of search results, and it is the page's own claim rather than the site's — which is why neither the masthead nor the footer may repeat it ([Layout and shape](#layout-and-shape)). It is set in Archivo and ink, not Spectral SC and gold: on this page gold belongs to the reason lines, and a gold claim above them would compete with the thing that justifies the shortlist.
3. **`NAJBOLJE ODGOVARA · N`** — the shortlist.
4. **`OSTALI POGREBNICI · N`** — everyone else, quieter but complete.
5. **Guidance strip** — conditional on `situacija` and `pokojnik`; links to `/sto-uciniti-prvo`. Text is sourced from the primary references listed under [screen 3b](#question-3b--gdje-je-pokojnik-sada--pulled-2026-09-04). Omitted entirely — rules and link included — when neither answer has guidance attached, rather than rendering an empty bordered strip. **Since 3b was pulled, `pokojnik` is never set**, so in practice the strip now renders on `situacija` alone.
6. **Transparency footer** — the neutrality claim (nobody pays for position, nobody is left out), then the settlement list, then links to `/kako-rangiramo` and `/nase-obecanje`. The coverage sentence it used to open with moved up into the header (2); the footer now carries what *qualifies* the claim rather than restating it.

**Two things moved here after the page was built and reviewed, and both were hierarchy problems rather than content problems:**

- **The provider count is gone from the header.** It used to open the context strip, in the most prominent position on the page. Both section headings already carry `· N`, so it was the same number stated three times, and it was the first thing the eye met on a page whose job is to present providers.
- **The guidance strip moved below the two blocks.** Above them it read as the page's main content and pushed the actual service into second place. It is genuinely useful and honestly sourced, but a family that arrived here to find someone to call should meet the providers first; below the list it catches the reader who did not find what they needed. The settlement list moved to the footer for the same reason — it qualifies the claim rather than introducing it.

### Guarantees

These are the page's contract with the user, and they are why the transparency footer is honest:

- **Every provider in the city appears on the page, always.** The two blocks partition the set; they never subset it. No pagination, no "show more" — at pilot scale seven rows fit.
- **The page is never empty.** The shortlist block may be, the page may not.
- **`N` is stated in both headings**, so the reader can see for themselves that the partition adds up — the two numbers are the only count on the page, and they are what makes the header's coverage claim checkable rather than asserted.

### Partition and shortlist size

Let *M* = providers matching every selected criterion (currently only `nacin=kremiranje`; `ukop` and every unanswered question match everything).

| case | shortlist | others |
|---|---|---|
| *M* ≥ 1 | top `min(4, |M|)` by ranking | all remaining, in ranking order |
| *M* = 0 | block omitted, with a line saying no provider in the area offers the chosen service and that everyone is shown instead | all of them |

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

**The detail page differs from the list page in one respect: every number is shown.** All numbers are listed beneath the button with their type in Croatian (`office` → *ured*, `mobile` → *mobitel*, `emergency` → *dežurni*), each a `tel:` link that logs `phone_click`. The button itself reads `Nazovite` without a number and needs no reveal step here, because the list below already provides it. **It read `Nazovi` until 2026-09-07** — the one place in the product still in the ti-form, against the register rule two sections up; the owner settled it on the vi-form, so the detail page, the cards and `/specimen` now all read `Nazovite` / `Pošaljite e-mail`.

That is a deliberate exception. Choosing between a provider's office and dežurni line is core value on this page — and hiding all of them behind clicks would be hostile on the one page a family reaches when they have decided who to call. It also gives the number a no-JavaScript path, which the list page's reveal does not have. The cost is that a number can be dialled off this page without a `phone_click`; that leak is bounded, it always follows a recorded `detail_view`, and it undercounts rather than overcounts.

### Open-now computation

- Computed in **`Europe/Zagreb`**, which observes DST. Getting this wrong is the standard way this kind of feature quietly misleads people ([SPEC_database.md](SPEC_database.md) carries the same warning for reporting queries).
- The three day forms from the schema map as: `{from,to}` → open/closed by clock; `{closed: true}` → *zatvoreno*; `{by_arrangement: true}` → *po dogovoru*, and never a closed state.
- **An absent day means unknown and renders as nothing.** It must never render as *zatvoreno*. Wrongly telling a family a provider is closed is the worst failure this page can produce.
- `working_hours` null entirely → no hours section, and no open/closed claim anywhere on the page.
- `available_24_7` true → the open-now status is always *"Dostupni 0–24"*, regardless of `working_hours`.

### Rest of the page

- **Full service list**, canonical seed order. A price appears only where `price_from` / `price_to` is non-null, prefixed *"od"* and carrying an *"orijentacijski"* caveat.
- **Two CTAs at the top, call and e-mail** (2026-09-07). One column on a phone, halves from 480px up; the primary keeps its weight through fill, not width. Neither reveals a number, unlike the shortlist card — every number is listed in full below, so there is nothing to reveal. The e-mail action needs a client boundary to log its click and does not reuse `ContactActions`, which carries the card's reveal behaviour with it.
- **Four labelled sections, in this order: Kontakt, Usluge, Radno vrijeme, Web stranica** (2026-09-07). The e-mail address moved into `Kontakt`, directly under the numbers and in the same row shape as a `PhoneList` row — the button is the action, the address is the fact. The website kept its place after the opening hours, because sending a visitor off-site earlier ends the visit while they are still deciding, but it gained a heading of its own: the page used to trail off into an unlabelled block of links grouped by *is a link* rather than by what a reader is looking for.
- **`last_verified_at` is not displayed**, and **no freshness claim of any kind appears** — not even a soft *"podaci se redovno provjeravaju"*. With manual entry the date will go stale, and a visible stale date damages trust more than no date; an unverifiable reassurance is worse than both. The field stays internal, for data-quality triage.
- **Back link to the results, preserving the query parameters**, so returning does not restart the flow.
- **No map.** Coordinates are null for all 7, and a mapping API is a new external integration ([SPEC.md](SPEC.md) → Ask first).

## Routing and URLs

| route | purpose |
|---|---|
| `/` | landing page — what the service is, and the way into the flow |
| `/?korak=situacija\|mjesto\|potrebe` | the three question screens; not canonical, `noindex` via `robots`. Carries `?grad=` from screen 2 onward |
| `/pogrebne-usluge/{grad}` | results; screen 2 answered by the path, screens 1 and 3 by query params |
| `/pogrebne-usluge/{grad}/{pogrebnik}` | provider detail |
| `/pogrebne-usluge/{grad}/usluga/{usluga}` | indexable service-filtered listing |
| `/sto-uciniti-prvo` | guidance page |
| `/kako-rangiramo` | the ranking rules in plain Croatian |
| `/nase-obecanje` | the four promises in full, each with what it rules out |
| `/za-pogrebnike` | the provider page — corrections, missing listings, collaboration, and the product's only form |
| `/za-pogrebnike/hvala` | where a submission lands. Reached only by Netlify's redirect; `noindex`, and absent from the sitemap |
| `/privatnost` | the privacy notice, covering the provider form only. `noindex` and absent from the sitemap, by decision — it helps nobody who is searching. Linked from the footer baseline and from beside the form's submit button, which is where art. 13 needs it. **Deliberately not disallowed in `robots.txt`**: a disallowed URL is never fetched, so its `noindex` is never read, and the two mechanisms cancel rather than reinforce |

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

## The promise page

`/nase-obecanje` states the four promises in full. The landing page carries them in a sentence each and links here.

It exists because the promises are the product's only real differentiators and a differentiator stated once in six words reads as marketing. **The design of the page is that every promise carries what it rules out**: *"we don't sell your data"* is a slogan, while *"we cannot sell it because we never collect it — and here is the one thing we do count"* is a position a reader can check and hold us to.

| section | content |
|---|---|
| the four promises | completeness, no personal data, free, published rules — in the same order as the landing page's short form, each with a quieter `što isključuje` line attached. Wording lives in `PROMISES` in the page file |
| *Što bilježimo* | exactly what `events` holds and what it does not: per-provider view and click counts, no IP even truncated, no user-agent, no referrer, no session or visitor identifier |
| *Što obećanje ne pokriva* | no quality judgement and no reviews; no prices; the area is the area of the list and not a per-provider service radius; manual data can go stale |

Three rules on it:

1. **`Što bilježimo` is not a disclaimer bolted on** — it is the second promise being honest about its own edge, stated by us rather than discovered by someone reading network requests. It must stay in step with [SPEC_database.md](SPEC_database.md) → Usage logging: if `events` ever gains a column, this section changes in the same pass.
2. **A promise wording exists once.** The landing page's short form and this page must not drift; a promise worded one way there and another way here reads as the weaker of the two. The 2026-09-07 copy pass broke this for a few hours — the landing promises were retitled and this page's were not — and it was closed the same day by **taking the landing titles as canonical**: the four are now single words on both pages, in the same order, with the sentence and the *što isključuje* line carrying the substance here. A one-word title states the value; a title that is itself a sentence competed with the sentence beneath it.
3. **The four promises are the product's constraints written down**, so a change to any of them is a change to the product, not to copy. Monetisation in particular touches the first and third directly — see [SPEC.md](SPEC.md) → Boundaries, where charging anyone in Phase 1 is a Never, and `.research/RESEARCH_market.md` § 3, where the reason the highest-revenue model in the field is unavailable to us is precisely promise one.

**Still absent: a named owner.** A promise page with nobody behind it is the weakest kind, and a name cannot be invented ([SPEC.md](SPEC.md) → Never: fabricating data); the project owner has chosen not to publish one. It waits on `/o-nama`. Tracked under [Known gaps](#known-gaps-deliberately-deferred).

**The contact route is half closed as of 2026-09-04.** *"Javite nam"* appears on this page and on `/kako-rangiramo`, and until that date neither actually linked anywhere — a defect, since earlier revisions of this spec and of `CLAUDE.md` both claimed they did. Both now link to `/za-pogrebnike`. On this page the phrase lives inside a plain-string array, so the address sits in a sentence below the list rather than inside the sentence that promises it. What is still missing is a route for a member of the public who is not a funeral director; that half is untouched.

**The closing note carries no count**, deliberately. An earlier version described the coverage as one area and a small number of providers, and said so straight through the seven-city expansion. A hand-written number here goes stale exactly the way `cities[0]` did; the landing page counts cities from the live rows so that prose like this does not have to.

## The provider page

`/za-pogrebnike` carries the product's only form. It exists because the businesses being listed had no way to reach us at all — the tracked half of the *"javite nam"* gap, which `/kako-rangiramo` and `/nase-obecanje` both said with nowhere to write to. Both now link here.

**It is named for its audience, not for the transaction.** A menu item reading *Kontakt* would promise a grieving visitor a route that does not exist: there is still no user-facing form and no published address, by decision. *Za pogrebnike* says who the page is for, which is also how the providers who need it find it.

| section | content |
|---|---|
| *Prije nego pišete* | three facts stated before the form rather than after it, because they are what a provider decides on: listing is free, position cannot be bought (linking to `/kako-rangiramo`), and the data is entered by hand and therefore goes stale |
| the form | company (required), OIB, city, reason, contact name, phone, email (required), message. Croatian labels, English field names — [SPEC.md](SPEC.md) → Naming Convention |
| the note under it | what happens to what they send, and that the search itself asks nothing of anybody |

Five rules on it, all binding:

1. **A family never meets it.** It is not linked from the flow, the results or the detail pages. The one link on the landing page sits after the close, set as the quietest thing on the page — secondary text with an inline link, never a heading and never an action. Placement is the rule, not just the styling: printed under *"nema obrasca"* it would read as a contradiction whatever it said.
2. **The four promises do not change because this page exists**, and the wording was deliberately left untouched. See [What this is](#what-this-is) for why the second promise stays true as written.
3. **The note under the form is not a disclaimer bolted on.** The site tells families it asks nothing of them; a provider is entitled to the same plainness about what happens to what they choose to send. It is the same reasoning that puts *Što bilježimo* on the promise page.
4. **No JavaScript.** A plain HTML POST with a honeypot, like the rest of the product. Nothing about the form needs a client component, and a form that fails silently without scripting would be worse here than anywhere else.
5. **It stays a correction-and-collaboration route, never a lead form.** Lead brokerage is what the product is defined against ([What this is](#what-this-is)), and the direction of this form is the opposite one: providers writing to us about themselves, not families writing to providers.

### How the form actually works

**Netlify Forms**, which is a new external integration and therefore an ask-first decision ([SPEC.md](SPEC.md) → Ask first) — authorised by the project owner. It does not touch the one-origin position: no third-party script is loaded, and the POST goes to the site's own host, which is Netlify either way.

Netlify discovers forms by scanning the static HTML a build emits. An App Router page is rendered by the runtime rather than written out as a plain file the scanner reads, so a form declared only inside a React component is **never registered and its submissions are silently dropped**. The documented workaround, and what is implemented:

- `public/__forms.html` holds the field definitions, `data-netlify` and the honeypot. **That is all it does.** It exists to be scanned at build time; no browser ever submits it.
- **The React form POSTs to its own `action`, and that `action` is the success page** — `/za-pogrebnike/hvala`. Netlify intercepts the POST at the edge, matches `form-name` against the scanned definition, stores the submission, and redirects there.
- **The two field lists must stay identical.** A field added to the React form and not to `public/__forms.html` arrives empty, with no error anywhere — which is the failure mode worth writing down, because nothing surfaces it.

**Corrected 2026-09-04 by the first live submission.** This section previously had it backwards: it said the `action` in `__forms.html` decided where a submission lands, and the React form accordingly POSTed to `/__forms.html`. Submissions were stored correctly, but the sender was dropped on Netlify's generic confirmation page instead of `/za-pogrebnike/hvala`. The redirect follows the `action` of the form the browser actually submits, so it has to live on the React form. The two files are kept identical anyway, so that reading either one alone does not mislead.

✅ **Verified 2026-09-04.** Submissions reach Netlify → Forms → `pogrebnici`. The event log fires from the live domain as well. What the first submission also surfaced is the redirect defect recorded above.

### The gate: opened on 2026-09-04

**`PROVIDER_FORM_PUBLIC` in `lib/nav.ts` is now `true`.** It was `false` as a compliance gate rather than a soft launch: the form collects a name, an e-mail address and a phone number, and GDPR art. 13 requires telling that person who the controller is, the legal basis, the retention period, their rights and how to complain to AZOP. The note under the form covered roughly a third of it and nothing covered the rest.

What opened it: `/privatnost` now covers the rest, and a second note beside the submit button links to it — at the point of collection, since art. 13 is about what the person knows *before* they submit. Flipping the flag re-linked the route in the menu, the footer, the landing page, the sitemap and the two prose pages at once, and its `noindex` override was removed in the same change.

**What is still open, by the project owner's decision:** `/privatnost` names no controller. It publishes a contact address and states plainly that no legal person stands behind the site — honest, and the contact half of art. 13(1)(a), but not the identity half. The gap was put to the project owner explicitly before the flag was flipped. It closes with a name.

Recorded for whoever reads this next: **while the flag was `false`, the route was still reachable by URL** — the gate was "offered to nobody", never "unreachable". Anyone reasoning about what was exposed before 2026-09-04 should read it that way.

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

  **Spectral SC's figures are cap-height, and that has caught us once.** Set as a step number, `01` reads as `OI` — the 1 loses its foot and the 0 is indistinguishable from an O. So **figures that carry meaning are set in Archivo**, which is what the two-face split is for. This is the same class of defect as the Cinzel `Đ` below: the glyphs are present and drawn wrong, and only looking at the rendered page finds it.

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

**On desktop only the display sizes step up**, and only these: the landing `<h1>`'s lead clause 26 → 34px and its keyword clause 16 → 17px, a page title 22 → 26px, the results title 20 → 24px, and the ledes 14.5/15 → 15.5px. **Body, label, address, service-list and button sizes are identical at every width** — the table above is the type scale, not a mobile variant of one. Scaling body copy with the viewport would mean two scales to keep in step and two sets of contrast and rhythm decisions, for a page whose measure is already fixed by the reading column.

**The landing `<h1>` is two clauses in two voices**, and that is a type decision as much as a copy one: the situation line is Spectral SC 600 in `--ink`, the keyword line Archivo 400 in `--ink-body`. Both sit inside the `<h1>`; the second is set to support the first rather than compete with it, which is what lets the heading carry the search terms without reading as two headings.

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

- Single column, mobile-first, **390px design width**, **22px page gutter**. The reading column caps at **560px**, and at **620px** from 1024px up.
- **A masthead across the top, the reading column beneath it, and a footer under that** — the shape every visitor already knows. `SiteHeader` and `SiteFooter` are rendered once by the root layout; the shell is a flex column in `globals.css`.

  **This replaces the sticky 220px desktop rail**, which is deleted. The rail was answering a real problem — a 560px column centred in a 1440px window does not break but reads as an unfinished phone app to every person who decides whether the product is real — and the half of its reasoning that still binds is that **a list page gains nothing from a second column of listings**: the provider list stays exactly one column at every width and there is no card grid anywhere. What the rail got wrong is that it solved the problem with a shape nobody arrives already knowing. On a page a grieving family reads once, in a hurry, familiarity is worth more than novelty, and the people judging whether this is a real product — the provider being pitched, a journalist, a partner — should not have to learn a layout first.

  The rail's own four rules survive the change, and now bind the masthead and footer instead:

  - **Nothing in the masthead is the only copy of anything.** Every link in the menu also sits in the footer, so the JavaScript-free mobile disclosure failing would cost nothing.
  - **They state what the site is, never what a page claims.** The coverage claim belongs to the page — the landing `<h1>`'s strip and the results header both carry it — and neither masthead nor footer repeats it.
  - **No primary action in either.** One heaviest thing per screen, and it is the call button.
  - **Nothing route-specific and nothing from the database** — no city, no count, no back link. That is what lets the root layout render both on every route, including the static prose pages, without a query.
- **Two widths, not one.** `--measure` / `--measure-wide` is the reading column; `--frame` (1000px) is the band the masthead, the footer and the landing page's horizontal sections share. A wide masthead over a narrow reading column is an ordinary editorial shape; a 1000px column of 13px body copy is not.

  **Above 1024px the reading column aligns to the frame's left edge rather than centring in the viewport.** Two competing left edges — a wordmark at one x and the page's own heading at another — is the specific thing that makes an otherwise plain layout look accidental.
- **The contextual back link is `PageBack`, not the masthead.** It is the one part of the old header that cannot live in a route-independent layout, because it knows where the reader came from. It stays a real `<Link>` to a known URL rather than `history.back()`, for the reason [Navigation and state rules](#navigation-and-state-rules) gives it as a numbered requirement.
- **The menu breakpoint is 860px, not 1024px.** Four short labels sit inline well below the width the rail needed, and **this closes the tablet-portrait gap** the rail could not: between 560px and 1024px the layout was previously the centred mobile column, because a 220px rail would not fit beside a 620px content column. A masthead has no such constraint, so 560–1024px now gets the real menu and the horizontal step and promise rows.
- **The mobile menu is a `<details>` disclosure**, so the header works with no JavaScript and opens nothing that is a modal. The inline desktop nav and the disclosure are separate markup rather than one panel CSS forces open — forcing a closed `<details>` open with CSS is unreliable across browsers, and navigation may not be flaky.
- **`fullWidth` buttons cap at 360px on desktop.** `fullWidth` means "fill the thing you are in", and at 620px a filled button stops reading as a button. Buttons that fill a grid column instead (a card's contact row) are unaffected, because the column is narrower than the cap.
- **Flex/grid with `gap` throughout**, never per-element margins for sibling spacing.
- Section separation 26–32px; card internal gap 9–10px.
- **No `border-radius` anywhere. No shadows. No gradients** other than the stone texture and the select caret.
- All rules are 1px. The double rules belong to the rejected Arhiv variant and are not part of Kamen.
- **Hit targets:** both contact buttons ≥ 48px tall; every other tappable element ≥ 44px.

**Exactly two button styles exist**, and no third may be added:

| style | fill | border | label | used for |
|---|---|---|---|---|
| primary | `--ink` | none | `--gold-on-ink`, Archivo 500, 14px, .05em | `Nazovite`, the landing CTA, the provider form's submit |
| secondary | transparent | 1px `--ink` | `--ink`, Archivo 500, 14px, .05em | `Pošaljite e-mail`, `Saznajte više` |

Both square, both ≥ 48px, neither with a radius or shadow. A revealed phone number rendered beneath the primary button is not a third style — it is a `--gold-link` text link at 14px with tabular figures.

**`ActionButton` renders a real `<button>` in those same two styles, and imports `ActionLink`'s stylesheet rather than restating it.** It exists for exactly one case, the provider form's submit; everything else that looks like a button in this product is an anchor, and `ActionLink`'s contract — always an anchor, never a div with a handler — is what makes the contact actions keyboard-usable, no-JavaScript-safe and meaningful to `event.isTrusted`. A second file describing a filled `--ink` button is how a third style gets born by accident, so there is not one.

**Form controls** are the one thing Kamen had nothing to say about, because until `/za-pogrebnike` there was nothing to type into. They follow the rules already set rather than inventing a look: no radius, no shadow, a 1px ink rule, a ground one step off the page, and the focus outline never removed. Two specifics worth keeping: the field text is **15px**, above the body scale, because anything under 16px makes iOS Safari zoom the viewport on focus; and the select's caret is **drawn in CSS**, because the product has no icon set to take one from.

- Wide content gets its own `overflow-x: auto` container; the page body never scrolls sideways.

### Icons

**Exactly one icon exists in the product:** the phone glyph on the call button. Inline SVG, stroke-based, 1.8px stroke on a 24px grid, `currentColor`. No icon set, no emoji, anywhere.

Two marks sit alongside it and neither is an icon, which is the distinction that keeps the rule meaningful rather than merely technically satisfied:

- **The wordmark's mark** (`Logo`) — a Diocletian arch reduced to two piers, the span and the ground line, drawn to the same construction as the phone glyph. It is a brand mark used in exactly two places, the masthead and the footer, and it is architecture rather than iconography.
- **`StoneEngraving`** — one drawing, covered by [Image policy](#image-policy) rather than by this rule. It is currently on no page: the landing band it filled was replaced by the hero photograph on 2026-09-07, and the results header and `/sto-uciniti-prvo` bands it could fill are still texture alone.

The line the rule is actually drawing is against a *set*: pictograms that stand for concepts and multiply once the first three exist. That is why the *"Kako do pogrebnika"* steps are marked with numerals rather than with three drawn glyphs — three would have been a set.

### Image policy

Images are in scope and chosen by the project owner — this is the frame they sit in, not a ban.

- **One image maximum per page**, and only where it does work: the results header band, and the top of `/sto-uciniti-prvo`. The provider detail page uses `logo_url` at small size if present, never as a hero.
- **Subject:** stone, architecture, light — Brač limestone, the Diocletian colonnade, cemetery architecture. **Never people, never hands, never candles, never lilies.** That imagery is the funeral industry's own native slop and it loses the register instantly.
- **Treatment:** bounded band with a 1px gold rule beneath. Desaturated toward the stone palette so it reads as part of the ground rather than a photograph pasted onto it. Never carrying a text overlay — **except on the landing hero, which is now exactly that; see the exception below.**
- **Aspect** ~2.6:1 (390×150 at design width). Served as WebP/AVIF at 2×, with explicit `width`/`height` to prevent layout shift.
- Illustration is allowed on identical terms — engraving-style line art, ink on stone.
- **Every page must render correctly with no image at all.** The stone texture exists for exactly this state, and the POC ships whether or not any image has been chosen.

#### The landing hero is an exception, taken deliberately (2026-09-07)

The project owner supplied a photograph and asked for it **behind the heading, the second clause and the primary action** — which contradicts the treatment rule above in the one way that matters, and it is granted for this one section rather than folded into the general rule. The engraving band that used to sit under the hero text is gone with it; `StoneEngraving` remains in `components/` for the two bands that are still texture alone.

Four constraints came with it, and they are what make it an exception rather than an abandonment:

- **A radial scrim, not a panel.** `--stone` washed in behind the type and fading to nothing well inside the band. A hard-edged card was built first and rejected: it read as a different design system pasted onto the photograph. The falloff uses a long ladder of stops rather than three, because a gradient with a flat centre and an abrupt shoulder shows its own outline — the eye reads the ellipse, which was the second version rejected.
- **The photograph must read.** The scrim is sized to the text block and no more, and its radii are set per breakpoint because the type is nearly the band's full width on a phone and about half of it on a desktop. A scrim that covers most of the band defeats the point of the photograph.
- **Contrast is a floor, not a preference.** `--ink` over a thin scrim is a blend, so legibility depends on the image beneath: over the darkest pixels of the current photograph, ~0.86 opacity gives roughly 11:1 and ~0.55 roughly 6:1, while below about 0.45 it falls under the 4.5:1 AA floor. The stops hold ≥0.55 out to where the longest line ends. **A thinner scrim is a defect**, and a darker photograph needs a stronger one — this is the check to repeat if the image is ever replaced.
- **Self-hosted, pre-encoded, no `next/image`.** AVIF → WebP → JPEG at two widths, generated once with `sharp` and committed under `web/public/img/`. Routing the file through an image CDN at runtime would put a third party back in the request path, which [SPEC.md](SPEC.md) → Boundaries forbids. The source was 1280px wide, so that is the largest derivative — below 2× for a 1000px band, and the reason a larger original would sharpen the desktop rendering.

**Not amended by this:** the subject rules (never people, hands, candles, lilies), one image per page, and rendering correctly with no image at all.

**The landing band is filled, by illustration rather than by photograph.** `StoneEngraving` draws a colonnade as engraved line art on the stone texture, bounded, with the gold rule beneath — which is the finished state of that band, not a placeholder holding a photograph's place. It is also the honest option: the subject rules above rule out everything stock photography offers this category, and a drawing we control cannot drift into people, hands, candles or lilies.

One implementation rule, learned by shipping it wrong: **the SVG's viewBox is the band's exact desktop size**, so `preserveAspectRatio="slice"` crops horizontally and only horizontally. Sized any other way it crops vertically instead and takes the tops off the arches, which turns a colonnade into a fence.

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
3. **`phone_click`** on the shortlist `Nazovite` button, on the number it reveals, on the detail-page button, and on every number in the detail-page list. Gated on `event.isTrusted`. The others block has no phone action, so nothing there can fire. **The log call must never gate the reveal** — reveal synchronously, log fire-and-forget, in that order.
4. **`email_click`** on the shortlist `Pošaljite e-mail` button and on the detail page's email link. This is a change from the original design, where `email_click` was a detail-page-only event; the list-page email CTA makes it a primary-surface signal, and for the `planiranje` path probably the dominant one.
5. **`website_click`** on the detail page's website link, and nowhere else. The shortlist's third action goes to our own detail page rather than to the provider's site, so there is no outbound website click to log from the results page.
6. **Fire and forget** — `supabase.rpc('log_event', …)` unawaited, errors swallowed. A failed log must never delay a `tel:` handoff or a `mailto:` handoff. The contact is the point; the metric is not.
7. **One log per mount**, guarded against StrictMode's double-invoked effects.

**Not logged in Phase 1: the flow's answers.** Knowing which services families actually ask for would be genuinely valuable, but it needs a new `event_type` or a new column — ask-first ([SPEC.md](SPEC.md) → Ask first) — and a combination of `situacija` + `nacin` + `pokojnik` starts to look like a fingerprint, which is the boundary that keeps `events` outside GDPR scope. Out.

**One consequence worth recording:** the shortlist means ranking position now affects clicks. That makes the deferred per-card impression event ([SPEC.md](SPEC.md) → Future considerations) more meaningful than its note implies — without it, a provider's click count cannot be separated from where the ranking put them. Still deferred; adding an enum value later stays a one-liner.

## Search

Search is this product's entire distribution channel, so this section is load-bearing rather than housekeeping. Everything below was implemented on 2026-09-04 and verified against a production build, not inferred from a passing compile.

### Headings carry the city

**The `<h1>` on both listing types is two lines inside one element**, the shape the landing page already used:

```html
<h1><span class="titleName">Organizacija pogreba</span>
    <span class="city">Rijeka i okolica</span></h1>
```

Before this, the city sat in a sibling `<p>`, so the strongest on-page signal on `/pogrebne-usluge/zagreb` read only *"Pogrebnici"* — identical across all seven city pages, on the very page that has to rank for *"pogrebne usluge zagreb"*.

**The change is visually null and must stay that way.** `.title` became a flex column reproducing the gap `.header` already applied between the two elements; the type moved to `.titleName`. **The desktop step-up rules move with it** — a `@media` block still targeting `.title` would silently stop applying, because the heading itself no longer carries type.

### Titles do not repeat the brand phrase

The root template is `%s · Pogrebne usluge`, so a page title opening with *"Pogrebne usluge"* rendered it twice and spent SERP width saying nothing the second time. City pages are `Pogrebnici u {locative}`; the landing page uses **`title.absolute`**, because it is the one route whose own title already is the brand phrase.

### Structured data

Built in `lib/structured-data.ts`, rendered by `components/JsonLd.tsx`:

| type | where | what it is |
|---|---|---|
| `FuneralHome` | provider pages | the business — name, address, phone, email, `taxID` from `oib`, opening hours, services as offers |
| `ItemList` | city and service listings | the providers **in the order the page renders them** |
| `BreadcrumbList` | city, provider, service | the trail, with names matching the visible headings |

Two rules govern this and neither is negotiable:

- **Everything marked up is something the page already shows.** Marking up a fact the reader cannot see is the line between structured data and spam.
- **A null column is omitted, never guessed** ([SPEC.md](SPEC.md) → Never: fabricating business data). This is also why `openingHoursSpecification` omits days absent from `working_hours`: absent means *unknown*, and emitting it as closed would tell a family a provider is shut when it is not.

**Deliberately absent, each for a reason:** no `geo` (coordinates null for all 45); no `aggregateRating` or `review` (no review data exists, and it is the most abused property in local schema); no `priceRange` (almost every `price_from` is null, and a guessed price band on a funeral is the worst possible thing to be wrong about); no site-level `Organization` (it would have to name a publisher, and none exists — the same gap `/privatnost` records).

`JsonLd` escapes `<` before serialising. Provider names and addresses come from the database, and a value containing `</script>` would otherwise close the element early.

### OpenGraph, and the merge trap behind it

Link previews exist because the product already assumes the behaviour: a family member sends the link to a sibling, and those links open in WhatsApp and Viber.

⚠️ **Next merges `metadata` shallowly, and this cost real tags.** A page setting its own `openGraph` **replaces** the root layout's object outright instead of merging into it — so `og:site_name`, `og:locale`, `og:type` and the file-based `og:image` vanished from exactly the pages that bothered to write a good title, while `/kako-rangiramo`, which sets no `openGraph` at all, kept a complete set.

**Therefore: no page hand-writes an `openGraph` object.** Every one goes through `openGraph()` in `lib/seo.ts`, which restates the site-wide parts alongside the per-page ones. A page that bypasses it will look correct in review and ship a broken preview card.

The card image is `app/opengraph-image.tsx`, drawn with `next/og` rather than shipped as a binary — no third-party request, and the Kamen palette stays in one language. **Every string in it is deliberately free of Croatian diacritics**: it renders in the font bundled with `next/og`, which has not been through [the diacritic constraint](#the-diacritic-constraint), and a preview card rendering `Dakovo` for `Đakovo` would be the most visible possible instance of that failure. Vendor a TTF or OTF before putting a diacritic in it — the existing faces are `woff2`, which Satori cannot read.

### Sitemap

City entries carry `lastModified` derived from the newest `updated_at` among the providers they list — a city page *is* its provider list, so that is the honest signal. Provider entries already had it. `priority` and `changeFrequency` are present but not tuned, because Google ignores both.

### Canonicals

Every route emits an absolute canonical resolved against `metadataBase`. **The home page emitted none at all** until 2026-09-04 — the page search matters most for was the one route opted out of the mechanism that exists to stop each host vouching for its own copy.

## Deployment

Netlify, on **`pogreb.net`** (Namecheap), with the **apex as the primary domain** and `www` redirecting to it. Moved into scope on 2026-09-04 ([SPEC.md](SPEC.md) → In scope), and **live and verified the same day** — every check at the end of this section passed.

**DNS stayed at Namecheap.** Earlier revisions of this section called for moving to Netlify nameservers; that was reversed on the day, because the zone carries five `MX` records and an SPF `TXT` for the domain's e-mail forwarding, and delegating would have required recreating them by hand inside Netlify DNS with a silent bounce as the failure mode. Instead: an **ALIAS at the apex** and a **CNAME on `www`**, both to `pogreb.netlify.app`, with the mail records untouched. Records propagate in minutes where a nameserver change takes hours, and reverting is one edit.

Two failures on the way, both recorded because neither is guessable:

- **The first deploy published the repository root.** `netlify.toml` was written but never staged, so Netlify cloned a repo with no build config, found no `package.json` at the root — the app is in `web/` — detected no framework, ran no build, and served the repo as a static folder. Every route returned Netlify's own 404 while `/SPEC.md` and `/CLAUDE.md` were served as raw files.
- **The second failed on the publish directory**, which is what settled the `base`-relative question recorded in the table below.

**The certificate needed no intervention**, though it looked like it did: Netlify's automatic check ran while the apex still resolved to the old parking `A` record, saw a non-Netlify IP and declined to issue, and there is no *"Provision certificate"* button in that state. It issued on its own about six minutes after the parking record was removed and DNS verification passed. **If a certificate is ever missing, check what the apex actually resolves to before touching anything in the UI.**

### Build configuration

`netlify.toml` at the repo root, because the app is in `web/` and a setting that lives only in a dashboard is a setting nobody reviews:

| key | value | why it matters |
|---|---|---|
| `base` | `web` | the app is not at the repo root; without this the build fails on a missing `package.json` |
| `command` / `publish` | `npm run build` / `.next` | **`publish` resolves relative to `base`, not to the repo root** — settled by the first deploy, which failed on it. `web/.next` here became `/opt/build/repo/web/web/.next` and `@netlify/plugin-nextjs` failed in `onBuild` on a directory that does not exist. Netlify's UI implies the repo-root reading, and earlier revisions of this table asserted it; `base` is the only repo-root-relative key in the file |
| `NODE_VERSION` | `22` | Next 16 needs 20.9+. Pinned so a change to Netlify's default image cannot move the runtime silently |

**A data change alone does not change the built pages, and this was caught the hard way on 2026-09-07.** After the Split okolica rows were pushed, a local `npm run build` still rendered Zec's old address and no new providers — and it looked exactly like a failed migration. It was not: `supabase-js` reads through `fetch`, Next caches `fetch` results in `.next/cache`, and the service listing pages are SSG, so a build with a warm cache bakes whatever the previous build fetched. `rm -rf .next` and rebuilding produced the new data immediately.

Two consequences, both binding:

- **After any migration that changes provider data, verify against a cleared cache** (`rm -rf .next`) before trusting a local build — a stale page is indistinguishable from a migration that silently did nothing.
- **A deploy must not be assumed to pick up a data change**, because `@netlify/plugin-nextjs` restores `.next/cache` between builds. Trigger a deploy with the cache cleared, or confirm the new data on the live page rather than on the build log. The results page and provider detail are `force-dynamic` and always current; **it is the `/usluga/{slug}` listings that can go stale**, which is exactly where a newly added provider needs to appear.
| `NEXT_TELEMETRY_DISABLED` | `1` | **a GDPR guarantee, not a preference.** See [SPEC.md](SPEC.md) → Project Structure: it was true only because of a machine-local Next config no build container has |
| `@netlify/plugin-nextjs` | declared | Netlify installs it on detecting Next, but the app has server-rendered routes and cannot be served as a static export, so it is load-bearing rather than incidental |

### Environment variables

All three are `NEXT_PUBLIC_*`, so they are **inlined at build time** — changing one needs a redeploy, not a restart.

| variable | consequence if missing |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **build fails.** `lib/env.ts` throws at module load |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build fails, same path |
| `NEXT_PUBLIC_SITE_HOST` | build *succeeds*, and the site is quietly wrong: `robots.txt`, `sitemap.xml` and every canonical fall back to `http://localhost:3000`, and **no event is ever logged** |

`NEXT_PUBLIC_SITE_HOST` is the apex, `pogreb.net`, and that choice is load-bearing twice over:

- **`shouldLog()` matches the host exactly or as a subdomain of it.** With the apex, both `pogreb.net` and `www.pogreb.net` log. With `www` as the value, apex hits log nothing, because the apex is not a subdomain of `www`.
- **`SITE_ORIGIN` in `lib/env.ts` derives from it**, and is the single source for the `robots.txt` sitemap line, every sitemap entry, and `metadataBase` in the root layout. Before `metadataBase` existed, each page's relative `alternates.canonical` was emitted as written, which let every host serving the app declare itself canonical.

Setting the variable for all deploy contexts is safe: deploy previews run on `*.netlify.app`, which fails the host check, so previews log nothing.

### Netlify Forms

**Form detection is opt-in per site** and must be enabled before a build that relies on it — a build that ran before the toggle does not register the form, and submissions then POST to a 404 with nothing surfaced anywhere. That is the same silent-drop failure `public/__forms.html` exists to avoid.

### Verification, in order

**All six passed on 2026-09-04.** Kept as the checklist any future deploy to a new host or domain has to clear again.

1. ✅ `robots.txt` — the `Sitemap:` line reads `https://pogreb.net/sitemap.xml`, not `localhost`.
2. ✅ `sitemap.xml` — absolute URLs on the apex; contains `/za-pogrebnike`; does **not** contain `/privatnost`. 79 entries, zero `localhost`.
3. ✅ `/privatnost` — carries `<meta name="robots" content="noindex, follow">`.
4. ✅ **An end-to-end form submission.** Land on `/za-pogrebnike/hvala`, then confirm the submission appears in Netlify → Forms → `pogrebnici` **with every field populated**. An empty field means `public/__forms.html` and the React form have drifted. *This is what caught the redirect defect — the submission recorded correctly but landed on Netlify's generic page; see [How the form actually works](#how-the-form-actually-works).*
5. ✅ **Event logging** — click a provider's phone number from the real domain and confirm a row in `events`. First time `shouldLog()` ever returned `true`.
6. ✅ The whole flow on a phone: landing → two questions → results → provider page.

**Form detection must be enabled on the Netlify site before the build that relies on it**, and it was — see [Netlify Forms](#netlify-forms) above.

Netlify redirects the `*.netlify.app` deploy domain to the primary custom domain once it is set, which is what keeps a duplicate indexable copy of the site out of search.

## Known gaps, deliberately deferred

Not out of scope — accepted as incomplete, and tracked here so they are not rediscovered as surprises.

| gap | state |
|---|---|
| **Named owner, and a contact route for the public** | **Half closed.** Providers now have [`/za-pogrebnike`](#the-provider-page), and both *"javite nam"* sentences link to it. What remains: no page names a human, and a member of the public who is not a funeral director still has no way to reach us. Both are E-E-A-T essentials and neither can be invented. Waiting on an `/o-nama` decision. |
| ~~**`/privatnost` does not exist**~~ | **Closed 2026-09-04**, and `PROVIDER_FORM_PUBLIC` flipped with it. The notice is scoped to the provider form: it opens by saying it does not concern a searching family, names all eight fields and whether each is published, names Netlify as processor including the US transfer, states twelve months' retention, lists the six rights and names AZOP. |
| **`/privatnost` names no controller** | The identity half of GDPR art. 13(1)(a). The page gives a contact address and states that no legal person stands behind the site; it does not name a person. The project owner was shown this before the flag was flipped and accepted it. Closes with a name — one line in that page's `Tko obrađuje podatke` section. Part of the same `/o-nama` decision as the row above. |
| **Provider form is unverified** | The submission path has never executed anywhere — Netlify Forms needs a deploy. **The flag was flipped before this was verified**, so the live form is linked and indexable while its submission path is untested; the first deploy must include an end-to-end test submission. See [Deployment](#deployment). |
| **`lib/__fixtures__/split-pilot.ts` is Split-only — and no longer describes Split** | The 51 ranking and hours tests still pass and still test the right things — they exercise pure functions over a fixture, and the fixture being one city does not weaken that. But it is a snapshot of the seven-provider pilot, and **Split now holds 13 providers** across five towns, including one municipal operator and one provider carrying 13 services. `serviceFrequency` also reasons over a changed distribution: `balzamiranje` went from one provider nationally to two and `ekshumacija` from four to five on 2026-09-07. Still no test covers a city the size of Zagreb. |
| ~~**Tablet portrait**~~ | **Closed** by the masthead. 560–1024px now gets the real menu and the horizontal rows; the constraint was the rail's width, and the rail is gone. |
| ~~**Landing page imagery**~~ | **Closed 2026-09-07** by a photograph behind the hero text, with a radial `--stone` scrim carrying legibility. The owner supplied the image and took the decision that the [Image policy](#image-policy) had to bend for it; that section records the exception and the four constraints attached to it. `StoneEngraving` is no longer on the page. |
| **`planiranje` path** | Hidden from screen 1 and still fully wired. See [Screen 1](#screen-1--situacija). |
| **Croatian phrasing review** | See [Open questions](#open-questions). **Raised to the owner's top priority on 2026-09-07**, and widened there from the guidance text to every Croatian string that ships — flow labels, results copy, `web/lib/copy.ts`, titles and card text included. One full pass was made by the owner that day; `/za-pogrebnike`, the provider detail page and most of `/privatnost` are still unreviewed. |
| **A listing entered directly still shows a ranking** | Arriving at `/pogrebne-usluge/{grad}` with no answers renders **Najbolje odgovara** with reason lines anyway, because `rankProviders` partitions regardless of input. With `answers = {}` the criteria-match and urgency terms are both no-ops, so the order reduces to **completeness, then alphabet** — which promotes the one term [Ranking rules](#ranking-rules) admits is unfair to providers to the primary sort key, on the page every crawler and shared link lands on. Dubrovnik shows it plainest: two providers, cap of four, so the shortlist *is* the whole list. Not a defect in the ranking function, which does what it is specified to do; a missing case above it. **The owner has asked for an unsorted list there instead** — and for the list to come back in whatever order the query returns, since with no answers there is nothing to rank on. Not built. |
| ~~**Split's data is the oldest in the set**~~ | **Closed 2026-09-07.** Seven providers against an eight-settlement catchment, gathered before the six-city expansion settled how a provenance trail is kept — reviewed and expanded to 13 providers across Split, Trogir, Kaštela, Solin and Omiš, with five corrections to the original rows. Research in `data/SPLIT_OKOLICA_REVIEW.md`; migrations in [SPEC_database.md](SPEC_database.md) → Migrations. |

## Out of scope for the POC

| not built | why |
|---|---|
| Map view | coordinates null for all 7; a mapping API is a new external integration (ask-first) and adds no decision value at 7 providers |
| Reviews / ratings | no review data exists, and inventing it is a Never |
| Price calculator, cost tables | zero `price_from` rows; this is the entire model of the German portals and we cannot honestly run it |
| Geolocation, distance sort, "blizu mene" | no coordinates, and no user location is collected |
| Side-by-side comparison table | seven cards on one screen already is the comparison |
| Lead form, email capture, callback request — **anything asking a family for their details** | out by [SPEC.md](SPEC.md) scope; also the thing that would force a consent banner. The provider form on [`/za-pogrebnike`](#the-provider-page) is not this and must never become it: it points the other way, from the listed business to us |
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
| Header-band imagery | nothing — pages render without it | **landing band filled** by engraved line art; the results header and `/sto-uciniti-prvo` bands are still texture alone |

The schema is complete as of 2026-09-02 — nothing in the database blocks a build. What remains gating or degrading it is data and assets, not DDL. **No migration is outstanding for the deploy**: the production hostname went in on 2026-09-02 as `20260902143000_log_event_production_host.sql`, which matches `pogreb.net` as `(^|\.)pogreb\.net$` and so already covers the apex, `www` and any future subdomain. Earlier revisions of this section called that migration future work; it is not.

## Open questions

- **Where copy lives, and how it is reviewed — settled 2026-09-07.** The project owner asked whether copy belongs in TSX at all, having found it hard to proofread and hard to keep in step with the specs. The answer taken: **it stays where it is used.** A single-locale product gains nothing from an i18n layer or a central dictionary — translation is never coming, and `{t.promise.title}` in place of the sentence makes the markup harder to read, not easier.

  A generated review document (an AST-based extractor writing every user-visible string to one file, edited by the owner and applied back) was built and used for one full pass that day, then **deleted at the owner's direction as more machinery than the job needs**. Copy is reviewed by reading the page files. The pass itself landed: the landing steps and promises, the promise page (now titled *Naš credo*), `/sto-uciniti-prvo`, `/privatnost` and the guidance strings were all rewritten by the owner.

  **The other half of that decision is a policy, and it is binding: the specs do not hold customer-facing text.** The code is the source of truth for copy; this document records decisions about copy and quotes at most a short phrase where the decision cannot be read without it. The 2026-09-07 cleanup stripped the paragraphs of shipped Croatian that had accumulated here — each one was a second version that went stale the moment its page changed.

- **Croatian phrasing review of the guidance text.** The procedural content for the *"Gdje je pokojnik sada?"* strip and for `/sto-uciniti-prvo` is written and every claim is sourced (see [screen 3b](#question-3b--conditional-on-sourcing)). What remains is not sourcing but language: a native speaker should read it, and the project owner should sign it off, before launch. Facts checked; phrasing unreviewed. **`/privatnost` now belongs to this list and is the most urgent entry on it**, because it is the only page making legal statements — its Croatian was written unreviewed, same as the rest. **The project owner made this the top-priority item on 2026-09-07 and widened it** from the guidance text to every Croatian string the product ships, including the flow labels, the composed reason line, `CATCHMENT`'s locative forms, and the titles and card text a search user reads first. **Two things the review must not reopen:** `/privatnost` names no controller (a decision the owner took after being shown the gap), and `ukop`, *"Osoba je u posljednjim danima"* and the settlement list were confirmed as they stand.
- **Whether any provider carries a price — answered for Split, still open elsewhere.** The 2026-09-07 okolica review read every provider's own material across Split, Trogir, Kaštela, Solin and Omiš: **not one publishes a figure.** The only prices found anywhere were Hrvojka's casket range, quoted **in kuna** on a page not updated since the euro changeover, which is not loaded — the same call the pilot made about Lovrinac's single HRK figure. So `price_from` is still null throughout Split, the promise wording holds, and what remains unchecked is the other six cities. The paragraph below is the original question, kept for its reasoning:
- **Whether any provider carries a price.** `/nase-obecanje` used to state that *no* provider in the covered area publishes a price list, and the provider page's code comment said the price element "renders for nobody". Both were written for the seven-provider Split pilot. `entity_services.price_from` exists and the provider page renders it where non-null, and nobody has checked the 45-provider dataset since. The promise wording has been rewritten to hold either way; a single read-only query settles it properly.
- **No-JavaScript path on the list page.** The reveal-on-click behaviour means that with scripting unavailable, the list page's `Nazovite` still dials on mobile (it is a real `tel:` link) but reveals nothing on desktop. The detail page is the fallback, since it lists every number as plain markup. Acceptable, but worth a decision if analytics ever show meaningful no-JS traffic.

### Resolved

- ~~**`available_24_7` contradicts `phones` for two providers**~~ — resolved by the project owner at the data level. The phone-selection rule can rely on `available_24_7` and `phones[].type` agreeing.

- ~~**Croatian copy review**~~ — confirmed by the project owner: `ukop`, *"Osoba je u posljednjim danima"*, and the settlement list all stand.
- ~~**Whether screen 3b ships**~~ — it shipped, and was then **pulled on 2026-09-04** to cut screen 3 to one question and one tap. Its code is intact and restoring it is markup only; see [screen 3b](#question-3b--gdje-je-pokojnik-sada--pulled-2026-09-04).
- ~~**Entity/service URL namespace collision**~~ — resolved above as `/usluga/{slug}`, closing the open question carried in [SPEC_database.md](SPEC_database.md).
