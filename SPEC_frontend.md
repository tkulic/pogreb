# SPEC: Frontend

> Spec module — the Phase 1 public frontend. See [SPEC.md](SPEC.md) for project context and scope, and [SPEC_database.md](SPEC_database.md) for the schema this reads from.
>
> Status: **built and running locally.** The landing page, the three-screen flow, the results page, provider detail, the indexable service listings, the prose pages and the provider page all exist in `web/`, with ranking and opening hours under unit test.
>
> The layout is **masthead, reading column, footer** at every width — see [Layout and shape](#layout-and-shape). This replaced the sticky desktop rail, which is deleted, and closed the tablet-portrait gap with it. The landing page was rebuilt around the familiar shape (hero, how it works, why us, close) and its `<h1>` now names the reader's situation before the coverage claim — a deliberate reversal, reasoned through under [Landing page](#landing-page). The landing image band is filled by engraved line art rather than waiting on a photograph.
>
> **The product covers nine cities and 55 providers** — Zagreb 17, Split 13, Rijeka 5, Velika Gorica 5, Slavonski Brod 4, Zadar 4, Osijek 3, Pula 2, Dubrovnik 2, read off the live data on 2026-09-16. The 2026-09-03 expansion and the 2026-09-07 Split okolica fill-in are recorded in [SPEC_database.md](SPEC_database.md); the two cities added since are not. **Passages below that reason about "all 7" are pilot-era and describe Split as it was**; they are kept where the reasoning still holds and are wrong about the count. That turned screen 2 into a real question, replaced the landing page's single-city coverage strip with a city list, and made `cities[0]` a bug rather than a shorthand.
>
> **The cost page shipped 2026-09-15** — [`/koliko-kosta-pogreb`](#the-cost-page--koliko-kosta-pogreb), the first page to state prices, carrying a four-question estimator built on published municipal tariffs rather than on any provider's prices. It closed item 3 of the [article pipeline](#planned-content--the-article-pipeline) and retired two promises the site could no longer make. Six more articles are researched and waiting there.
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
> I don't want to search, compare, or work through a questionnaire. I want to be asked as little as possible and then be shown, in plain language, **everyone I could call and what distinguishes them** — with the phone number right there, working at 3am.
>
> *(Amended 2026-09-24. This read "be told who I should call first and why" until ranking was removed — see [Order and filtering](#order-and-filtering). The product no longer makes that claim, and a user story that still asked for it would be the loudest surviving argument for putting it back.)*
>
> I need to trust that the list isn't sold. If I'm unsure about anything I'm asked, I need to be able to say "I don't know" and still get an answer. And if I don't want to be led at all, I need one tap to just see everyone.

### What the flow is actually for

With 7 providers in the Split pilot, a filter cannot do much work. Four of the sixteen services — `organizacija-pogreba`, `cvjetni-aranzmani`, `prijevoz-pokojnika`, `prijevoz-pokojnika-inozemstvo` — are offered by all 7 and therefore discriminate nothing. The only service that genuinely splits the pilot list is `kremiranje` (4 of 7).

So the flow's value was framed as **orientation rather than filtering**: turning "I have no idea where to start" into "here are these few, and here is why these few".

**That framing was overtaken by the data on 2026-09-24, and the flow survives on narrower grounds.** 16 of 19 search clicks land straight on a city page, so the flow is a front door almost nobody uses, and "here are these few" was a promise ranking made and could not keep ([Order and filtering](#order-and-filtering)). What is left is real but smaller: `kremiranje` genuinely narrows a list — 17 → 5 in Zagreb, 13 → 5 in Split — and `situacija` chooses the guidance. **Both now also exist on the city page itself**, where the traffic actually lands.

The flow is kept for the minority who arrive at `/`, and is unchanged: it writes the same `?nacin=` the inline filter writes, so the two cannot disagree. **Screen 3 is now redundant with the inline filter** and is the piece to revisit once there is an instrument that can see whether either is used.

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

   The single-city coverage strip is gone. In its place is **a list of every covered city, each linking to its own page and carrying its provider count**. Nothing sits under it.

   **The per-city count came off this page on 2026-09-07 and went back on 2026-09-14** — both decisions the project owner's. It read *"20 pogrebnika"*, *"2 pogrebnika"* beside each city; the removal argued that the column ranked the cities by size, and that a family in Dubrovnik needs to know their town is covered rather than that it is the smallest number on the page. It was replaced by *"svi registrirani"* for a week.

   **The reversal stands on the reader.** The number is what someone actually wants from a coverage list — *how much is there where I am* — and suppressing it to spare the smaller cities a comparison is a judgment made on the reader's behalf that they never asked for. The count is rendered by `providerCountLabel`.

   This does **not** reopen counts in prose — see the rule below, where "in prose" is now the load-bearing half.

   **The note under the list went in the same decision.** It read *"Svi registrirani pogrebnici u sedam gradova, njih više od 50 — nitko nije izostavljen i nitko nam ne plaća za bolju poziciju. Svaki grad uključuje i okolicu; popis naselja piše uz rezultate."* The count clause was made redundant by the per-city counts above it — a floor of *"više od 50"* under seven rows that visibly total 51 reads as withholding something already on screen — and the owner took the whole paragraph rather than the clause.

   `nationalCoverageClaim` and `providerFloor` had no other call site and were **deleted** from `web/lib/copy.ts`, with `cityCount`, `numberWord` and `NUMBER_WORD` behind them. The same disposal the five counting helpers got on 2026-09-07. Two claims went with the paragraph and neither is lost:

   - **Neutrality** (*"nitko nam ne plaća za bolju poziciju"*) still runs in the city page footer, where it qualifies an ordering that actually exists, and in full on `/nase-obecanje`.
   - **Okolica** is still carried by the link labels themselves — each reads *"Zagreb i okolica"* from `CATCHMENT` — with the settlement list proper on the city page, where it can be checked.

   So the landing page now shows the reader the numbers and lets the city page make the claim about them.

   **The `<h1>` no longer names a city**, and that is right for search rather than a concession: this page should rank for *pogrebne usluge*, and `/pogrebne-usluge/{grad}` — which has its own `<h1>`, its own metadata and its own `coverageClaim` — should rank for *pogrebne usluge split*. One page trying to be both would be weaker at each.

   The city list also **is the bypass**. It is set as text links rather than buttons so it cannot compete with the one primary action, and it replaces a single-city "show me everything" link, which had no meaning once there were seven cities to be "all" of.

   Three guardrails come with it, all binding:

   - **The wording is `coverageClaim` in `web/lib/copy.ts`, and it says "registrirani".** The qualifier is what we can stand behind — a provider operating with no registry entry we could find is exactly the case it is honest about. The claim is also about **the pilot area, not any provider's service radius**; both limits are `CATCHMENT`'s and they still apply.
   - **No exact provider count appears in customer-facing *prose* anywhere** (project owner, 2026-09-07; scope clarified 2026-09-14). The emphasis is the rule: a count inside a sentence is out, a bare figure in a column or a heading is not. Two positions are therefore outside it and always were — `· N` on a results section heading, which counts the cards below it rather than the market, and the landing page's per-city count via `providerCountLabel`. Two arguments for the rule itself, and only the first is about maintenance: a sentence built from two live counts — *"of the N providers listed, M offer…"* — has to be re-read every time the data moves; and the proportion was the fact the reader wanted, while the count made them do arithmetic first. `providerShare` in `web/lib/copy.ts` replaces them with a **worded share** read from the same live rows — *"većina pogrebnika"*, *"gotovo svaki pogrebnik"*, *"manji dio pogrebnika"* — so the wording still changes when the data does. It rewrote the service-page lede (was *"šest od sedam"*) and both count-built sections of `/sto-uciniti-prvo`. Every phrase it returns takes a **singular** verb by construction, which sidesteps the numeral-agreement trap `verbForm` exists for; `countOfTotal` is deprecated for prose and kept only for its numeral rules.
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
3a. **Every page carries the site header** — a wordmark that always returns to the landing page — **and a way back that is a real `<Link>` to a known URL**, never `history.back()`: history can hold anything, including another site, and a back control that sometimes leaves the product is worse than none. It keeps working with no JavaScript, like the rest of the flow.

   **What that way back is differs by page (2026-09-24).** The flow screens and `/lista-pogrebnih-usluga` keep `PageBack` — a contextual back link, with the `n / 3` step counter inside the flow. **The city pages use `BackHome` instead** — *← Natrag na naslovnicu*, one 11px line inside the header block. Two reasons: `PageBack` is a 44px tap target that, as a direct child of the page shell, also took its 26px gap — 74px before the `<h1>` on the page that most needed the height — and `← Pitanja` had stopped being the useful destination, since 16 of 19 search clicks arrive here having never seen the flow. See [Structured data](#structured-data).

   **The flow's return did not go with it.** `← Pitanja` duplicated the *"promijenite"* link in the answers strip, which is the one that carries the answers and renders exactly when there are answers to carry. A reader who answered only screen 3 arrives with a filter rather than an answer, and the filter panel is on the page — there is nothing to return to.
4. **Every question carries an explicit escape** — *"Još ne znam"*, *"Ne znam"*, *"Nije važno"*. Taken directly from bestatter-preisvergleich, which offers "Weiß noch nicht" on every question, and it is the most humane thing on that site.
5. **No validation errors are possible.** Nothing is required, nothing is typed, so nothing can be wrong. The flow must never block on input.
6. **Results are reachable in at most three taps**, and in one tap via the screen 1 bypass.
7. **No modals, no carousels, no animation on the path to results.**

## Results page

The destination of the flow, and the page the whole product exists to render.

### Block structure, top to bottom

1. **Site header** — the wordmark (`pogreb.net`), shared with every other page. The contextual back link is gone from this page; *← Natrag na naslovnicu* below replaces it (rule 3a).
2. **Header** — *← Natrag na naslovnicu*, then `Pogrebnici · N` over the area label inside one `<h1>`, with the funnel to its right. Closing gold rule.

   **The count sits beside the word it counts**, and reads `· 5 od 13` while a filter is on. It is a bare figure next to a heading, which is the position the no-counts-in-prose rule explicitly does not cover — it counts the rows below it rather than the market. `providerCountLabel` is deliberately **not** used here: *"Pogrebnici · 13 pogrebnika"* says the noun twice.
3. **Filter panel** — only when the funnel is present and open.
4. **`SVI POGREBNICI`** — every provider in the city, alphabetical, one row each.
5. **The sheet** — *Ponesite popis usluga pogrebniku*, held by a gold hairline.
6. **Guidance strip** — conditional on `situacija`; links to `/sto-uciniti-prvo`. **The *"odabrali ste … promijenite"* strip that used to sit above the list is gone** (owner, 2026-09-24): `situacija` is the only answer that still reaches this page, it changes nothing about the list, and reading it back cost a line on the page with the tightest height budget in the product. Omitted entirely when no answer has guidance attached, rather than rendering an empty bordered strip.
7. **Transparency footer** — the coverage summary and the settlement list as one sentence (*"Prikazujemo registrirane pogrebnike u Splitu i okolici: Podstrana, Solin, …"*), then *"Ne rangiramo pogrebnike. Popis je abecedni, nitko nam ne plaća za poziciju i nitko nije izostavljen."*, then a link to `/nase-obecanje`.

**What moved on 2026-09-24, and why:**

- **The two blocks became one list of rows.** `NAJBOLJE ODGOVARA` and `OSTALI POGREBNICI` existed to separate a ranked shortlist from everyone else; with nothing ranked there is nothing to separate. See [Row anatomy](#row-anatomy).
- **The coverage sentence is gone** (owner). *"Svi registrirani pogrebnici u Zagrebu i okolici — pogrebna poduzeća i obrti"* repeated the locative the `<h1>` had just given. The footer still carries the claim that qualifies the list, which is where a qualification belongs.
- **The coverage claim and the settlement list became one footer sentence** (owner). They had been two separate things in two places — a claim under the heading and a bare list at the foot — and neither said what the other was for. Together they read as what they are: what this page shows, and where. The footer rather than the header because they qualify the list, and the heading and the rows come first.
- **The sheet moved below the list** (owner). It sat under the shortlist at what this spec called *"the natural pause"*; one list has no such seam, and after the rows is where the reader has finished scanning and has not yet called anyone.
- **`← Pitanja` became `← Natrag na naslovnicu`.** See rule 3a and [Structured data](#structured-data).

### Guarantees

These are the page's contract with the reader, and they are why the transparency footer is honest:

- **Every provider in the city appears, always.** No pagination, no "show more", no truncation. Filters narrow what is *shown*, on the reader's own instruction and reversibly — they never decide for them.
- **The order makes no claim.** Alphabetical, Croatian collation, and the only order we ever choose ourselves.
- **The page is never empty**, including when a filter arriving by URL matches nobody.
- **The count is stated**, so the reader can see that what is on screen is the whole of what the header claims.
- **What a crawler is served is the complete unfiltered list**, in the same order and with the same `ItemList`. Structurally true rather than maintained: filters run in the browser, after the markup is served.

### The filter panel

Three checkboxes and one more that sorts, behind a funnel in the header.

**It appears only where a city has more than six providers** — `FILTERS_MIN_PROVIDERS` in `web/lib/listing.ts`. Six is what fits on a medium phone screen at the current row height, and that is the whole argument: **filters exist because the list is too long to scan, and a list you can see all of is not too long.** Today that means Zagreb (17) and Split (13) and nowhere else.

**The same rule closes the empty-result hole, which is why it is binding rather than cosmetic.** Measured against live data on 2026-09-24: **28 of the 63 city × filter-combination pairs return nothing**, and every one of them is in a city at or below the threshold. Zadar has no cremation provider at all, so one tap on the most-wanted filter would have emptied a page that had just shown four providers; Pula and Dubrovnik return nothing for all three filters and all four combinations, so the panel would have been dead furniture. Zagreb and Split return nothing for none of the eight. **The cheap rule and the safe rule are the same rule** — the per-city alternative (hide each filter where its own count is zero) needed three conditional counts plus a disabled state and still would not have covered a filter arriving by URL.

**Below the threshold a city ignores `?filtri=` entirely**, rather than applying it and rendering nothing. That is what makes a shared link safe, and it is honest precisely where it applies: at six providers or fewer the whole list is on one screen with nothing hidden.

#### The three filters, and why these three

| filter | service slug | Zagreb | Split |
|---|---|---|---|
| Kremiranje | `kremiranje` | 5 | 5 |
| Pokojnik je u inozemstvu | `prijevoz-pokojnika-inozemstvo` | 7 | 9 |
| Pomoć oko dokumentacije | `sredivanje-dokumentacije` | 3 | 7 |

**Measured, not chosen.** Across all nine cities these are the only services that both split a list and name a real fork in a family's situation. Several others split just as evenly — `osmrtnice` and `cvjetni-aranzmani` sit at the top of that table — and nobody picks a funeral director because they print death notices. It is the same distinction `REASON_ELIGIBLE_SERVICES` used to encode: **splitting a list is not the same as being a reason to choose.**

Labels name the family's situation, never our taxonomy: *Pokojnik je u inozemstvu*, not *Prijevoz pokojnika u inozemstvo*.

#### Checkboxes, not chips

Real `<input type="checkbox">` with a `<label>`, one per line, no border and no padding chrome. They are independent options combined with AND, which is exactly what a checkbox group is — a row of toggle buttons was pretending to be one. Three consequences, all improvements: the full wording fits because each option owns a line, the counts align into a column readable as a set, and four options stop looking like a control panel.

**Rows are 36px, under the 44px minimum, deliberately.** They tile with no dead space and span the full column, so each target is roughly 346 × 36 ≈ 12,500px² against the ~1,900px² a 44 × 44 square guarantees. It is a larger target, not a smaller one — recorded here as a stated exception rather than left to look like drift.

#### The counts are conditional

Each number is what that filter **would** leave given what is already ticked, never the city's total for it.

Not academic: Zagreb's three stand at 5, 7 and 3 individually and at **one** together. Unconditional counts would show three reassuring numbers on the way to a list of one — and, after one curation pass, to a list of none, with no number anywhere having warned. Counting against the current selection means every state a reader can reach was reached through a number they saw first, which is what makes the interactive path to an empty result impossible.

#### The fourth checkbox sorts

*Prvo prikaži dostupne 0–24*, below a hairline. Off by default; alphabetical is the default and the only order we ever choose ourselves.

**A sort the reader picks is not a ranking**, and that distinction is what keeps the provider conversation clean: the answer to *"why is that business above mine"* becomes *"because the family asked for 0–24, and you have not told us you are"* — checkable, and fixable by the provider. It is worded *"show first"* rather than naming the condition, because sitting under three filters `Dostupni 0–24` would read as a fourth filter.

### The reason line — removed

The gold clause under a provider's name went on 2026-09-24, with the card it lived on.

**It had stopped working where it was needed most.** Composed from stored facts, it required either a džurni line without a round-the-clock claim, or a service offered by at most two providers in the city. In a large list neither fires: Zagreb carried a reason line on **2 of 17** rows, Split on 4 of 13 — while Pula and Dubrovnik carried one on both of theirs. So the annotation meant to distinguish providers worked in inverse proportion to how many there were to distinguish. A decoration appearing on an eighth of the rows is not structure, and the row had no line to spare for it.

Removed with it: `reasonLine` and its two clause functions, `serviceFrequency`, and the `SERVICE_SHORT_PHRASE` and `REASON_ELIGIBLE_SERVICES` tables in `web/lib/services.ts` that existed only to feed it. `CANONICAL_SERVICE_ORDER` stays — it orders the services inside a row's disclosure and drives `/lista-pogrebnih-usluga`.

**The editorial judgement it encoded survives in the filters.** *"Rare is not the same as decision-driving"* became *"splitting a list is not the same as being a reason to choose"*, which is why the three filters are cremation, repatriation and paperwork rather than the three services that happen to split most evenly.

### Row anatomy

**One row type, three lines.** It was `ProviderCard` until 2026-09-24 and the rename is the change: the card ran to ~256px, so a phone showed **three** of Zagreb's seventeen providers and the list read as a wall. The row is ~86px and shows six or seven.

1. **Name** — `entities.name`, Spectral SC, the link to the detail page. Truncates with an ellipsis rather than wrapping: 11 of 55 names exceed 24 characters, and the address below disambiguates.
2. **Availability mark** — `0–24`, filled gold, only when `available_24_7`. The detail page renders the same component with `long`, giving `Dostupni 0–24`, because it has the width.
3. **Address** — `entities.address`, **without the city appended**. The `<h1>` already names it, so `", Zagreb"` was eight characters on every row saying nothing; the settlement stays where one is stored (*"Gaj 37, Lučko"*), which is the part that informs.
4. **Third line** — the services disclosure on the left, the actions on the right.

#### The three actions are icons, and the third one is ours

`Nazovite` · `Pošaljite e-mail` · **our detail page**. The provider's own website is **not** on the row; it appears on the detail page, one step further on.

That inversion is deliberate. `detail_view` is by some distance the most logged action in the product — 16 of 21 events — so people are genuinely using the site to compare, and the row should make that easy rather than push them off it. It also keeps any outbound click on a page where a `detail_view` has already been recorded.

**Icon-only, with `aria-label`, and no tooltip anywhere.** A tooltip is a hover affordance and 73% of this product's traffic is mobile, where there is no hover — so an icon-only control has to be legible on its own. A handset and an envelope are; a globe for "website" is not, which is one more reason that action moved. The third glyph is an arrow meaning "open this", the one list convention a reader does not have to learn.

**Exactly one solid dark mass per row, and it is the call.** The other two are outlined. At seventeen rows, three filled buttons would have been fifty-one dark blocks.

**The reveal is unchanged and remains desktop-shaped.** The number is still obtained only through the click that logs it, which is what keeps `phone_click` a complete count rather than a sample. On mobile the tap dials and the click is counted in one gesture; on desktop, where `tel:` usually does nothing visible, showing the number *is* the outcome.

#### Services, collapsed

A `<details>` labelled `Usluge (N)`, sharing the third line with the actions.

**Why they collapsed.** Every service used to render inline, joined by `·`, on the argument that *"at 12 rows this is three lines, and a family scanning for one specific service should not have to expand anything"*. Right for a shortlist of four cards; wrong for one list of seventeen, where three or four wrapped lines per card is the single biggest reason the list cannot be scanned.

**A `<details>`, never a dialog, and the reason is search rather than taste.** Service names are the keywords the `/usluga/{slug}` listings rank on, and `<details>` keeps every one of them in the served HTML whether open or shut. A dialog populated on click can lose them from the page entirely, on exactly the pages that most need indexing. Three lesser reasons agree: the masthead already discloses this way, it works with no JavaScript, and taking the whole screen from a bereaved reader to answer *"what do they offer"* is out of proportion.

**The count is in the summary on purpose** — nine services against two is a real difference between two businesses, readable without opening anything and without us characterising it. **Omitted entirely at zero**: 8 of 55 providers have no service rows, 5 of them in Zagreb, and `Usluge (0)` would state our research gap as a fact about them.

### Contact actions — the detail page

*(This section describes `ContactActions`, which since 2026-09-24 renders only on the provider detail page. The listing rows use `RowActions` — see [Row anatomy](#row-anatomy).)*

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

### Order and filtering

**Nothing is ranked. Removed on 2026-09-24, as a principle rather than a tuning decision.**

The list is **alphabetical**, collated with the `hr` locale so Č, Ć, Š, Ž and Đ sort in their proper places rather than falling to the end. That is the entire ordering rule, and the only order we ever choose ourselves — the reader can add *Prvo prikaži dostupne 0–24*, which is their instruction and not our verdict (see [The filter panel](#the-filter-panel)). Computed in the app rather than in SQL, as a pure function over the array the city query returns, which keeps it unit-testable and keeps the rule in one readable place.

**Why ranking went.** 16 of 19 search clicks land on a city page carrying no flow answers. With no answers the comparator's first two terms — criteria match and urgency — were both inert, so it fell through to **record completeness** and then to the alphabet. `NAJBOLJE ODGOVARA` therefore meant, for almost every visitor the product actually had, *"the four providers whose records we filled in most thoroughly, A–Z"*. In Zagreb eight of seventeen providers tied on completeness and the four-card cut fell **inside that tie**, which made the Croatian alphabet the deciding term on a heading that claimed to be a judgement.

This document had already recorded the flaw, as a caveat: *"completeness ranks providers partly by how thoroughly we researched them, not by anything they did… worth revisiting if a provider ever complains, because the complaint would be fair."* That caveat was written assuming completeness sat behind real criteria. The traffic promoted it to the primary sort, and nobody decided that.

**What replaced it.** One list, everyone visible, narrowed by a filter the reader sets. A filter states a fact about a provider; a rank states a verdict on them. The fact is checkable, correctable, and survives the conversation — which is what makes the neutrality claim structural rather than promised. There is no first place, so there is nothing to sell, and no methodology page is needed to say so.

**The four-card cap went with it.** A cap on a ranked list is a shortlist; a cap on an unranked one is arbitrary truncation, which is worse than showing everyone. What stops seventeen cards being a wall is the filter and the shorter card, not a cap.

**`/kako-rangiramo` was deleted in the same change** — its subject ceased to exist. It is 301-redirected to `/nase-obecanje` in `netlify.toml` rather than left to 404: it was indexed at position 3.50 and linked from four pages, and on a site with 88 URLs still waiting to be crawled a 404 spends crawl budget to say nothing. The promise it carried — that position cannot be bought — now lives on `/nase-obecanje` as the `Ne rangiramo` promise, which is the stronger form of the same claim.

**Deliberately not ordering terms**, each for a reason worth keeping:

- **Record completeness.** The term that caused this. Ranking by it sorts providers by how thoroughly *we* researched them, and the remedy was always to complete the data rather than to reweight it.
- **`events` click or view counts.** Ranking on them makes the metric self-fulfilling and destroys its value as evidence of anything ([SPEC_database.md](SPEC_database.md) → What the numbers are worth). This is the tempting one; it stays out.
- **Anything paid.** No charging in Phase 1 ([SPEC.md](SPEC.md) → Never), and the neutrality claim is a promise.
- **Random or rotating order.** Non-deterministic order breaks the shareable-URL guarantee, and cannot be statically rendered at all.
- **Price.** No provider publishes one — `price_from` and `price_to` are null throughout.

## The list a family carries — `/lista-pogrebnih-usluga`

An export of the flow, as a sheet the family takes to the funeral director: *this is what we need.* Reached from the results page, and from nowhere else.

**It is aimed at two readers, and the second one is the point.** For the family it is the product's stated job — help them understand and say what they need — done in the one place where it pays off, at the counter. For the funeral director it is the first time the brand arrives in his office, carried by a customer he did not have to find. That is provider acquisition with no outreach, which is the cheapest supply-side channel this product will ever have, and it is why the sheet is designed to be *handed over* rather than merely read.

### Route, and why it is not under `/pogrebne-usluge/{grad}`

A top-level route taking `?grad=`, not a segment beneath the city. `/pogrebne-usluge/{grad}/lista` would sit in the same namespace as `{pogrebnik}`, and Resolving the entity/service slug collision settles that question in the other direction: the `usluga` segment exists to make a collision *structurally* impossible rather than accidentally absent. A second literal segment under `[grad]` would reintroduce exactly the unguarded case — a provider one day slugged `lista` — for a page that gains nothing from a pretty path, because it is never indexed.

`?grad=` is also already the flow's spelling for a city held in the query string (`parseGrad` in `lib/answers.ts`), so nothing new is invented.

**`noindex`, and absent from the sitemap.** It is a per-family artifact generated from query state, not content — indexing it would offer a crawler a combinatorial set of near-identical pages, which is the definition of thin content. It is deliberately **not** disallowed in `robots.txt`, for the same reason `/privatnost` is not: a disallowed URL is never fetched, so its `noindex` is never read.

### Where it is reached from, and how loud it is

**Between the shortlist and the others block**, bracketed by gold hairlines, with a full-width outlined action. It shipped at the foot of the page under the guidance strip and that was too quiet — by then the reader has passed every provider and the page has said everything it has to say. The position it moved to is the page's natural pause: the best matches have been read, nobody has been called yet, and a list of what to ask for is the next thought.

**Outlined, never filled, and that is a rule rather than a preference.** `ContactActions.module.css` holds this page to *exactly one solid dark mass per card, and it is the action the product exists to produce*. A filled button for the sheet would be a second dark mass competing with the phone.

**A floating or sticky bar was considered and rejected** (2026-09-21), for three reasons of increasing weight: it competes with the phone action at every scroll position at once rather than at one; it covers a card on a short screen, which on this page means covering a provider; and it reinstates exactly the sticky furniture this layout deleted when the desktop rail went. Prominence here comes from position and width, not from pinning.

### It names no provider

**Provider-neutral by decision** (owner, 2026-09-21). The family may well visit two, so a reusable sheet is worth more to them than a routed one; and naming a single provider on a document carrying our mark would look like a referral — the appearance the whole product is built to avoid, and which since 2026-09-24 it avoids by not ranking at all. The cost is the cleanest attribution signal we could have had, and it is accepted.

### A worksheet, not a receipt

**The flow's four answers are not a brief.** `situacija`, `nacin`, `pokojnik` and the city, printed back, tell a funeral director nothing he would not have in the first five seconds of the call — and a sheet that reads as a gimmick to the person it is meant to impress is worse than no sheet.

So the answers fill the top, and the body of the sheet is a **checklist over `CANONICAL_SERVICE_ORDER`**. That list already runs "roughly in the order a family encounters the decisions" (`lib/services.ts`), which is precisely the spine a brief needs, and it means the vocabulary on the sheet is the same vocabulary the provider pages use. What the director reads is a *scope* — eight ticked lines from someone who has thought about it — rather than a radio button.

It is also where the family does the understanding. Most people have never considered whether they want an osmrtnica or who files the paperwork until they see the words.

**Ticking happens on screen, and the ticks live in the URL** (`?trebam=`), like every other piece of flow state, so a sheet survives a refresh and can be sent to a sibling. Fixed parameter order, for the reason `answersToQuery` has one.

**Pre-ticked from the answers.** Cremation ticks `kremiranje` and `urne`; a burial ticks `lijesovi`; a deceased anywhere but home ticks `prijevoz-pokojnika`, and one abroad ticks `prijevoz-pokojnika-inozemstvo`. `organizacija-pogreba` and `sredivanje-dokumentacije` are always ticked. Nothing else is: a default tick on a genuine choice would be us answering for them.

The pre-ticking is doing more than saving taps — it is the moment the family sees that the site understood them without asking twice.

**`?trebam` present, even empty, is authoritative.** Absent means "derive from the answers"; present means the family has touched the list, including when they have unticked everything.

### Which services show, and which hide

Three sit behind a *prikaži sve* disclosure — `ekshumacija`, `balzamiranje`, `fotografiranje-pogreba`. They are real services and a family that needs one needs it badly, but on a phone they cost three lines of scroll each to the great majority who do not.

**`ugovaranje-unaprijed` is suppressed entirely** unless `situacija = 'planiranje'`. `lib/services.ts` already argues the case for trailing it; on this sheet the stakes are higher, because handing a family whose father died last night a checkbox for booking their own funeral is not a misordered list, it is an insult.

### No text fields anywhere

**Nothing on this page accepts typed input**, and that is a GDPR position rather than a simplification. A name-and-number box would put the family's own contact details into a URL that is meant to be shared and that appears in a server log, reopening the question the no-PII design closes ([SPEC.md](SPEC.md) → Always). The printed sheet carries ruled blank lines instead, filled in by hand.

The *questions worth asking* block replaces the notes box a reader would otherwise expect, and is the better trade: it is guidance, which is what this product is actually good at, and it needs no input at all.

### Print is real, but it is the margin case

Most families will show the sheet on the phone at the counter, or forward it. Printing still has to work, because a leave-behind is worth something — so the same route carries a print stylesheet rather than a separate document:

- **One side of A4 is a hard constraint**, not a target. A two-page brief is a brief nobody reads.
- **The mark prints.** It is an `<img>` rather than a background so it survives the browser's "no background graphics" default, and carries `print-color-adjust: exact` — it is what makes the paper recognisable as a thing from somewhere when it is lying on a funeral director's desk, which is the only reason the sheet is branded at all.
- **This is the one route whose `title` is `absolute`**, skipping the layout's `· Pogrebne usluge` template. Browsers print the document title in the page header, and the template put the site's name there while the sheet beneath already carried the mark, `pogreb.net` and its own heading — the same information three times on one side of paper.
- Kamen's warm greys print faint, so the palette tokens are redefined once inside `@media print` in `globals.css` rather than overridden per component.
- Masthead, footer, disclosures and every button drop out; unticked services drop out too, since the printed sheet is a statement rather than a worksheet.
- Ruled blank lines for the family's own name and number, and for anything to add by hand.
- The site address prints at the foot, so the paper points back.

### Sharing

The phone's own share sheet (`navigator.share`), falling back to copying the link, plus a copy-as-plain-text for pasting into WhatsApp or Viber — which is how this will actually travel. Both are browser APIs; **no integration is added and nothing leaves our origin** ([SPEC.md](SPEC.md) → Boundaries).

**The share payload carries `url` and `title` and never `text` alongside them.** A share containing both is handled inconsistently — WhatsApp, Viber and Messenger concatenate the two and send the address as characters inside a sentence, so the recipient gets neither a tappable link nor the preview card the root layout's OpenGraph tags already describe. Sharing a bare URL is what makes the target treat it as a link. The sheet as prose is the button beside it, not a field in the same call.

### The two strings that are fixed

Recorded because both were changed by the project owner against a draft, and both would otherwise drift:

- The sheet's title is **`Lista pogrebnih usluga`** — not *"Sažetak potreba"*, which was abstract where this says what the thing is, and which does not match the vocabulary of `/pogrebne-usluge/`.
- The foot carries **`Besplatni agregator pogrebnih usluga u Hrvatskoj.`** It answers the director's first question — *who are these people* — where the draft's neutrality claim answered his second. Noted, because that draft line (*nobody pays for position*) is the sentence that converts later, and the foot is where it would go back.

### Logging — `brief_export`

Written to `city_events` via `log_city_event` ([SPEC_database.md](SPEC_database.md) → City-level logging), applied 2026-09-21. `logCityEvent` in `lib/instrumentation.ts` reuses `shouldLog()` rather than reimplementing the environment guard — there is one answer to *"is this real traffic"*, and two copies of it would drift.

Two rules specific to this event:

- **Logged on an export gesture, never on mount.** Arriving at the sheet is not carrying it away. A mount-time log would count every refresh and every shared link opened merely to look, turning the one number meant to show the feature works into a page view.
- **Once per mount, not once per button.** A family that shares the sheet and then prints it carried out one export; counting two would inflate precisely the most engaged reader. Held in a ref, so recording it never re-renders.

### The shared card

`noindex` and an OpenGraph card are not in tension here, and the page needs both. `noindex` is about search. The card is about messaging, and this is the **most-shared page in the product by design** — sharing is one of its three actions.

It shipped inheriting the layout's `openGraph`, which titled every sheet *"Pogrebne usluge"* and pointed `og:url` at the site root, so a recipient got a generic site card or no card at all. It now builds its own through `openGraph()` in `lib/seo.ts`, carrying the city and the sheet's own URL, answers and ticks included.

This is also why `robots.txt` must keep **not** disallowing the route: the messengers' fetchers honour `robots.txt` rather than the meta tag, so a disallow would turn them away from the card as well as leaving the `noindex` unread.

## Provider detail page

`/pogrebne-usluge/split/{slug}`, using the stored `entities.slug` — never re-derived at query time ([SPEC_database.md](SPEC_database.md) → Deriving `entities.slug`). Unknown slug → 404, not a redirect to the city page.

**Above the fold, in this order:** name, 24-hour mark, call button, address, open-now status.

### Phone selection

Which number the primary action dials — one rule, shared with the shortlist card:

- If the provider is **currently outside its posted hours** and an `emergency` phone exists → that number, and the button carries the note *"dežurni telefon"*.
- Otherwise → `phones[0]`, the stored primary.

This is the whole point of typing phones in the schema: after hours the office line is useless, and the emergency line is the entire value of the listing.

**The rule runs in the browser, in the component that renders the button** — `ContactActions` on a card, `PrimaryCallAction` on the detail page — and never in whatever server component happens to render them (2026-09-24, see Search → Rendering). Two reasons, and the second is not hypothetical: a server-side choice pins the page to one instant and forces the whole route to be per-request, which is what stalled indexing; and it had already frozen the choice at build time on the 36 statically prerendered service listings, so those pages would hand a family the office line at 3am. **Before hydration the button carries `phones[0]`** — the rule's own answer whenever it has no grounds to promote the dežurni line — so the no-JavaScript path dials correctly and simply does not get the after-hours upgrade.

**The detail page differs from the list page in one respect: every number is shown.** All numbers are listed beneath the button with their type in Croatian (`office` → *ured*, `mobile` → *mobitel*, `emergency` → *dežurni*), each a `tel:` link that logs `phone_click`. The button itself reads `Nazovite` without a number and needs no reveal step here, because the list below already provides it. **It read `Nazovi` until 2026-09-07** — the one place in the product still in the ti-form, against the register rule two sections up; the owner settled it on the vi-form, so the detail page, the cards and `/specimen` now all read `Nazovite` / `Pošaljite e-mail`.

That is a deliberate exception. Choosing between a provider's office and dežurni line is core value on this page — and hiding all of them behind clicks would be hostile on the one page a family reaches when they have decided who to call. It also gives the number a no-JavaScript path, which the list page's reveal does not have. The cost is that a number can be dialled off this page without a `phone_click`; that leak is bounded, it always follows a recorded `detail_view`, and it undercounts rather than overcounts.

### Open-now computation

- Computed in **`Europe/Zagreb`**, which observes DST. Getting this wrong is the standard way this kind of feature quietly misleads people ([SPEC_database.md](SPEC_database.md) carries the same warning for reporting queries).
- The three day forms from the schema map as: `{from,to}` → open/closed by clock; `{closed: true}` → *zatvoreno*; `{by_arrangement: true}` → *po dogovoru*, and never a closed state.
- **An absent day means unknown and renders as nothing.** It must never render as *zatvoreno*. Wrongly telling a family a provider is closed is the worst failure this page can produce.
- `working_hours` null entirely → no hours section, and no open/closed claim anywhere on the page.
- `available_24_7` true → the open-now status is always *"Dostupni 0–24"*, regardless of `working_hours`.
- **Computed in the browser after mount** (`OpenStatus`, 2026-09-24 — see Search → Rendering), so a cached page cannot claim *otvoreno* at midnight. **Before hydration it renders nothing**, which is the same output as the unknown-day case above and for the same reason: a page that has not yet run the computation has no grounds to make a claim either way.

### Rest of the page

- **Full service list**, canonical seed order. A price appears only where `price_from` / `price_to` is non-null, prefixed *"od"* and carrying an *"orijentacijski"* caveat.
- **Two CTAs at the top, call and e-mail** (2026-09-07). One column on a phone, halves from 480px up; the primary keeps its weight through fill, not width. Neither reveals a number, unlike the shortlist card — every number is listed in full below, so there is nothing to reveal. The e-mail action needs a client boundary to log its click and does not reuse `ContactActions`, which carries the card's reveal behaviour with it.
- **Four labelled sections, in this order: Kontakt, Usluge, Radno vrijeme, Web stranica** (2026-09-07). The e-mail address moved into `Kontakt`, directly under the numbers and in the same row shape as a `PhoneList` row — the button is the action, the address is the fact. The website kept its place after the opening hours, because sending a visitor off-site earlier ends the visit while they are still deciding, but it gained a heading of its own: the page used to trail off into an unlabelled block of links grouped by *is a link* rather than by what a reader is looking for.
- **`last_verified_at` is not displayed**, and **no freshness claim of any kind appears** — not even a soft *"podaci se redovno provjeravaju"*. With manual entry the date will go stale, and a visible stale date damages trust more than no date; an unverifiable reassurance is worse than both. The field stays internal, for data-quality triage.
- **Back link to the results, preserving the query parameters**, so returning does not restart the flow. The answers are read in the browser (`FlowBackLink`) rather than from `searchParams`, because reading them on the server made the whole route per-request — see Search → Rendering. They were never used for anything this page renders.
- **No map.** Coordinates are null for all 7, and a mapping API is a new external integration ([SPEC.md](SPEC.md) → Ask first).

## Routing and URLs

| route | purpose |
|---|---|
| `/` | landing page — what the service is, and the way into the flow |
| `/?korak=situacija\|mjesto\|potrebe` | the three question screens; not canonical, `noindex` via `robots`. Carries `?grad=` from screen 2 onward |
| `/pogrebne-usluge/{grad}` | the city listing; screen 2 answered by the path, screens 1 and 3 by query params. **Statically prerendered** — the answers are read in the browser ([Rendering](#rendering-and-why-it-is-a-search-decision-2026-09-24)) |
| `/pogrebne-usluge/{grad}/{pogrebnik}` | provider detail |
| `/pogrebne-usluge/{grad}/usluga/{usluga}` | indexable service-filtered listing |
| `/lista-pogrebnih-usluga` | the sheet a family carries to the funeral director, generated from the flow. Carries `?grad=`, the answers, and `?trebam=`. `noindex`, absent from the sitemap, and **not** disallowed in `robots.txt` — see The list a family carries |
| `/sto-uciniti-prvo` | guidance page |
| `/koliko-kosta-pogreb` | the cost page and the estimator |
| `/preuzimanje-troskova-pogreba` | who covers funeral costs when the family does not — the statutory schemes |
| `/nase-obecanje` | the four promises in full, each with what it rules out |
| `/za-pogrebnike` | the provider page — corrections, missing listings, collaboration, and the product's only form |
| `/za-pogrebnike/hvala` | where a submission lands. Reached only by Netlify's redirect; `noindex`, and absent from the sitemap |
| `/privatnost` | the privacy notice, covering the provider form only. `noindex` and absent from the sitemap, by decision — it helps nobody who is searching. Linked from the footer baseline and from beside the form's submit button, which is where art. 13 needs it. **Deliberately not disallowed in `robots.txt`**: a disallowed URL is never fetched, so its `noindex` is never read, and the two mechanisms cancel rather than reinforce |

### Resolving the entity/service slug collision

This settles the open question in [SPEC_database.md](SPEC_database.md) → Open questions, which correctly deferred it here. **Option 1 — segment the namespace.** The two kinds of thing are separated because they are not the same kind of thing:

- **Flow and filter state → query parameters.** The flow carries `?situacija=…&nacin=…&pokojnik=…`; a city page carries `?situacija=`, `?pokojnik=` and its own `?filtri=` and `?poredak=`. **`nacin` is translated, not carried** — `resultsHref` turns `nacin=kremiranje` into `filtri=kremiranje` and drops `ukop` entirely, so the same instruction is never in the URL twice and the two can never disagree. Not canonical pages: each carries `rel=canonical` to the bare city page and is excluded from the sitemap. Collision is impossible, the URL stays shareable, and this is where the wizard's answers already live.
- **Indexable service listings → `/usluga/{slug}`.** The literal `usluga` segment makes the collision *structurally* impossible rather than accidentally absent — it survives a future provider named "Urne", which is the exact case that made the current arrangement unguarded rather than merely unbroken.

`/kremiranje/split` (option 2) is rejected: it reads well and matches search intent, but it puts a data-driven vocabulary at the URL root, colliding with every future top-level route (`/o-nama`, `/sto-uciniti-prvo`, `/nase-obecanje`) and creating a second route tree with a second template to maintain.

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
3. **The four promises are the product's constraints written down**, so a change to any of them is a change to the product, not to copy. Monetisation in particular touches the first and third directly — see [SPEC.md](SPEC.md) → Boundaries, where charging anyone in Phase 1 is a Never and where the commercial thinking is deliberately kept out of this repository.

**Still absent: a named owner.** A promise page with nobody behind it is the weakest kind, and a name cannot be invented ([SPEC.md](SPEC.md) → Never: fabricating data); the project owner has chosen not to publish one. It waits on `/o-nama`. Tracked under [Known gaps](#known-gaps-deliberately-deferred).

**The contact route is half closed as of 2026-09-04.** *"Javite nam"* appears on this page and appeared on `/kako-rangiramo` until that page was deleted, and until 2026-09-04 neither actually linked anywhere — a defect, since earlier revisions of this spec and of `CLAUDE.md` both claimed they did. Both now link to `/za-pogrebnike`. On this page the phrase lives inside a plain-string array, so the address sits in a sentence below the list rather than inside the sentence that promises it. What is still missing is a route for a member of the public who is not a funeral director; that half is untouched.

**The closing note carries no count**, deliberately. An earlier version described the coverage as one area and a small number of providers, and said so straight through the seven-city expansion. A hand-written number here goes stale exactly the way `cities[0]` did; the landing page counts cities from the live rows so that prose like this does not have to.

## The provider page

`/za-pogrebnike` carries the product's only form. It exists because the businesses being listed had no way to reach us at all — the tracked half of the *"javite nam"* gap, which the prose pages said with nowhere to write to. They now link here.

**It is named for its audience, not for the transaction.** A menu item reading *Kontakt* would promise a grieving visitor a route that does not exist: there is still no user-facing form and no published address, by decision. *Za pogrebnike* says who the page is for, which is also how the providers who need it find it.

| section | content |
|---|---|
| *Prije nego pišete* | three facts stated before the form rather than after it, because they are what a provider decides on: listing is free, **we do not rank** (linking to `/nase-obecanje`), and the data is entered by hand and therefore goes stale. The middle fact read *"position cannot be bought"* until 2026-09-24; there is no position now, which is the stronger version of the same assurance and the one a provider can check for themselves |
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

## The cost page — `/koliko-kosta-pogreb`

Built **2026-09-15**, from the research in `.research/RESEARCH_funeral_costs.md`. That file is gitignored, so **this section is the only in-repo record of why the figures are what they are** — the same position [SPEC_database.md](SPEC_database.md) → Migrations holds for the database, and it went undocumented once already there.

It answers the question item 3 of [Planned content](#planned-content--the-article-pipeline) set as a condition: the research had to yield enough public, citable figures to genuinely answer *"what does this cost in Croatia"*, or the page was not to ship. It did — six municipal tariffs and one national equipment catalogue — so it ships, stating costs.

**It clears the `Never` on pricing**, which reads *"fabricating/guessing business data (phone, email, working hours, pricing) **without a verified source**"*. Every figure carries a `source` and an `asOf`, and **none of them is any provider's price**: they are published municipal tariffs and ranges assembled from cited catalogues. The product still holds zero `price_from` rows and still says nothing about what a given pogrebnik charges.

### Where the figures come from, and why the page does not say

`web/lib/costs.ts` holds three things kept deliberately apart, so each can be checked alone: the figures, a pure `estimate()`, and the display rounding.

The tariffed lines are **Lovrinac's, in Split** — and the page does not say so, which is a decision rather than an omission. Three reasons, in the order they decided it:

- **It is the only complete published bill in the country.** Lovrinac publishes both halves — the cemetery's work *and* the funeral service's. Everywhere else at most one half is public: Zagreb's grave digging is 122,76 € against Split's 262,00 €, which looks cheaper but is not, because the private pogrebnik's fee there is invisible rather than absent.
- **It errs high.** The tariffed core is ~614 € in Split against ~569 € in Rijeka and ~304 € in Zagreb. For a cost estimate that is the safe direction: a family braced for more and billed less is fine, the reverse is not.
- **Averaging was tried and rejected.** National ranges across all six tariffs give roughly **620–1.550 €**, and the project owner ruled that a span that wide is not information — *"telling someone it can cost between 500 and 1500 euro is not an information at all"*. Recorded because the arithmetic is genuinely defensible and someone will propose it again.

**A city picker was considered and rejected on the data.** Two things killed it. City size does not predict price — Zagreb digs a grave for 122,76 €, Pula for 91,25 €, Osijek for 275,00 € — so an urban/rural toggle would give a confidently wrong signal. And *"pick the nearest city"* fails on the same evidence: Pula, Poreč and Labin sit within 55 km of each other and charge 91,25 €, 186,01 € and 225,00 € for the same work. Of the seven covered cities only **two** (Split, Rijeka) have both halves of the bill published, so a seven-city picker would have been two cities of data and five of guesswork wearing a city label.

**The disclaimer carries what the city label would have.** It states that the figure depends on the city, the provider and the choices made, and the CTA sends the family into the flow at `korak=mjesto` to get a real offer. That is the page's honest ending: an estimate cannot bind anyone, and a written itemised offer can.

**Re-check every January.** Lovrinac reprices on 1 January — the 2026 list was a flat **5,00 %** uplift on the 2024 one, to the cent, on every line.

### The estimator

One screen, three questions plus a conditional fourth, recomputing live. It **deliberately does not follow the three-screen flow**: the flow is triage and its answers live in the URL so a result set can be shared, whereas this is a lookup nobody shares. State is local for the same reason — a URL encoding a coffin tier would be a link a grieving family could send a relative by accident.

| question | control | note |
|---|---|---|
| Ukop ili kremiranje? | radio | the biggest fork |
| Postoji li krematorij u vašem gradu? | radio, only under *kremiranje* | the one geographic question |
| Lijes | radio, three tiers | the widest single choice |
| Dodatno | checkboxes | vijenac · osmrtnica · glazba · karmine |

Four rules the estimator keeps, each of which was a defect first:

1. **Every figure on screen is rounded to 10 €, and each total is the sum of the rounded parts beneath it.** Lines round first, blocks are the sum of their lines, the headline is the sum of the blocks. Rounding each level independently lets a headline disagree with the blocks printed under it by a full step; exact cents in the itemisation under a rounded total reads as an arithmetic error even when both are right. **The step is 10 and not 50** because at 50 the recurring grave fee (10–80 €) renders as *"0–100 €"* — wrong at the bottom, since no grave costs nothing per year — which would force a carve-out the smaller step does not need.
2. **The itemisation shows groups, not tariff rows.** A dozen lines reading *"Opremanje kovčega 12,23 €"* is a procurement document rather than an explanation, and it overwhelms exactly the reader who opened the panel to understand the bill. Grouping also keeps every shown figure well above the rounding step, so nothing is distorted by being rounded.
3. **`vijenac` and `osmrtnica` are ticked by default.** Optional in principle, near-universal in practice — and an item like that defaulted off produces a headline **110–190 € too low** on a bill of about a thousand, which is the one failure this page cannot afford. They stay untickable, and that they *can* be declined is one of the page's points.
4. **Assumptions travel on the number they qualify**, in the `assumption` field, and render in the itemisation — never in the headline. Three carry one: karmine (25 guests), osmrtnica (one newspaper notice), cremation transport (distance). An assumption stored anywhere else is one that gets silently invalidated the next time someone edits its figure.

**The grave plot is never priced, for anyone.** An earlier version asked whether the family had a grave, a tomb, or nothing; the question was dropped entirely on 2026-09-15 and the caveat made permanent. The opening of the grave *is* charged, as a range spanning both kinds (tomb 220,48 €, earth grave 285,88 € — a tomb is expensive to buy and **cheap to open**, which is the opposite of what almost everyone assumes). But the plot itself is allocated by order of registration rather than sold from a price list, the wait runs to years in the larger cities, and the figure spans a few hundred euros to several thousand. Any number there would be the least defensible one on the page, so the page states the exclusion instead.

### Two promises changed with it

Both would have been contradicted by the page directly beneath them, and the project owner cut them rather than qualify them — the stated intent being to publish prices and bring transparency to the market:

- **The footer** no longer says *"i ne navodimo cijene"*.
- **`/nase-obecanje`** no longer lists *"Ne uspoređujemo cijene i ne rangiramo po njima"* among its limits. It now says **`Ne rangiramo po cijeni`** and states that costs are published deliberately — which keeps the independence claim, the one that actually matters, and drops the one that no longer holds.

### What it does not do

It names no provider, quotes no provider's price, and ranks nothing. `/kako-rangiramo` came out of `MENU` when this page went in — the masthead stayed at four items rather than growing to five — and the page itself was deleted on 2026-09-24 with the ranking it documented.

## The entitlements page — `/preuzimanje-troskova-pogreba`

Shipped **2026-09-16**, from item 7 of [Planned content](#planned-content--the-article-pipeline). Six schemes that cover funeral costs — the social-welfare `naknada za pogrebne troškove`, the veterans' caps under the Pravilnik (NN 51/2018), the City of Zagreb's scheme, Posmrtna pripomoć, body donation to the Zagreb Medical Faculty — plus the fact that registering a death carries no fee at all. They are all published and nobody assembles them in one place.

### The framing rule, which is the page

**It reads as information you are entitled to, never as charity for the poor.** These are statutory rights and a members' association, not help for the unfortunate, and a reader who feels pitied by a paragraph closes the page before reaching the one that would have paid for the funeral. In practice: no *"ako si ne možete priuštiti"*, no sympathy voice, each scheme stated as a condition and an entitlement rather than as a hardship.

**The title carries the same decision.** It was drafted as *"Tko plaća pogreb ako obitelj ne može"*, which names the reader's failure in the headline. The route and the heading now name the mechanism instead — the owner's change, 2026-09-16.

**Body donation is the most delicate item on the site.** A real and dignified choice that removes the cost entirely, and one that reads badly if framed as a way to save money. It is therefore last, opens by saying what it is not, and is described as a decision the person makes for themselves in advance.

### The figures are statutory caps, and that is why they are allowed

Only the veterans' scheme publishes amounts — equipment to 300 €, burial to 200 €, wreath to 110 €, obituaries to 60 €, transport to 0,95 €/km, repatriation to 730 €, a new plot to 270 €. **A cap is not a price**: it is the entitlement itself, nothing on the page says what a funeral costs, and no provider is quoted. They are reproduced exactly rather than rounded to 10 € as the estimator's output is — that rounding exists so an assembled estimate does not claim a precision it lacks, and rounding a statutory limit would misstate what the state pays. Owner decision, 2026-09-15.

### Sources are named in the text, not collected at the foot

Owner decision, 2026-09-16, and a deliberate departure from `/sto-uciniti-prvo`, which lists its sources in a block at the bottom. That suits a page whose claims all come from the same three documents. Here every section is a *different* scheme run by a *different* body and the reader's next action is to contact that body, so the link sits on the institution's name where it already stands in the sentence — someone reading about veterans' entitlements does not have to scroll past four schemes that do not apply to them to find the one that does.

`SOURCES` remains the single place a URL is written and keeps its `supports` notes, but renders inline. What stays at the foot is the note that this describes existing rights rather than giving legal advice, and that the deciding body is the one receiving the request. Inline anchors need no class — the global `a` rule already carries the gold and the underline offset.

### Open on this page

- **The Croatian is the owner's own revision**, not a reviewed text in the sense [Known gaps](#known-gaps-deliberately-deferred) means.
- **`centar za socijalnu skrb`** appears twice. Those were reorganised into the **Hrvatski zavod za socijalni rad** on 1 January 2023. People still say the old name, so it may be the right word for a reader — but this page's own rule is that body names are quoted exactly, so it wants checking rather than assuming.
- **Two sentences in the Posmrtna pripomoć section** (*"vrijedi za sve članove, bez obzira na mjesto ukopa"*, *"ne raspolaže javnim sredstvima"*) do not trace to a source in `SOURCES`, which rule 1 forbids.
- **The estimator's fourth block**, *Možda ne morate platiti*, is designed in the research and unbuilt. This page is what would unlock it.

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

### The wordmark

**`pogreb.net`, not `Pogrebne usluge`** (owner, 2026-09-24), in the masthead and the footer alike. The category name described what the site is about, and on a directory of funeral services that is the one thing every page already says — it read as a label rather than as a name. The domain is what a reader repeats to a relative.

**The `<title>` template still ends `· Pogrebne usluge`**, and that is a separate decision rather than an oversight: the suffix puts the primary search phrase in every one of the site's titles, and `pogreb.net` is a brand nobody searches for yet. Changing it is an SEO question for a search read, not a branding one.

### Page height

**Vertical space on a phone is the scarcest resource this product has, and it outranks almost every other layout instinct.** 73% of traffic is mobile, the pages that matter are lists, and a family reading one is not browsing — every screenful they have to scroll past is a provider they did not see.

Treat it as a budget. Before adding any element to a listing page, the question is what it costs in pixels and what it displaces, not whether it is nice to have. What that has meant in practice:

- **A 256px card became an ~86px row**, and a phone went from showing three of Zagreb's providers to six or seven.
- **Repeated text is deleted, not shrunk.** The coverage sentence repeated the locative the `<h1>` had just given; the address repeated the city the heading names; `· Zagreb` on every row cost eight characters seventeen times. None of them were made smaller — they were removed.
- **Chrome pays rent.** `← Pitanja` cost 74px before the heading, once its own 44px tap target and the shell's 26px gap were counted, to offer a destination 16 of 19 visitors had never been to.
- **Prefer one line doing two jobs to two lines doing one each.** The count sits beside the heading it counts; the services disclosure shares a line with the actions; the coverage claim and the settlement list are one sentence.
- **Measure, do not estimate.** The numbers above came from reading the built HTML and the CSS, not from looking at a screenshot.

**The floors that do not move for height:** a tap target stays a tap target (the one stated exception is in [Accessibility](#accessibility), and it is larger than the rule, not smaller); text that a claim depends on is never removed to save a line; and nothing indexable leaves the served HTML.

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
- **The menu carries one level of grouping** (2026-09-16). `MENU` in `lib/nav.ts` is a list of links *and* groups; a `NavGroup` has children and, deliberately, **no `href`**, because a parent that both navigates and expands gives a click and an open different results, and on a touch screen those are one gesture. Groups do not nest — one level is what a masthead row can carry, and both renderers assume it.

  The two renderings differ on purpose. **Desktop** gives a group its own `<details>`, for the same reason the mobile menu is one; a hover-opened panel is not available, since CSS cannot open a `<details>` on hover and the `:focus-within` constructions that imitate one put navigation behind a tabindex on a non-interactive element. **Mobile shows the children inline under a quiet label** instead, because the panel around them is already a disclosure and nesting would cost two taps for one page. **The footer groups without any disclosure at all** — a column is already vertical, so every page stays one click away and crawlable.

  The group's marker is a **chevron drawn from two borders on a rotated box**, down when closed and up when open, switched instantly because Kamen does not animate navigation. It is not a breach of [Icons](#icons): that rule is against a *set* of pictograms standing for concepts, and this is a disclosure affordance like the hamburger's cut rule beside it.
- **Both masthead disclosures close themselves on navigation** (`NavDisclosure`). The header lives in the root layout and is never unmounted by a client-side navigation, and `open` is a DOM property React does not control — so an opened menu stayed open over the page it had just pointed at. Two triggers, because one covers only half: the route changing (`usePathname`, which also catches back and forward), and a click landing on a link, which is the only thing that fires when the reader chooses the page they are already on. **This is an enhancement, not a dependency** — with no JavaScript both still open and close on click, exactly as before. Neither closes on an outside click or on Escape; that needs document listeners, which is a real menu implementation.
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

- **The wordmark's mark** (`Logo`) — an olive branch read through a magnifying glass. See [The mark](#the-mark) below; it is a brand mark, not a pictogram, and it appears in exactly three places.
- **`StoneEngraving`** — one drawing, covered by [Image policy](#image-policy) rather than by this rule. It is currently on no page: the landing band it filled was replaced by the hero photograph on 2026-09-07, and the results header and `/sto-uciniti-prvo` bands it could fill are still texture alone.

The line the rule is actually drawing is against a *set*: pictograms that stand for concepts and multiply once the first three exist. That is why the *"Kako do pogrebnika"* steps are marked with numerals rather than with three drawn glyphs — three would have been a set.

### The mark

An **olive branch read through a magnifying glass**, supplied by the project owner on 2026-09-09. It replaced the Diocletian arch drawn for the first build, which said the place but not the job: the branch is the domain — Mediterranean, funerary, local in the same literal way the rest of Kamen is — and the glass is the act, which is *looking something up*, not comparing, rating or brokering.

**It is a raster, where the arch was an SVG in `currentColor`, and that is the one real cost of the change.** The mark carries its own ink — olive over near-black, with tonal shading a hand-written path could not carry honestly — so it no longer inherits colour from what it sits inside, and `.mark` in the header and footer no longer sets one. What makes that survivable is that Kamen is [single-theme](#single-theme-deliberately): every place it appears is `--stone`, which is the ground it was drawn against. **A dark surface anywhere in this product would break it**, and that is now a second reason not to introduce one.

Three placements, and no more without a decision:

| where | drawn at | notes |
| --- | --- | --- |
| masthead (`SiteHeader`) | 22px tall, 28px ≥860px | the lockup shares a 320px row with `Izbornik`; 22px is what keeps that from wrapping |
| footer (`SiteFooter`) | 26px tall | quieter than the masthead on purpose — it must not open the footer louder than the column headings beside it |
| share card (`app/opengraph-image.tsx`) | 169×100 | the one surface where the product is *seen* before it is read |

**Assets, and the geometry behind them.** The supplied file was 1536×1024 with the artwork in a transparent field, 944 KB. It is not a shipped asset and must not go back into `public/`, where everything ships:

- `web/assets/logo-master.png` — the master, trimmed to the artwork at alpha threshold 40: **1012×600**, 134 KB. Outside `public/`, so it never reaches a browser; the share card reads it at build time.
- `web/public/img/logo-mark.png` — **189×112**, 8.8 KB, the wide mark for masthead and footer at 4× its largest drawn size. One PNG, no `<picture>`: **WebP measured *larger* than PNG** for artwork this flat, and a second file that saves nothing is a second file to keep in step.
- `web/app/favicon.ico` (16/32/48), `icon.png` (192), `apple-icon.png` (180) — Next wires all three into `<head>` from the filenames alone; nothing is declared in `layout.tsx`.

**The icons are not the whole mark, and they cannot be.** The mark is 1.69:1, and letterboxed into a square it is illegible mush at 16px — this was rendered and looked at, not assumed. The icons instead crop to the **magnifier glyph alone** (ring, handle, and the leaves inside the glass), which keeps both halves of the idea and still reads at 16px. The crop is `left: 406, top: 0, 600×600` in master coordinates — the glyph's bounding box squared, with 6% padding. Reproduce it from those numbers if the artwork is ever re-cut.

⚠️ **Two traps, both of which cost a build:**

- **The icons are flattened onto `--stone`, deliberately.** A transparent icon with a near-black ring disappears into dark browser chrome. Single-theme applies to the tab as well.
- **Next's ICO decoder rejects palette and RGB PNG payloads inside an `.ico`** — `Format error decoding Ico: The PNG is not in RGBA format!`, and the build fails outright. Every entry must be RGBA. `sharp`'s `palette: true` produces exactly the file that breaks it, which is how this was found.

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

**One stated exception to the 44px minimum (2026-09-24).** The filter panel's checkbox rows are 36px. They tile with no dead space and span the full column, so each target is roughly 346 × 36 ≈ 12,500px² against the ~1,900px² a 44 × 44 square guarantees — a larger target, not a smaller one. It is written down here so it reads as a decision rather than as drift; nothing else in the product goes under 44.

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

**The city pages carry visible upward navigation, as of 2026-09-24.** `BreadcrumbList` had shipped since the search work with nothing on the page to describe, which is not what the markup is for — Google's guidance is that it describes a breadcrumb the page has — and `Search appearance.csv` came back header-only in both Search Console reads with no enhancement credited.

**What the city pages actually render is one link home, worded as an action:** *← Natrag na naslovnicu*. It was briefly a two-crumb trail and the owner cut it back — the second crumb repeated the `<h1>` directly beneath it, and a crumb over a heading that already says the same thing spends a line to say nothing.

The markup still carries both crumbs, and this link is the first of them worded as an action rather than a name — the page's one piece of upward navigation, which is what `BreadcrumbList` describes. The second crumb's name was changed from *"Pogrebnici u Zagrebu i okolici"* to the area label so it matches the heading it stands for. **Worth re-checking at the next search read** whether the enhancement is credited: a trail of literal crumbs is the shape Google's examples use, and this is a link.

Built in `lib/structured-data.ts`, rendered by `components/JsonLd.tsx`:

| type | where | what it is |
|---|---|---|
| `FuneralHome` | provider pages | the business — name, address, phone, email, `taxID` from `oib`, opening hours, services as offers |
| `ItemList` | city and service listings | the providers **in the order the page renders them** |
| `BreadcrumbList` | city, provider, service | the trail, **with names matching the visible breadcrumb word for word** |

Two rules govern this and neither is negotiable:

- **Everything marked up is something the page already shows.** Marking up a fact the reader cannot see is the line between structured data and spam.
- **A null column is omitted, never guessed** ([SPEC.md](SPEC.md) → Never: fabricating business data). This is also why `openingHoursSpecification` omits days absent from `working_hours`: absent means *unknown*, and emitting it as closed would tell a family a provider is shut when it is not.

**Deliberately absent, each for a reason:** no `geo` (coordinates null for all 45); no `aggregateRating` or `review` (no review data exists, and it is the most abused property in local schema); no `priceRange` (almost every `price_from` is null, and a guessed price band on a funeral is the worst possible thing to be wrong about); no site-level `Organization` (it would have to name a publisher, and none exists — the same gap `/privatnost` records).

`JsonLd` escapes `<` before serialising. Provider names and addresses come from the database, and a value containing `</script>` would otherwise close the element early.

### OpenGraph, and the merge trap behind it

Link previews exist because the product already assumes the behaviour: a family member sends the link to a sibling, and those links open in WhatsApp and Viber.

⚠️ **Next merges `metadata` shallowly, and this cost real tags.** A page setting its own `openGraph` **replaces** the root layout's object outright instead of merging into it — so `og:site_name`, `og:locale`, `og:type` and the file-based `og:image` vanished from exactly the pages that bothered to write a good title, while a prose page setting no `openGraph` at all kept a complete set.

**Therefore: no page hand-writes an `openGraph` object.** Every one goes through `openGraph()` in `lib/seo.ts`, which restates the site-wide parts alongside the per-page ones. A page that bypasses it will look correct in review and ship a broken preview card.

The card image is `app/opengraph-image.tsx`, drawn with `next/og` rather than shipped as a binary — no third-party request, and the Kamen palette stays in one language. **It carries [the mark](#the-mark)** as of 2026-09-09: until then the card held the palette but no identity, and a preview card is the one surface where the product is seen before it is read. Two things constrain that: Satori resolves `<img src>` from a URL or a data URI and nothing else, so the master is read from disk at build time and base64'd in rather than fetched over the network; and Satori does not apply `object-fit`, so the mark's `width`/`height` must hold the master's 1012×600 ratio exactly or the artwork silently stretches. The card's vertical budget is fixed at 630px and the mark spends 136 of it, which is why the padding came down from 96px to 78px. **Every string in it is deliberately free of Croatian diacritics**: it renders in the font bundled with `next/og`, which has not been through [the diacritic constraint](#the-diacritic-constraint), and a preview card rendering `Dakovo` for `Đakovo` would be the most visible possible instance of that failure. Vendor a TTF or OTF before putting a diacritic in it — the existing faces are `woff2`, which Satori cannot read.

### Sitemap

City entries carry `lastModified` derived from the newest `updated_at` among the providers they list — a city page *is* its provider list, so that is the honest signal. Provider entries already had it. `priority` and `changeFrequency` are present but not tuned, because Google ignores both.

### Canonicals

Every route emits an absolute canonical resolved against `metadataBase`. **The home page emitted none at all** until 2026-09-04 — the page search matters most for was the one route opted out of the mechanism that exists to stop each host vouching for its own copy.

### Rendering, and why it is a search decision (2026-09-24)

**Every indexable page that can be cached, is.** This is not a performance preference; it is the constraint that governs whether the site gets indexed at all.

**What went wrong.** Until 2026-09-24 the provider pages, the city pages, `/` and `/sto-uciniti-prvo` were all `force-dynamic`. They returned `Cache-Control: private,no-cache,no-store` with `Age: 0`, so nothing was served from Netlify's edge and every request — including every crawl — ran a serverless function and queried Supabase. Measured on the live site: one request at a time returned in ~0.8s, **eight concurrent requests returned in 3.6–4.4s**. Google's definition of *Discovered – currently not indexed* is *"Google wanted to crawl the URL but this was expected to overload the site; therefore Google rescheduled the crawl"* — and it had **88 of 113 URLs** in that state, indexing four pages in eighteen days. The full measurement is in `.seo/ANALYSIS_2026-09-24.md` → ROOT CAUSE.

**Crawl throttling is per host, not per URL.** The 36 service listings were already static and fast, and only 2 of them were indexed. Slow routes drag down the crawl rate for the whole site, which is why this could not be fixed one page at a time.

**The rule that follows: time-dependent output is computed in the browser, not in the server render.** Open-now and the dežurni-phone choice are pure functions of the current time over static columns, so rendering them on the server pins one instant into the HTML — which is only correct for a page rendered per request, and that is exactly the property that has to go. Running them after mount makes the page a cacheable artefact **and makes the answer stricter**: a cached render is right for the moment it was built, a client computation is right for the moment the reader is looking. `lib/hours.ts` did not change — it was already pure and already took `now` as a parameter, so only the call site moved.

**Before hydration, each of these renders the time-independent fallback that `lib/hours.ts` itself produces when it has no information** — the stored primary number, and no open/closed claim at all. That keeps the no-JavaScript path working and keeps the absent-day rule intact: an un-hydrated page has no grounds to say a provider is shut, so it says nothing.

**Two things force a route to be per-request, and both are easy to trip.**

- **Reading `searchParams` in a server component** opts the whole route into per-request rendering whatever `revalidate` says. On the provider page the flow's answers were used for nothing the page renders — only for the back-link href — so they moved to `useSearchParams` behind a `Suspense` boundary. The fallback is the same link without the query, which is correct rather than empty. On the city page the answers did drive rendered output until ranking was removed; what is left is read with `useMounted`, for the reason below.
- **`revalidate` alone is not enough on a dynamic segment.** With no `generateStaticParams` there are no paths to build, so the route is served on demand and the first crawl of each page still pays full origin cost. `getProviderPageParams` exists for this, and mirrors `getServicePageParams` — including going through `getCityProviders`, so a provider hidden from a city listing cannot acquire a prerendered detail page. The city pages build theirs straight from `getCities`.

**The city pages became static on 2026-09-24, and only `/` stays per-request.**

This section originally recorded the opposite — that the city pages had to stay per-request because they needed `searchParams` on the server for *"ranking and guidance"*, and that moving them would client-render the provider list and its `ItemList`. **Removing ranking removed the last server-side use of the answers** ([Order and filtering](#order-and-filtering)), and the objection turned out not to apply to what replaced it:

- **A filter is subtractive; an order is not.** Ranking had to run on the server because the order has to be *in* the HTML. Hiding non-matching cards does not: the server renders every provider alphabetically with the full `ItemList`, and the browser narrows it afterwards. A crawler is served the complete list, which is strictly better than what it got before.
- **Guidance costs nothing to move.** The strip only renders when `situacija` is set, and a crawler never sets it — so it was never in the served HTML to begin with.

`generateStaticParams` over the nine cities, and `revalidate = 3600`. **Uncached indexable URLs went 66 → 10 → 1.**

**The city page's header lives in the client component too**, because two of its three parts are client state: the count reads `5 od 17` once a filter is on, and the funnel is the control that put it there. The `<h1>` is still in the served HTML — a client component is rendered on the server for the initial markup — so [Headings carry the city](#headings-carry-the-city) is untouched. Verified after every build by grepping the prerendered HTML for the heading and the row count.

**`useSearchParams` is the wrong tool for a component that renders content, and this is the trap to know.** During static rendering it makes its subtree bail out to client-side rendering, so what lands in the HTML is the Suspense *fallback*. On `FlowBackLink` that fallback is a link, which is why the pattern is correct there. On the provider list it would be a city page whose served HTML contains **no providers at all** — invisible in the browser, catastrophic in the index. So `CityListing` and `FlowQuestionsLink` use `useMounted` and read `window.location.search` after mount instead: the full unfiltered list renders on the server and in the first client render, and the filter applies only once hydrated. That is the same shape as the open-now rule, and for the same reason.

**`/` stays per-request**, since it reads `searchParams` on the server to decide which flow step to show — the one remaining uncached indexable URL.

**This also fixed a live defect.** The service listings are statically prerendered and render `ProviderCard`, which called `selectDisplayPhone` during the build — so on those 36 pages the after-hours rule was frozen at build time and would hand a family the office line at 3am. That is the precise failure the rule exists to prevent, and it had been shipping since those pages were built. It is the reason the phone choice belongs in the component rather than in whatever happens to render it.

**Caching costs no instrumentation**, because Instrumentation rule 1 already requires `detail_view` to be logged from the client after mount and never from the server render. A decision taken to keep crawler and prefetch traffic out of `events` is what makes the pages safe to cache.

**Verified on production the same day.** Provider pages now return `Cache-Control: public` with `X-Nextjs-Prerender: 1` and a climbing `Age`, against `private,no-cache,no-store` and `Age: 0` before. Re-running the eight-concurrent-request measurement: **3.63–4.44s before, 0.45–0.58s warm after**. The spread collapsing matters more than the mean — the spread under concurrency is what a crawler reads as a host that cannot take the load. City pages returned `no-store` until 2026-09-24 and are now prerendered too; `/` still returns `no-store`, as intended.

**The check to repeat after any change here** is `curl -sI` for `Cache-Control` and `Age`, plus eight parallel requests across different provider pages. A route that quietly reverts to per-request rendering — by taking `searchParams`, or losing `generateStaticParams` — will show up in both and in nothing else, because the page will look and behave completely normally.

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
- **A deploy must not be assumed to pick up a data change**, because `@netlify/plugin-nextjs` restores `.next/cache` between builds. Trigger a deploy with the cache cleared, or confirm the new data on the live page rather than on the build log.

**This got wider on 2026-09-24, and the note that used to sit here is now wrong.** It read that the results page and provider detail were `force-dynamic` and always current, so only the `/usluga/{slug}` listings could go stale. **Provider detail is now SSG**, so it is in the same position as the service listings: prerendered at build, and subject to the warm-`.next/cache` trap above. `revalidate = 3600` bounds the staleness to an hour on the live site, but **a build with a warm cache can still bake old data into all 55 pages at once**, which is worse than what this note originally described. The results page and `/` remain per-request and always current. Verify a data change on a provider detail page, not only on a city page.
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

## Planned content — the article pipeline

Started as three pages the project owner approved on **2026-09-14**, off the back of the first Search Console read (`.seo/ANALYSIS_2026-09-14.md`, gitignored). One of them has since shipped, and the cost research that shipped it identified six more. They are listed here rather than in [Known gaps](#known-gaps-deliberately-deferred) because they are not gaps in something already built — they are new work with a decision behind it.

**Status at a glance.** Nothing below is scheduled; the ordering is the argument for what to do next, not a commitment.

| # | page | status |
|---|---|---|
| 1 | Prijevoz pokojnika iz inozemstva / sprovodnica | approved 2026-09-14, not built |
| 2 | Dokumenti — smrtni list, izvadak iz matice umrlih | approved 2026-09-14, not built |
| 3 | Troškovi pogreba | **shipped 2026-09-15** as [`/koliko-kosta-pogreb`](#the-cost-page--koliko-kosta-pogreb) |
| 4 | Koliko košta kremiranje i gdje se obavlja | **dropped 2026-09-16** — written, then cut before review |
| 5 | Koliko stvarno koštaju lijes i urna | **dropped 2026-09-16**, unwritten |
| 6 | Što morate platiti, a što ne morate | **absorbed** into page 3 as a collapsed section |
| 7 | Tko plaća pogreb ako obitelj ne može | **shipped 2026-09-16** as [`/preuzimanje-troskova-pogreba`](#the-entitlements-page--preuzimanje-troskova-pogreba) |
| 8 | Grobno mjesto: naknada, nasljeđivanje, napušteni grob | approved 2026-09-16, not built |
| 9 | Ugovaranje pogreba unaprijed | approved 2026-09-16, not built |
| 10 | Krematorij — što je kremiranje i kako teče | candidate, added 2026-09-16. **Informational, not a price page** |

Every one of them is **prose about Croatian procedure or published tariffs**, which means every one inherits the three rules binding `lib/guidance.ts`, not negotiable per page:

1. **A sentence that cannot be attributed to a source in that page's `SOURCES` does not go in.** Not "it is generally known", not "a funeral home's site says so".
2. **Description of ordinary procedure, never legal advice.** Where practice varies, say what usually happens.
3. **Deadlines and document names are quoted, not paraphrased.** A family repeating the wrong word at a counter is a real cost.

A fourth rule came out of writing page 3: **no framing in which the cheaper choice is the lesser one.** A family must be able to pick the plainest coffin without being told, by implication, that they loved someone less. The pages explain the bill; they do not accuse anyone of inflating it.

All of them land in the open [Croatian phrasing review](#known-gaps-deliberately-deferred) the moment they are written, and none should ship without it — sourced facts in unreviewed phrasing is exactly the state the existing guidance text is already in.

**What the 2026-09-16 round settled, and the rule it produced.** Items 4 and 5 were dropped and 7, 8 and 9 approved in the same conversation, and the reasoning is one rule rather than five decisions: **this product publishes one price page, not a price section.** Items whose subject is a *market price* are out; items whose subject is *procedure, rights or a recurring public fee* are in, figures included where a figure is what makes the rule legible. The second half of the same round: page 4 was built on the strongest fact in the research rather than the strongest query, and Google Trends says the query is `krematorij`, not its price — so **check the query before writing, not the evidence file.**

**Sourcing is not uniform, and the difference matters before writing.** Items 7, 8, 9 and the price half of 10 are fully sourced in `.research/RESEARCH_funeral_costs.md` (gitignored). **Items 1 and 2 are not**: item 2 needs its own source for the *izvadak iz matice umrlih*, which nothing we hold covers, and item 1's MVEP page will not carry the whole page alone. Item 10's procedural half — what actually happens between death and the urn — is also unsourced. Those three need a research pass first.

### 1. Prijevoz pokojnika iz inozemstva / sprovodnica — **a menu item**

The only one of the three that changes navigation: the owner asked for it as a **separate `MENU` entry** in `web/lib/nav.ts`. That menu's doc comment argues against casual additions, so the reason is recorded here: this is not an adjacent category being advertised before it exists, it is a procedure page for a demand already visible in the data.

**The five-items problem this item raised is now solved differently.** `MENU` carries groups as of 2026-09-16 (see [Layout and shape](#layout-and-shape)), so a new page no longer has to choose between a fifth top-level slot and invisibility.

**Why it earns the slot.** The search read showed impressions from the Netherlands, Canada, Austria, Switzerland, Germany, the UK and the US — 15 impressions and **2 of the 6 total clicks**, from a diaspora that has to repatriate a body and does not know what a *sprovodnica* is. We already list providers offering `prijevoz-pokojnika-inozemstvo`, so the page ends where the product can actually help, which is the test the other two also have to pass.

**Source.** MVEP is already in `nav.ts` → `SOURCES` and already backs the death-abroad case in `guidance.ts`. Start there; it will not cover the whole page alone.

**Open:** the exact route slug, and whether the page sits at the top level or inside a group.

### 2. Dokumenti — smrtni list, izvadak iz matice umrlih

What each document **is**, who issues it, what it is needed for, and how the two differ — the confusion that sends people to a counter twice.

Partly sourced already: NN 46/2011 art. 10 covers *Potvrda o smrti*, its four copies and where each goes, and `guidance.ts` already quotes it. The *izvadak iz matice umrlih* is a different document from a different office and is **not** covered by the existing sources — it needs its own.

This is the page most at risk of drifting into instruction rather than description, because "what do I need" is a question people want answered imperatively. Rule 2 applies hardest here.

### 3. Troškovi pogreba — **shipped**

**Explicitly scoped by the owner as research *and* prose**, in that order, because the prose could not be written before the research existed. Both are now done.

**Shipped 2026-09-15** as [`/koliko-kosta-pogreb`](#the-cost-page--koliko-kosta-pogreb), which is where the decisions live now. Kept here because the condition this item set is the reason it was allowed to ship, and the reasoning should not have to be reconstructed:

> A page titled *Troškovi pogreba* that never states a cost is worse than no page: it takes the query, fails the intent, and teaches Google the site does not answer it. Either the research yields enough public, citable figures to genuinely answer "what does this cost in Croatia", or the page should not ship under that title.

**The research cleared it.** Six municipal tariffs and a national equipment catalogue, all public and all dated. The `Never` on pricing turned out not to bite either: it forbids guessing *"without a verified source"*, and every figure carries one — none of them a provider's price. We still hold zero `price_from` rows and the product still says nothing about what a given pogrebnik charges.

**Demand was evidenced, not assumed:** `nasadi zadar cjenik` ranked **41** — page four — and still earned a click. That is someone wanting a price list badly enough to scroll past three pages of results.

The research also turned up two things this item did not anticipate, both now on the page: the **annual grave fee**, which recurs forever and which nobody is told about at the time, and the fact that **the plot itself cannot be priced at all** because it is allocated by registration order rather than sold.

### 4 and 5 — the rest of the cost cluster, **dropped 2026-09-16**

Both were approved on 2026-09-14 and both are now cut, on the owner's decision. Page 4 (*Koliko košta kremiranje*, `/koliko-kosta-kremiranje`) was written in full and deleted before review; page 5 (*Koliko stvarno koštaju lijes i urna*, `/cijena-lijesa-i-urne`) was never started.

**Two reasons, and the first one generalises:**

- **The product publishes one price page, not a price section.** The owner does not want the site's centre of gravity moving toward exact figures and tariff citations. `/koliko-kosta-pogreb` answers the cost question; a cluster of pages each quoting municipal tariffs turns a directory into a price index, which is not what this is.
- **The demand was not there.** Google Trends shows the searched term is **`krematorij`**, not the cost of cremation. Page 4 was built on the strongest *fact* in the research rather than on the strongest *query* — a distinction worth keeping in mind for the rest of this list. Page 5 additionally had little to say once the coffin range was already on page 3.

**What survives, and where.** The two facts worth keeping were already on page 3 before either page was written: that a cremation coffin exists and is cheaper, and that the coffin range is wide. The cremation research itself is intact in `.research/RESEARCH_funeral_costs.md` §3 and §6 and is not lost — item 10 below is where its non-price half goes.

**Do not revive these under the same framing.** If cremation returns it is as item 10.

### 6. Što morate platiti, a što ne morate — **absorbed, not dropped**

Planned as its own page; shipped instead as a **collapsed `<details>` section inside page 3**, on the owner's decision of 2026-09-15. A reader who came for the number should not have to scroll past the list of declinable items, and a reader who wants that list should not have to find another page for it. Revisit only if it outgrows the disclosure.

### 7. Tko plaća pogreb ako obitelj ne može — **shipped**

Approved and shipped on **2026-09-16** as [`/preuzimanje-troskova-pogreba`](#the-entitlements-page--preuzimanje-troskova-pogreba), which is where its decisions live now — including the title change away from the one this item is still named after.

It remains the item that unlocks a fourth block in the estimator, *Možda ne morate platiti*, shown conditionally and worded as rights. That block is still unbuilt.

### 8. Grobno mjesto: naknada, nasljeđivanje, napušteni grob — **approved 2026-09-16**

**The best sleeper in the set.** Real search demand, nobody explains it, and the facts are startling: a grave whose fee goes unpaid for ten years can be reallocated, and **tending or visiting it preserves nothing — only paying does**. The city owns the land; the family owns the monument and holds the plot only on allocation, with the right of use passing through `ostavinski postupak` rather than automatically.

Annual fees across the covered cities run **10–80 €**, which page 3 already surfaces without explaining.

**It is the best fit for what the owner actually wants from this list**, and the reason is the same one that killed pages 4 and 5: the subject is rights and procedure, and the money in it is a recurring municipal fee rather than a market price. The figures are there to make the rule legible, not to build a price index.

### 9. Ugovaranje pogreba unaprijed — **approved 2026-09-16**

Lowest search volume of the set, and the only one with somewhere specific to land: it gives the wired-but-hidden `planiranje` path (see [Screen 1](#screen-1--situacija)) a destination. Covers allocating a plot before a death is needed — priced in the Zagreb tariff as `dodjela prije nastale potrebe` — and Posmrtna pripomoć.

### 10. Krematorij — što je kremiranje i kako teče — *candidate, added 2026-09-16*

What replaces the dropped page 4, and **deliberately not the same page with the prices removed.**

**The query is `krematorij`**, per Google Trends — people want to know what cremation is, where the crematoria are, how the procedure runs, what happens to the urn afterwards and what the Church's position is. They are not searching for what it costs. Page 4 answered a question nobody was asking, which is the mistake this item exists to avoid repeating.

**Scope: informational, not priced.** Where the two crematoria are, what the process involves, what happens between death and the urn coming back, and where an urn can be placed. Costs belong on `/koliko-kosta-pogreb`, which already models cremation, and this page links there rather than restating it.

**Sensitivity is unchanged from page 4** and is the reason it needs writing carefully rather than quickly: cremation is a religious and cultural question in Croatia. Describe the procedure and the availability; do not argue the religious case in either direction, and do not frame cremation as the smart choice.

**Route:** open. Not a bare `/kremiranje`, which would collide conceptually with the `kremiranje` service slug already used in listing URLs.

## Out of scope for the POC

| not built | why |
|---|---|
| Map view | coordinates null for all 7; a mapping API is a new external integration (ask-first) and adds no decision value at 7 providers |
| Reviews / ratings | no review data exists, and inventing it is a Never |
| ~~Price calculator, cost tables~~ | **Overtaken 2026-09-15.** The objection was sound as written — we hold zero `price_from` rows and cannot honestly compare what providers charge, which *is* the German portals' model. What it missed is that the public tariffs of the municipal cemeteries are a different source entirely, and they are enough to answer the reader's question without quoting anyone's price. See [The cost page](#the-cost-page--koliko-kosta-pogreb). Comparing **providers** on price stays out. |
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
