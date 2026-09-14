import type { Nacin, Situacija } from './ranking';
import type { Pokojnik } from './answers';

/**
 * Croatian user-facing copy.
 *
 * Collected in one file rather than scattered through components, because it
 * is the part of the product a native speaker reviews and the project owner
 * changes — and because several strings are *claims* rather than labels, with
 * rules attached to them.
 */

/** Screen 1 tile labels, and how an answer reads back in the context strip. */
export const SITUACIJA_LABEL: Record<Situacija, string> = {
  preminuo: 'Osoba je preminula',
  'posljednji-dani': 'Osoba je u posljednjim danima',
  planiranje: 'Planiram unaprijed',
};

/**
 * The situations offered on screen 1.
 *
 * **`planiranje` is deliberately absent.** Pre-planning is a different product
 * with a different pace — the whole flow is built around someone who has hours
 * rather than days — and it is not yet clear it belongs here at all. Hiding the
 * tile is the reversible half of that decision: the value still parses from a
 * URL, still ranks, and still drives copy, so an old shared link keeps working
 * and turning it back on is one entry in this array.
 *
 * If it is ever dropped for good, the things to remove with it are the
 * `planiranje` entry in `Situacija`, its label below, and the ranking note in
 * `lib/ranking.ts` about urgency applying only to `preminuo`.
 */
export const VISIBLE_SITUACIJA: readonly Situacija[] = ['preminuo', 'posljednji-dani'];

export const NACIN_LABEL: Record<Nacin, string> = {
  kremiranje: 'Kremiranje',
  ukop: 'Ukop',
};

export const POKOJNIK_LABEL: Record<Pokojnik, string> = {
  kuca: 'Kod kuće',
  bolnica: 'U bolnici',
  dom: 'U domu za starije',
  inozemstvo: 'U inozemstvu',
};

/** Phone types, rendered in Croatian. English in the data, Croatian on screen. */
export const PHONE_TYPE_LABEL: Record<string, string> = {
  office: 'ured',
  mobile: 'mobitel',
  emergency: 'dežurni',
};

/**
 * The catchment area for each pilot city.
 *
 * **This is a product claim confirmed by the project owner, not derived data.**
 * It must not be extended by guesswork — adding a settlement is an owner
 * decision (SPEC.md → Never: fabricating business data).
 *
 * Two limits on how it may be worded, both binding:
 *
 * 1. The claim is about **the pilot area, not about individual providers.** No
 *    provider's service radius has been verified. Copy may say "pogrebnici u
 *    Splitu i okolici"; it may never say "ovaj pogrebnik radi u Podstrani".
 * 2. **No distance or proximity claims anywhere.** `latitude`/`longitude` are
 *    null throughout and `cities` has no coordinates, so "blizu vas" or "5 km"
 *    would be unsupported by any data we hold.
 *
 * The six added with the 2026-09-03 city expansion were proposed by the data
 * research and **approved by the project owner as decision 12**, locative forms
 * included (`data/PILOT_CITIES_REVIEW.md` → Decision log). Two of them have an
 * objective basis rather than a judgement about how far people travel: the
 * Osijek list is Ukop's co-owner municipalities and the Dubrovnik list is
 * Boninovo's.
 *
 * **A city with no entry here still renders**, because every consumer falls
 * back to `city.name` — but the fallback produces broken Croatian in the one
 * place it matters most: `coverageClaim` would read "u Zagreb" rather than "u
 * Zagrebu". Adding a city to `cities` without adding it here is therefore a
 * visible defect, not a graceful degradation.
 */
export const CATCHMENT: Record<
  string,
  {
    /** Nominative — a heading or a standalone label. "Split i okolica" */
    label: string;
    /**
     * Locative — the form that follows "u". "u Splitu i okolici"
     *
     * Stored rather than derived: Croatian case endings cannot be produced by
     * string manipulation, and lowercasing a proper noun to slot it into a
     * sentence produces "u split i okolica", which reads as broken Croatian to
     * exactly the audience this product has.
     */
    locative: string;
    settlements: string[];
  }
