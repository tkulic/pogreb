import type { Provider } from './queries';

/**
 * Listing order and the city-page filters.
 *
 * **Nothing here ranks.** Removed on 2026-09-24, as a principle rather than a
 * tuning decision (SPEC_frontend.md → Order and filtering). The short version:
 * 16 of 19 search clicks land on a city page with no flow answers, and with no
 * answers the old comparator fell through to record completeness and then the
 * alphabet — so `NAJBOLJE ODGOVARA` meant "the ones we researched most
 * thoroughly, A–Z". In Zagreb eight providers tied on completeness and the
 * shortlist cut fell inside that tie, which made the alphabet the deciding
 * term on a heading that claimed to be a judgement.
 *
 * What replaced it: **one list, alphabetical, everyone visible**, narrowed by
 * filters the family sets and re-ordered only if the family asks. A filter
 * states a fact about a provider ("offers cremation") rather than a verdict
 * about them, which is why it needs no methodology page and survives the
 * conversation a ranking cannot.
 *
 * Everything here is a **pure function over the array `getCityProviders`
 * returns** — no database access, no dates, no randomness. The reason line and
 * its two clause functions were deleted with the gold annotation on
 * 2026-09-24; they had stopped firing in the city where they were needed most
 * (2 of 17 in Zagreb, because the rare-service rule cannot trigger in a large
 * list), and the card had no room for them once it became a row.
 */

export type Situacija = 'preminuo' | 'posljednji-dani' | 'planiranje';
export type Nacin = 'kremiranje' | 'ukop';

export type Answers = {
  /**
   * Drives the guidance strip only. It **never filtered and no longer sorts** —
   * urgency was a ranking term, and ranking is gone. A family that wants
   * someone reachable tonight ticks *Prvo prikaži dostupne 0–24*, which is
   * their instruction rather than our opinion.
   */
  situacija?: Situacija;
  /**
   * Screen 3's answer. On the results page it is translated into the
   * `kremiranje` filter by `resultsHref`; `ukop` translates to nothing,
   * because every provider does burials and there is no `ukop` service row.
   */
  nacin?: Nacin;
};

/* --------------------------------------------------------------------------
   Filters
   -------------------------------------------------------------------------- */

/**
 * The three filters a city page offers.
 *
 * **Measured, not chosen.** Across all nine cities these are the only services
 * that both split a list and name a real fork in a family's situation. Several
 * others split just as evenly — `osmrtnice` and `cvjetni-aranzmani` sit at the
 * top of that table — and nobody on earth picks a funeral director because
 * they print death notices. That is the same distinction
 * `REASON_ELIGIBLE_SERVICES` used to encode for the reason line.
 */
export type Filter = 'kremiranje' | 'inozemstvo' | 'dokumentacija';

export const FILTERS: readonly Filter[] = ['kremiranje', 'inozemstvo', 'dokumentacija'];

/** Which `services.slug` each filter tests for. */
const FILTER_SERVICE: Record<Filter, string> = {
  kremiranje: 'kremiranje',
  inozemstvo: 'prijevoz-pokojnika-inozemstvo',
  dokumentacija: 'sredivanje-dokumentacije',
};

/**
 * A city needs **more than this many providers** before it offers filters at
 * all.
 *
 * Six is what fits on a medium phone screen at the current row height, and
 * that is the whole argument: **filters exist because the list is too long to
 * scan, and a list you can see all of is not too long.** Today that means
 * Zagreb (17) and Split (13) and nowhere else.
 *
 * **It also closes the empty-result hole, which is why it is a rule rather
 * than a preference.** Measured against the live data on 2026-09-24, 28 of the
 * 63 city × filter-combination pairs return nothing — and every one of them is
 * in a city at or below this threshold. Zadar has no cremation provider at
 * all, so one tap on the most-wanted filter would have emptied a page that had
 * just shown four providers; Pula and Dubrovnik return nothing for all three
 * filters and all four combinations. Zagreb and Split return nothing for none
 * of the eight. So the cheap rule and the safe rule are the same rule.
 *
 * The per-chip alternative — hide a filter wherever its count is zero — needed
 * three conditional counts and a disabled state, and would still not have
 * covered a filter arriving by URL.
 */
export const FILTERS_MIN_PROVIDERS = 7;

/** Does this city's list justify filters at all? */
export function filtersAvailable(providerCount: number): boolean {
  return providerCount >= FILTERS_MIN_PROVIDERS;
}

function offers(p: Provider, filter: Filter): boolean {
  return p.services.some((s) => s.slug === FILTER_SERVICE[filter]);
}

/**
 * Apply the active filters. **Conjunctive**: a provider must satisfy every
 * one, which is what makes the counts monotone and the interaction
 * predictable.
 */
export function applyFilters(
  providers: Provider[],
  active: readonly Filter[],
): Provider[] {
  if (active.length === 0) return providers;
  return providers.filter((p) => active.every((f) => offers(p, f)));
}

/**
 * What each filter's count would be **given what is already ticked**.
 *
 * **Conditional, never per-city totals**, and the difference is not academic.
 * Zagreb's three filters stand at 5, 7 and 3 — all healthy — while all three
 * together match exactly **one** provider. Unconditional counts would show
 * three reassuring numbers on the way to a list of one, and after a single
 * curation pass, to a list of none. Counting against the current selection is
 * correct by construction: every state a reader can reach was reached through
 * a number they could see first.
 */
export function filterCounts(
  providers: Provider[],
  active: readonly Filter[],
): Record<Filter, number> {
  const counts = {} as Record<Filter, number>;
  for (const f of FILTERS) {
    const next = active.includes(f) ? active : [...active, f];
    counts[f] = applyFilters(providers, next).length;
  }
  return counts;
}

/* --------------------------------------------------------------------------
   Order
   -------------------------------------------------------------------------- */

/**
 * Croatian collation. Č, Ć, Š, Ž and Đ sort in their proper places rather
 * than falling to the end of the alphabet, which is what a plain
 * `String.prototype.localeCompare` with no locale would do.
 */
const collator = new Intl.Collator('hr');

/**
 * The city's providers, in the order the page renders them.
 *
 * **Alphabetical, and that is the default and the whole rule.** It is the one
 * order that makes no claim: a reader recognises it instantly, a provider
 * cannot be told they placed badly, and nobody has to be shown a page
 * explaining it.
 *
 * `availabilityFirst` puts round-the-clock providers above the rest,
 * alphabetically within each group. **A sort the reader picks is not a
 * ranking** — it is off by default and we never turn it on for them, so the
 * answer to "why is that business above mine" stays *"because the family asked
 * for 0–24, and you have not told us you are"*: checkable, and fixable by the
 * provider. That is what the old urgency term could not say for itself.
 *
 * Deliberately not ordering terms, each for a reason worth keeping:
 * **`events` counts** (ranking on them makes the metric self-fulfilling and
 * destroys its value as evidence), **anything paid** (nothing is charged in
 * Phase 1, and the neutrality claim is a promise), **random or rotating order**
 * (it breaks the shareable-URL guarantee and cannot be statically rendered at
 * all), **price** (no provider publishes one), and **record completeness** —
 * which is how the old comparator came to sort providers by how thoroughly
 * *we* had researched them.
 */
export function orderProviders(
  providers: Provider[],
  availabilityFirst = false,
): Provider[] {
  return [...providers].sort((a, b) => {
    if (availabilityFirst && a.available_24_7 !== b.available_24_7) {
      return a.available_24_7 ? -1 : 1;
    }
    return collator.compare(a.name, b.name);
  });
}
