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
 * the size of the market. Coverage is the claim; the count is a detail, and it
 * still appears where it does real work (a service page's "šest od sedam", the
 * `· N` on a section heading).
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
export function cityCount(n: number): string {
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

export function numberWord(n: number): string {
  return n >= 0 && n < NUMBER_WORD.length ? NUMBER_WORD[n] : String(n);
}

/**
 * "sedam pogrebnika", "jedan pogrebnik".
 *
 * Croatian counts by the last digit, with 11–14 as an exception. For this noun
 * the 2–4 and 5+ forms coincide (`pogrebnika`), so only the singular needs
 * separating — but the full rule is written out because the next noun that
 * needs this will not be so forgiving.
 */
export function providerCount(n: number): string {
  return `${numberWord(n)} ${providerNoun(n)}`;
}

/**
 * Just the noun, for the places that want the digit rather than the word.
 *
 * A scannable list — the landing page's city grid — reads better as "20
 * pogrebnika" than "dvadeset pogrebnika": the word form is for sentence flow,
 * and a column of spelled-out numbers cannot be compared at a glance, which is
 * the only reason that column exists.
 */
export function providerNoun(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  const singular = last === 1 && lastTwo !== 11;
  return singular ? 'pogrebnik' : 'pogrebnika';
}

/** Sentence-cases a count phrase for the start of the context strip. */
export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Croatian verb agreement after a numeral.
 *
 * The rule is not "singular vs plural" in the English sense: **2–4 take the
 * plural form, and 5 and above take the singular** — "četiri pogrebnika nude",
 * but "šest pogrebnika nudi". 11–14 are the standard exception and behave like
 * 5+, which is why this keys on the last two digits as well as the last one.
 *
 * Worth a helper rather than a hardcoded word: these counts come from live
 * data, so the correct form changes as providers are added.
 */
export function verbForm(n: number, plural: string, singular: string): string {
  const last = n % 10;
  const lastTwo = n % 100;
  const takesPlural = last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14);
  return takesPlural ? plural : singular;
}

/**
 * "šest" — or "svih sedam" when the count is every provider there is.
 *
 * Saying "sedam" when the total is also seven reads as a coincidence; "svih
 * sedam" states the fact that matters, which is that nobody is excluded.
 */
export function countOfTotal(n: number, total: number): string {
  return n === total ? `svih ${numberWord(total)}` : numberWord(n);
}
