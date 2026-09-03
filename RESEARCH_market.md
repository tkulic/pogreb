# RESEARCH: Comparable platforms worldwide, and monetization options

> Status: **research, not decisions.** Nothing here is binding. Where a recommendation touches
> `SPEC.md` → Boundaries (a new integration, a new write path, charging anyone, an external script),
> it is flagged as **ask-first** and stays unbuilt until the project owner decides.
>
> Written 2026-09-03. Two questions were asked: *why does the app read as a toy rather than a platform*,
> and *how could it be monetized, particularly from a cold start*. Sources are listed at the bottom.

## 1. The field surveyed

| platform | market | what it is | scale |
|---|---|---|---|
| [Funeral Guide](https://www.funeralguide.co.uk/) | UK | funeral director comparison + reviews + pricing | 5,813 funeral directors, 2,300+ cemeteries, 275 crematoria, 132k verified reviews |
| [carehome.co.uk](https://www.carehome.co.uk/) | UK | care home directory (closest structural analogue) | ~16,500 listings, 415k+ reviews, ~15M visits/yr, 7,000+ paying homes |
| [Gathered Here](https://www.gatheredhere.com.au/) | AU | funeral price comparison, prices gathered by phoning providers | ~600 of ~900 funeral homes |
| [uitvaart.nl](https://www.uitvaart.nl/) | NL | stage-organised funeral portal + crematorium tariffs + supplier directory | long-established, sponsor-funded |
| [Funeralocity](https://www.funeralocity.com/) | US | funeral home comparison + credentialing programme | national |
| [Legacy.com](https://www.legacy.com/) | US | obituary network + funeral home directory | obituary for ~3 of 4 US deaths; 3,500 funeral homes, 1,500 newspaper affiliates |
| [Weisse Liste](https://www.bertelsmann-stiftung.de/en/about-us/what-weve-achieved/weisse-liste) | DE | hospital/doctor comparison, foundation-owned, ad-free | nonprofit; licenses the portal to partners |
| [ZorgkaartNederland](https://www.zorgkaartnederland.nl/) | NL | care comparison owned by the national patient federation | reviews vetted by an editorial team |
| [Checkatrade / MyBuilder / Bark](https://www.swiftlead.co.uk/blog/checkatrade-vs-mybuilder-vs-bark) | UK | trades directories — the three monetization archetypes side by side | subscription vs pay-per-lead vs lead credits |
| [nekros.info](https://www.nekros.info/) | HR/BA/RS/ME | obituary aggregator — **where Croatian death-related attention actually is** | ~100k monthly users, ~20k daily, 52k e-osmrtnice, 1,200 municipalities |

Croatian directory incumbents are weak: `imenik.hr`, `posljednjipozdrav.com`, `privredni-imenik.com`,
`inmemoriam.hr` — unverified listings, no provenance, no guidance. The strong Croatian players are
obituary portals, not directories. That is both the competitive whitespace and the traffic lesson.

## 2. Why ours reads as a toy — six gaps, measured against the field

Not a design problem. The visual system is fine; the site is *thin in the dimensions the field is thick in*.

**2.1 One entity type, one city.** Funeral Guide lists funeral directors *and* 2,300 cemeteries *and*
275 crematoria *and* hospices *and* natural burial grounds. uitvaart.nl adds a supplier directory and
crematorium tariffs. We have 7 providers of one kind in one city. The cheapest fix needs no provider
cooperation, because the missing inventory is public record: **groblja** (cemetery administrations —
in Split, Lovrinac d.o.o., which publishes its own tariffs and runs a 24h line) and **krematoriji** —
of which Croatia has only **two**, Zagreb (Mirogoj) and Osijek. For a Split family choosing cremation,
"the deceased travels to Zagreb or Osijek" is more decision-relevant than any feature we could ship,
and it is a fact, not a price.

**2.2 Two prose pages where the field has forty.** Funeral Guide's hub is stage-organised — *When
someone dies → Arranging a funeral → Managing the estate → Government services → Bereavement support*.
uitvaart.nl's top-level nav literally *is* the stages: *Overlijden melden, Uitvaart regelen,
Mogelijkheden & kosten, Vooraf regelen, Informatie & advies*. We ship `/sto-uciniti-prvo` and
`/kako-rangiramo`. This is the largest single gap, and the one the existing `guidance.ts` work is
already halfway into.

**2.3 No institutional trust furniture.** A funeral portal is squarely YMYL ("Your Money or Your
Life"); Google's September 2025 rater-guideline update widened YMYL to civics/society content, and in
February 2026 an *Authors* section was added to Search Central. Credible YMYL sites carry: named
ownership, an About page naming humans, a contact route, a data-collection methodology, editorial
standards and a corrections policy, a revenue disclosure, per-page last-reviewed dates, and cited
sources. We have none of those pages — **but we already have the hard half**: `/kako-rangiramo` is a
published ranking methodology, which neither Funeral Guide nor Funeralocity offers, and the schema
already carries `data_source` and `last_verified_at` per record. Surfacing *"Podaci: Sudski registar ·
provjereno 2. 9. 2026."* on every profile is a credibility signal no Croatian competitor can match,
and it costs a template change.

**2.4 Counts are the field's headline, and ours reads small.** Every strong site leads with inventory
numbers ("5,813 funeral directors", "132,042 reviews", "16,500 homes"). Stating the live count was the
right instinct, but *seven* reads like a demo unless it is framed as **coverage**: every registered
provider in the city, none of them paying for position. Funeral Guide puts 60+ city links on its
homepage — that list is itself the "real platform" signal. A national coverage page with honest
per-city status (*Split — 7 provjerenih · Zagreb — u pripremi*) reads as a project with a map.
Guardrail from the programmatic-SEO literature: never generate a city page before its data exists —
a page that only swaps the city name is thin content and is now actively penalised.

**2.5 No reviews — and no substitute for them yet.** Reviews are the field's core asset (132k at
Funeral Guide, 415k at carehome.co.uk; ZorgkaartNederland's entire legitimacy is verified patient
reviews vetted by an editorial team). Ours are correctly out of scope — no data exists and inventing
it is a **Never**. What the leaders use *before* reviews accumulate is the instructive part: verified
facts, transparency, credentialing (Funeralocity's Excellence Provider panel scores business practices,
transparency, training, disciplinary history), and **pledges** — UK Fair Funerals signatories committed
to publishing their cheapest option including third-party costs. A transparency pledge we administer
needs zero user volume, is earned rather than bought, and gives providers a reason to engage with us
before we have traffic. It is also the natural on-ramp to §3.

**2.6 Desktop.** Already logged as a known gap, but it belongs in this list for a non-obvious reason:
a 560px column centred in a 1440px window is the strongest "practice project" cue there is, and desktop
is the view *every* decision-maker sees — the provider we pitch, the journalist, the partner.
Mobile-only is right for grieving families and wrong for everyone who decides whether we are real.

**One more thing to keep in view:** the incumbent competitor for *"pogrebne usluge Split"* is Google
Business Profile, not the sites above. Our defensible edges are the ones GBP structurally cannot have:
completeness (including providers with no GBP presence), provenance, no advertising, and stage guidance.

## 3. Monetization — what the field actually charges

| model | who does it | real numbers | fit for us |
|---|---|---|---|
| **Paid position / featured slots** | carehome.co.uk (5 featured slots; subscription tier *and* review score determine rank, free listings shuffled at the bottom), Jameda premium visibility | Enhanced £990/yr, Platinum £1,980/yr, 7,000+ subscribers | **Breaks landing promise #2.** The highest-revenue model in the field is the one thing we promise not to do |
| **Claimed profile subscription, position-neutral** | carehome/Jameda minus the ranking effect; Yelp's claim flow | first tier must be trivially approvable — €10–20/mo converts where €99 does not | **Best fit.** See Stage 1 |
| **Pay per lead / enquiry** | The Farewell Guide £12.50/enquiry, MyBuilder £5–35/shortlist, Bark ~£9–36/lead | funeral lead value is high | Economics work; conflicts with no-form/no-PII. A **pay-per-tap** variant does not — see Stage 2 |
| **Pay per call** | industry standard: tracked numbers, billable past a 90–120s threshold | $10–30 home services, $50–150 legal/insurance | Needs call tracking (Twilio-class) = new integration **and** call records = a GDPR step-change. **Ask-first**, and later |
| **Commission on adjacent goods** | Legacy.com (floral revenue rivals ad revenue), Florist One and Chicago Funeral Florist pay 20% to the referrer, Tribute Store profit-shares | 20% of a €60–120 wreath ≈ €12–24 | Possible later; sits badly with "we sell the bereaved nothing" |
| **Obituary / memorial network** | Legacy.com (funeral-home subscriptions + newspaper affiliates); locally nekros.info | Legacy publishes ~75% of US obituaries; nekros ~100k monthly users | **Largest strategic lever, largest register risk.** See Stage 3 |
| **SaaS to providers** | deathcare SaaS tiers $99–199 / $199–399 / $399–899 per month; funeral websites from ~$95/mo | US price points | Not for obrt-scale Croatian providers, and a different company |
| **Nonprofit / institutional funding + licensing** | Weisse Liste (foundation-owned, ad-free, independent of payers and providers; licensing to partners *is* the nonprofit business model), ZorgkaartNederland (owned by the patient federation) | — | **Genuinely available to us** — our independence and no-PII stance is exactly what such funders fund |
| **Single named sponsor** | uitvaart.nl (footer sponsors: de Facultatieve Groep, ZDG) | one sponsor, no ad tech | **Fits the single-origin constraint** better than any ad network |
| **Advertising / ad networks** | most directories | small niche directories $100–500/mo | **Excluded by our own rules** — third-party script, consent banner, and it would undo the no-cookie-banner position |

### The cold-start arithmetic

Croatia recorded **50,007 deaths in 2025** (DZS). Split's share of national population implies very
roughly ~2,000 funerals a year in the pilot catchment — *an inference from population share, not a
measured figure*. With 7 providers and near-zero traffic, **no volume-based model can pay anything
yet**, and that is not a problem to solve but a stage to respect. The directory literature is blunt
about the sequence: seed the listings first, turn on paid features at 60–90 days *once owners can see
referral traffic*, and lead the upgrade ask with their own analytics.

We are unusually well placed for that sequence, because `events` was built for exactly this: per-provider
`detail_view`, `phone_click` and `email_click`, bot-resistant by construction, in our own Postgres rather
than a third-party silo. That table is the sales deck.

### Recommended sequence

**Stage 0 — now. Revenue €0, deliberately.** Charging in Phase 1 is a **Never** anyway. Build the two
assets that are worthless if built late: **coverage** (every registered provider per city, verified,
with `last_verified_at` shown) and **evidence** (the events data). The sentence that sells Stage 1 is
*"in August this site sent 61 phone taps to Split providers; 14 of them were to you"* — and it can only
be said by someone who logged them.

**Stage 1 — first money: "Provjereni profil", position-neutral.** A claimed/verified profile
subscription. It buys: a richer profile (photos, service detail, opening hours, description, logo),
the monthly stats report, the ability to correct their own data, and a claimed badge. It must never
buy: rank, or the suppression of a competitor. Price for a Croatian obrt: **€15–25/month, or €150–250
prepaid annually**, going annual only after a first renewal. Seven providers × €20 is €140/month —
not a business, but proof of willingness to pay, which is all Stage 1 is for; scale comes from cities,
not from price. **The guardrail is the differentiator:** publish the price openly and state on
`/kako-rangiramo`, in the same breath, that paying changes nothing about order. carehome.co.uk and
Jameda cannot say that; saying it is worth more than the featured slots we would be giving up.
(Requires the deferred auth/`owner_id` flow — **ask-first**.)

**Stage 2 — performance pricing without a lead form: pay-per-tap.** Charge on `phone_click` /
`email_click`: a performance model needing no form, no user PII and no consent banner, on a metric we
already collect and already hardened. Ballpark **€1–3 per tap with a monthly cap**, or a tap quota
folded into the Stage 1 tier. State the weakness honestly to providers: a tap is not a call and not a
customer, and we cannot prove the call connected without call tracking — so this is priced as
*attention*, not as a lead. That honesty is also the reason not to move to pay-per-call, which would
buy proof at the cost of a new integration and call records.

**Stage 3 — the big lever, and the biggest risk: osmrtnice.** Croatian attention around death is
already concentrated in obituary portals — nekros.info alone sees more users in a day than this
directory will see in months — and Legacy.com shows what an obituary network compounds into. A fast,
structured osmrtnica publishing tool that providers use would make us useful *daily* rather than once
per family, and would generate repeat visits and inbound links no guide page can. **But** it turns us
into a publisher of personal data about the deceased and of condolence messages, which reopens
precisely the GDPR posture that currently earns us no cookie banner, and it shifts the register from
directory to memorial. Recorded as a strategic option requiring an explicit owner decision —
**ask-first** — not as a next step.

**Worth keeping on the table**

- **Institutional funding** (Weisse Liste / ZorgkaartNederland pattern): a city, a consumer-protection
  body, a foundation or an EU digital-public-good line funds exactly the properties we already have —
  independent, ad-free, no tracking. Weisse Liste's own revenue is *licensing the portal to partners*;
  the analogue is licensing a verified-provider widget or dataset to a bank, an insurer, or a city site.
- **Aggregate market intelligence, not contact lists.** Nobody in Croatia holds a clean, sourced register
  of NKD 96.03 entities with services and verification dates. Sellable to insurers, banks, researchers
  and journalists, and cold-start-friendly because it needs no traffic. Sell the *aggregate*: selling
  provider contact lists would contradict "the list isn't sold" even though the underlying data is public.
- **Adjacent supplier categories** — `inmemoriam.hr` already lists klesari, cvjećari, glazbenici and
  restaurants for karmine. Monetizing adjacent categories touches nothing about funeral-director
  neutrality, because they are not what the ranking ranks. Cleanest revenue expansion available.
- **A transparency pledge** (§2.5) as the free, pre-revenue provider relationship that Stage 1 upgrades.

**Explicitly reject:** ad networks (third-party script + banner + a broken privacy position), paid
position in any form, lead brokerage (it would make us the German portals the product is defined
against), and selling user data — we collect none, and that absence is the moat.

## 4. What to build next, in order

1. **Landing page rebuild** — coverage claim with live counts, the trust strip (*Sudski registar ·
   provjereno · nitko ne plaća za poziciju · bez kolačića*), stage-based content entries below the
   fold, the city-coverage list, and a real institutional footer. Keep the one-primary-action rule.
2. **Trust cluster** — `/o-nama` (naming humans), `/kako-prikupljamo-podatke`, `/ispravci` (with a
   "report a wrong detail" route), `/privatnost`, and later `/kako-se-financiramo`.
3. **Content spine** — 8–12 stage-organised Croatian guides plus a glossary (*ukop, ispraćaj,
   ekshumacija, karmine*), each with sources and a last-reviewed date. Extends existing `guidance.ts` work.
4. **Second directory dimension** — groblja and krematoriji from public records, cross-linked to the
   provider pages, carrying the two-crematoria fact.
5. **Desktop pass.**
6. **`/za-pogrebnike`** — the claim/verify funnel, and later the price. It converts Stage 1, and it makes
   the site read as two-sided before it is.
7. **Surface `data_source` and `last_verified_at`** in the UI on every provider.

Items 1–4 and 7 are frontend/content work inside existing scope. Item 6 depends on the deferred auth
flow (**ask-first**). Nothing in §3 beyond Stage 0 is authorised by this document.

## Sources

Platforms: [Funeral Guide](https://www.funeralguide.co.uk/) ·
[Funeral Guide help hub](https://www.funeralguide.co.uk/help-resources) ·
[carehome.co.uk](https://www.carehome.co.uk/) ·
[how carehome.co.uk search ordering works](https://support.carehome.co.uk/docs/how-do-carehomecouk-searches-work) ·
[carehome.co.uk overview](https://support.carehome.co.uk/docs/carehomecouk-overview) ·
[uitvaart.nl](https://www.uitvaart.nl/) ·
[Funeralocity Excellence Program](https://www.funeralocity.com/selected-funeral-homes) ·
[Gathered Here, and ABC News on its model](https://www.abc.net.au/news/2017-05-30/funeral-home-comparison-website-riles-up-industry/8571910) ·
[Weisse Liste (Bertelsmann Stiftung)](https://www.bertelsmann-stiftung.de/en/about-us/what-weve-achieved/weisse-liste) ·
[ZorgkaartNederland (Patiëntenfederatie)](https://www.patientenfederatie.nl/praktische-hulp/zorgkaart-nederland) ·
[nekros.info](https://www.nekros.info/o-nama) · [osmrtnice.hr](https://www.osmrtnice.hr/) ·
[inmemoriam.hr service taxonomy](https://www.inmemoriam.hr/pogrebne-usluge/)

Monetization: [Checkatrade vs MyBuilder vs Bark pricing](https://www.swiftlead.co.uk/blog/checkatrade-vs-mybuilder-vs-bark) ·
[The Farewell Guide per-enquiry pricing](https://www.thefarewellguide.co.uk/funeral-directors) ·
[pay-per-call economics](https://www.leadgen-economy.com/blog/pay-per-call-marketing-economics-operator-guide/) ·
[Legacy.com model](https://slate.com/technology/2017/12/legacy-com-has-cornered-the-market-on-death-online.html) ·
[Legacy funeral-home subscription model](https://sales.legacy.com/uncategorized/the-funeral-home-obit-subscription-model) ·
[Florist One 20% affiliate](https://www.floristone.com/funeral-home-flowers-affiliate-program/) ·
[deathcare SaaS pricing tiers](https://www.getmonetizely.com/articles/how-does-funeral-service-software-pricing-work-a-complete-guide-to-saas-solutions-in-the-death-care-industry) ·
[directory monetization models](https://www.edirectory.com/updates/how-directory-websites-make-money/) ·
[directory cold start and first paying customers](https://directorist.com/blog/online-directory-business-model/) ·
[marketplace cold start: which side first](https://internetmango.com/insights/marketplace-cold-start-strategy/) ·
[Yelp's claim-your-listing monetization](https://medium.com/swlh/building-yelp-bc4e62c4db3b)

Trust / SEO: [E-E-A-T and YMYL 2026](https://12amagency.com/blog/what-are-e-e-a-t-and-ymyl-in-seo/) ·
[YMYL guidelines](https://koanthic.com/en/ymyl-content-guidelines-complete-guide-for-2026/) ·
[programmatic SEO without thin pages](https://topicalmap.ai/blog/auto/programmatic-seo-for-local-service-area-pages) ·
[CMA Funerals Market Investigation Order 2021](https://gov.uk/government/publications/funerals-market-investigation-order-2021) ·
[Fair Funerals pledge](https://fairfuneralscampaign.org.uk/content/fair-funerals-pledge-2021)

Croatian context: [DZS — vital statistics 2025](https://podaci.dzs.hr/2026/hr/121581) ·
[N1 on 2025 deaths](https://n1info.hr/vijesti/lani-vise-umrlih-nego-rodjenih-u-svim-zupanijama-rekordan-broj-razvoda) ·
[Lovrinac d.o.o. (Split)](https://lovrinac.hr/) ·
[crematoria in Croatia](https://n1info.hr/biznis/pogrebi-sve-skuplji-kremiranje-sve-popularnije-evo-kako-se-krecu-cijene/)