> = {
  split: {
    label: 'Split i okolica',
    locative: 'Splitu i okolici',
    settlements: [
      'Podstrana',
      'Solin',
      'Kaštela',
      'Klis',
      // Added 2026-09-07 (decision C of the Split i okolica review). Roughly
      // 15 km out — closer than both Trogir and Omiš, which were already
      // listed — and grouped administratively with Solin and Klis. Seget and
      // Dugi Rat were proposed alongside it and declined.
      //
      // Its only local operator, Podi Dugopolje d.o.o., is held rather than
      // listed (decision D), so Dugopolje joins Podstrana and Klis as a named
      // settlement with no provider of its own. Covered in practice by the
      // Split and Solin providers — Zec keeps a Solin office under concession.
      'Dugopolje',
      'Stobreč',
      'Žrnovnica',
      'Omiš',
      'Trogir',
    ],
  },
  zagreb: {
    label: 'Zagreb i okolica',
    locative: 'Zagrebu i okolici',
    settlements: [
      // `Velika Gorica` and `Velika Mlaka` were both removed on 2026-09-14,
      // when Velika Gorica was promoted out of this catchment into a city of
      // its own. Two entries rather than one: Velika Mlaka is a settlement of
      // Grad Velika Gorica (postal 10408), and `miraj` sits in it. Leaving
      // either behind would have two city pages claiming the same place — and
      // the coverage claim is stated absolutely on both, so it would be two
      // pages contradicting each other rather than merely overlapping.
      'Zaprešić',
      'Samobor',
      'Sesvete',
      'Dugo Selo',
      'Lučko',
    ],
  },
  rijeka: {
    label: 'Rijeka i okolica',
    locative: 'Rijeci i okolici',
    settlements: [
      'Viškovo',
      'Matulji',
      'Kostrena',
      'Kastav',
      'Čavle',
      'Jelenje',
      'Opatija',
      'Bakar',
    ],
  },
  osijek: {
    label: 'Osijek i okolica',
    locative: 'Osijeku i okolici',
    settlements: [
      'Čepin',
      'Antunovac',
      'Ernestinovo',
      'Erdut',
      'Bilje',
      'Vladislavci',
    ],
  },
  zadar: {
    label: 'Zadar i okolica',
    locative: 'Zadru i okolici',
    settlements: [
      'Bibinje',
      'Sukošan',
      'Nin',
      'Privlaka',
      'Poličnik',
      'Zemunik',
      'Vir',
    ],
  },
  pula: {
    label: 'Pula i okolica',
    locative: 'Puli i okolici',
    settlements: [
      'Medulin',
      'Vodnjan',
      'Marčana',
      'Barban',
      'Svetvinčenat',
      'Fažana',
      'Ližnjan',
    ],
  },
  dubrovnik: {
    label: 'Dubrovnik i okolica',
    locative: 'Dubrovniku i okolici',
    settlements: [
      'Župa dubrovačka',
      'Konavle',
      'Cavtat',
      'Mokošica',
      'Dubrovačko primorje',
      'Ston',
    ],
  },
  // Added 2026-09-14 with the eighth city. Both settlements are the project
  // owner's decision, as CATCHMENT requires — Palma's own cemetery listings
  // point the same way (Podvinje, Sibinj and Ruščica directions), but evidence
  // is not authorisation here.
  'slavonski-brod': {
    label: 'Slavonski Brod i okolica',
    locative: 'Slavonskom Brodu i okolici',
    settlements: ['Sibinj', 'Bukovlje'],
  },
  // Added 2026-09-14. Promoted out of `zagreb` above rather than discovered.
  //
  // The first three settlements are where listed providers actually sit —
  // Velika Mlaka (miraj), Mala Buna (kos), Velika Kosnica (tolic) — and the
  // last two are municipalities whose cemeteries VG Komunalac administers.
  // Approved by the owner on that basis.
  'velika-gorica': {
    label: 'Velika Gorica i okolica',
    // "Velikoj Gorici" — both words decline, which is exactly the case the
    // stored-not-derived rule above exists for.
    locative: 'Velikoj Gorici i okolici',
    settlements: [
      'Velika Mlaka',
      'Mala Buna',
      'Velika Kosnica',
      'Pokupsko',
      'Kravarsko',
    ],
  },
};

