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
      'Velika Gorica',
      'Zaprešić',
      'Samobor',
      'Sesvete',
      'Dugo Selo',
      'Lučko',
      'Velika Mlaka',
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
 * `providerShare`. The one survivor is `· N` on a results section heading,
 * which counts the cards below it rather than the market.
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
 */
export function coverageClaim(areaLocative: string): string {
  return `Svi registrirani pogrebnici u ${areaLocative}`;
}

/**
 * The same claim, for the landing page, which is no longer about one city.
 *
 * The city expansion broke the single-city landing page: with seven cities
 * there is no "the" area to name, and naming one of them would be arbitrary.
 * So the landing claim counts **cities** rather than providers.
 *
 * That is not a retreat from "coverage, not a count" — it is the same rule
 * applied to a different subject. The objection to "sedam pogrebnika" was that
 * a stranger reads it as the size of our database rather than the size of the
 * market. A city count says something else entirely: it is the size of the
 * *product*, which is exactly what a visitor is trying to establish, and it
 * grows in a direction that is unambiguously good news. The per-city coverage
 * claim above is unchanged and still carries the completeness promise on the
 * page where it can actually be checked.
 *
 * Derived from the live row count, never written as a word, so it cannot go
 * stale the way "u sedam gradova" in hand-written copy would.
 */
export function nationalCoverageClaim(cities: number): string {
  return `Svi registrirani pogrebnici u ${cityCount(cities)}`;
}

/**
 * "sedam gradova", "dva grada", "jedan grad".
 *
 * `grad` needs the full three-way rule that `pogrebnik` did not: 2–4 take
 * `grada` and 5+ take `gradova`, where `pogrebnika` served both. 11–14 are the
 * standard exception and behave like 5+.
 */
function cityCount(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  const teen = lastTwo >= 11 && lastTwo <= 14;
  const noun = teen
    ? 'gradova'
    : last === 1
      ? 'grad'
      : last >= 2 && last <= 4
        ? 'grada'
        : 'gradova';
  return `${numberWord(n)} ${noun}`;
}

/**
 * Croatian number words, for the context strip's count.
 *
 * Spelled out to twenty and then numeric, which is ordinary Croatian
 * typographic practice and keeps "Sedam pogrebnika" reading as a sentence
 * rather than a statistic. The pilot will not exceed twenty for a long time;
 * past that the digit is correct anyway.
 */
const NUMBER_WORD = [
  'nula', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam',
  'devet', 'deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest',
  'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest', 'dvadeset',
];

function numberWord(n: number): string {
  return n >= 0 && n < NUMBER_WORD.length ? NUMBER_WORD[n] : String(n);
}

/**
 * Five counting helpers lived here and are gone as of 2026-09-07:
 * `providerCount`, `providerNoun`, `capitalise`, `verbForm` and `countOfTotal`.
 *
 * They existed to put exact provider counts into Croatian sentences —
 * "šest pogrebnika nudi", "svih sedam" — and every one of their call sites was
 * rewritten when exact counts came out of customer-facing prose. `verbForm` is
 * the one worth remembering rather than the code: **Croatian verb agreement
 * after a numeral is not singular-vs-plural** — 2–4 take the plural form and
 * 5+ take the singular, with 11–14 behaving like 5+. `providerShare` below
 * avoids the trap by construction rather than by handling it.
 */

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
