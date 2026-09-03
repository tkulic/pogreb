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
 *    null for all seven providers and `cities` has no coordinates, so "blizu
 *    vas" or "5 km" would be unsupported by any data we hold.
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
};

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
  const last = n % 10;
  const lastTwo = n % 100;
  const singular = last === 1 && lastTwo !== 11;
  return `${numberWord(n)} ${singular ? 'pogrebnik' : 'pogrebnika'}`;
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