/**
 * The product's headline claim, in the one wording the data actually supports:
 * every entity registered under NKD 96.03 in the pilot city, none omitted.
 *
 * **Deliberately count-free.** Stating "svih sedam" made the strongest fact we
 * have — that nobody is missing — read as a small number, and a visitor who
 * has never heard of us reads "seven" as the size of our database rather than
 * the size of the market. Coverage is the claim; the count is a detail.
 *
 * **As of 2026-09-07 that rule is absolute in prose:** no exact provider count
 * appears in customer-facing sentences anywhere. The service page's
 * "šest od sedam" and the counts in `/sto-uciniti-prvo` are gone, replaced by
 * `providerShare`. That still holds — but "in prose" is now load-bearing, and
 * there are **two** positions outside it where a bare figure stands in a
 * column or a heading rather than a sentence: `· N` on a results section
 * heading, which counts the cards below it rather than the market, and
 * `providerCountLabel` in the landing page's city list, restored by the owner
 * on 2026-09-14.
 *
 * Centralised because it appears on the results header, the service listings
 * and the provider pages. If it is ever hedged or widened it has to change in
 * all of them at once — a claim stated absolutely on one page and hedged on
 * the next reads as the hedge. The landing page uses `nationalCoverageClaim`
 * below, for the reason given there.
 *
 * Two limits carried over from CATCHMENT, both still binding: the claim is
 * about **the pilot area, not about any individual provider's service radius**,
 * and it says "registrirani" rather than "svi" because that is what we can
 * stand behind — a provider operating without a registry entry we could not
 * find is exactly the case the qualifier is honest about.
 *
 * **The trailing apposition was added 2026-09-14, from search data.** The
 * first Search Console read showed the market types *"pogrebno poduzeće
 * {grad}"* at least as often as *"pogrebne usluge {grad}"*, and the Zagreb
 * variants of it ranked 55–64 — page six — because the phrase appeared
 * nowhere on a city page. This is not a keyword bolted onto a sentence: it is
 * the **more precise** name for what the list contains, since `entity_type` is
 * `doo | jdoo | dd` (trgovačka društva — *poduzeća*) or `obrt` (a sole trader,
 * which is not a *poduzeće* and should not be called one). Saying "pogrebnici"
 * alone was the loose word.
 *
 * So it stays only while it stays true. If the data ever holds an entity that
 * is neither, this sentence is wrong on the most prominent line of the page and
 * has to change with it.
 */
export function coverageClaim(areaLocative: string): string {
  return `Svi registrirani pogrebnici u ${areaLocative} — pogrebna poduzeća i obrti`;
}

/**
 * `nationalCoverageClaim`, `cityCount`, `numberWord` and `NUMBER_WORD` stood
 * here and were deleted on 2026-09-14, when the landing page's note under the
 * city list was removed (project owner). It was their only call site.
 *
 * Two things worth keeping out of the diff:
 *
 * 1. **`grad` needs the full three-way numeral rule that `pogrebnik` does
 *    not** — 2–4 take `grada` and 5+ take `gradova`, where `pogrebnika` serves
 *    both, with 11–14 behaving like 5+. `providerCountLabel` below documents
 *    why its own two-branch version is not the general rule; this is the
 *    counter-example it names.
 * 2. **Croatian spells numbers out to twenty and uses digits past that**, which
 *    is ordinary typographic practice rather than a house style.
 */

/**
 * Five counting helpers lived here and were removed on 2026-09-07:
 * `providerCount`, `providerNoun`, `capitalise`, `verbForm` and `countOfTotal`.
 *
 * They existed to put exact provider counts into Croatian sentences —
 * "šest pogrebnika nudi", "svih sedam" — and every one of their call sites was
 * rewritten when exact counts came out of customer-facing prose. `verbForm` is
 * the one worth remembering rather than the code: **Croatian verb agreement
 * after a numeral is not singular-vs-plural** — 2–4 take the plural form and
 * 5+ take the singular, with 11–14 behaving like 5+. `providerShare` below
 * avoids the trap by construction rather than by handling it.
 *
 * **One of the five is back, narrowly, as `providerCountLabel` below** (project
 * owner, 2026-09-14). The others stay gone: nothing needs a count *inside a
 * sentence*, which is what made them expensive.
 */

/**
 * "20 pogrebnika", "1 pogrebnik" — a bare count for the landing page's city
 * list, and the only exact provider count in the product outside `· N` on a
 * results heading.
 *
 * **The project owner reversed the 2026-09-07 rule for this one position on
 * 2026-09-14.** The reversal is narrower than it sounds, and the narrowness is
 * the point: the objection recorded under `providerShare` was to counts *in
 * prose* — a sentence the reader has to do arithmetic on before it means
 * anything, and which goes stale the moment either number moves. A figure in a
 * column beside a link is not that sentence. It answers "how much is there in
 * my town" at a glance, it needs no verb to agree with it, and the reader can
 * click through and count them.
 *
 * So the rule now reads: **counts are out of sentences, not out of the
 * product.** `providerShare` and `providerFloor` still own every prose
 * position and nothing there changed.
 *
 * ## The agreement rule, which is why this is a function and not a template
 *
 * Croatian numerals take a case, not a plural. For *pogrebnik*:
 *
 * - **ends in 1, but not 11** → nominative singular, `pogrebnik` (1, 21, 101)
 * - **everything else** → `pogrebnika` (2, 5, 11, 13, 20, 111)
 *
 * The usual three-way trap — 1 / 2–4 / 5+ — collapses to two here **only
 * because this noun's genitive singular and genitive plural are the same
 * word**. `pogrebnika` serves both 2–4 and 5+. That is a fact about
 * *pogrebnik*, not about Croatian: swap the noun to `grad` and the third branch
 * reappears, because 2–4 take `grada` and 5+ take `gradova`. **Do not
 * generalise this function to another noun without adding that branch back.**
 *
 * Today every city returns `pogrebnika` — no count ends in 1 — so the first
 * branch is unexercised by the live data and is covered by tests instead. It
 * starts mattering the day a city reaches 21.
 */
export function providerCountLabel(n: number): string {
  const noun = n % 10 === 1 && n % 100 !== 11 ? 'pogrebnik' : 'pogrebnika';
  return `${n} ${noun}`;
}

/**
 * A share of the providers, worded rather than counted — "većina pogrebnika",
 * "gotovo svaki pogrebnik", "manji dio pogrebnika".
 *
 * **Exact provider counts are out of customer-facing prose** (project owner,
 * 2026-09-07). Two reasons, and only the first is about maintenance:
 *
 * 1. **A sentence built from two live counts is a sentence that has to be
 *    re-read every time the data changes.** "Od pedeset i jednog pogrebnika na
 *    popisu, njih trideset i dva navode…" is arithmetic the reader has to do
 *    before it means anything, and it was correct for exactly as long as both
 *    numbers held.
 * 2. **The proportion is the fact; the count is trivia.** A family wants to
 *    know whether asking for something is normal or unusual. "Većina" answers
 *    that. "Trideset i dva" makes them divide.
 *
 * Still derived from live rows, never asserted — the *word* changes when the
 * data does, so this is not a hedge, it is the same fact at the right
 * resolution.
 *
 * **Every phrase returned takes a singular verb**, which is deliberate:
 * Croatian agreement after a numeral is a trap (2–4 plural, 5+ singular, 11–14
 * back to singular — see the note above), and picking share words that are all
 * grammatically singular removes the trap instead of routing around it. So
 * `svi pogrebnici` is never returned; `svaki pogrebnik` says the same thing and
 * agrees with `nudi`.
 *
 * Returns **null when nobody offers it**, because that sentence needs a negated
 * verb and a different shape — the caller omits the clause instead.
 */
export function providerShare(part: number, total: number): string | null {
  if (part <= 0 || total <= 0) return null;
  if (part === total) return 'svaki pogrebnik';
  if (part === 1) return 'samo jedan pogrebnik';

  const ratio = part / total;
  if (ratio >= 0.75) return 'gotovo svaki pogrebnik';
  if (ratio > 0.5) return 'većina pogrebnika';
  if (ratio === 0.5) return 'polovina pogrebnika';
  if (ratio >= 0.25) return 'manji dio pogrebnika';
  return 'malo pogrebnika';
}

/**
 * "više od 50" — a floor, for the one place a national scale claim earns its
 * keep.
 *
 * Rounded **down to the previous ten below the true count**, so the claim is
 * true when written and stays true as providers are added: at 51 it says 50, at
 * 60 it still says 50, at 61 it says 60. A claim that can only become more true
 * is one nobody has to maintain — which is the difference between this and the
 * exact counts it replaces.
 *
 * Returns null below the first threshold, where "više od 10" would be a
 * smaller-sounding claim than saying nothing.
 */
export function providerFloor(n: number): string | null {
  if (n < 20) return null;
  return `više od ${Math.floor((n - 1) / 10) * 10}`;
}
