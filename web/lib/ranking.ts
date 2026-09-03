import type { Provider } from './queries';
import {
  REASON_ELIGIBLE_SERVICES,
  SERVICE_SHORT_PHRASE,
  canonicalIndex,
} from './services';

/**
 * Ranking, the block partition and the reason line.
 *
 * Everything here is a **pure function over the array `getCityProviders`
 * returns** — no database access, no dates, no randomness. That is what makes
 * it unit-testable and what keeps the rules in one readable place instead of
 * spread across SQL. SPEC_frontend.md → Ranking rules is the source of truth;
 * this file implements it and nothing more.
 */

export type Situacija = 'preminuo' | 'posljednji-dani' | 'planiranje';
export type Nacin = 'kremiranje' | 'ukop';

export type Answers = {
  situacija?: Situacija;
  /**
   * `ukop` filters nothing and is *not* a bug: all 7 providers do burials,
   * `organizacija-pogreba` is universal, and there is no `ukop` service row.
   * `ukop` and an unanswered question therefore produce an identical list —
   * what differs is the reason lines and the copy. Do not "fix" this by
   * inventing a service row.
   */
  nacin?: Nacin;
};

export type RankedProvider = {
  provider: Provider;
  /** Satisfies every selected criterion. Drives the block partition. */
  matches: boolean;
  /** Null when no clause could be composed — such a card cannot be shortlisted. */
  reason: string | null;
};

export type Partitioned = {
  /** At most 4, every one carrying a reason line. */
  shortlist: RankedProvider[];
  /** Everyone else, in ranking order. The two blocks partition the set. */
  others: RankedProvider[];
  /**
   * True when a filter was selected and nothing matched it. The shortlist
   * block is then omitted entirely and the page says so, rather than
   * rendering an empty heading.
   */
  noMatches: boolean;
};

/** The cap that makes it a shortlist rather than a re-sorted list. */
const SHORTLIST_CAP = 4;

/** A service is "rare" in a city when at most this many providers offer it. */
const RARE_THRESHOLD = 2;

/**
 * Croatian collation. Č, Ć, Š, Ž and Đ sort in their proper places rather
 * than falling to the end of the alphabet, which is what a plain
 * `String.prototype.localeCompare` with no locale would do.
 */
const collator = new Intl.Collator('hr');

function hasEmergencyPhone(p: Provider): boolean {
  return (p.phones ?? []).some((phone) => phone.type === 'emergency');
}

/** How many providers in this city offer each service slug. */
export function serviceFrequency(providers: Provider[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of providers) {
    for (const s of p.services) {
      counts.set(s.slug, (counts.get(s.slug) ?? 0) + 1);
    }
  }
  return counts;
}

/** Does this provider satisfy every selected criterion? */
export function matchesCriteria(p: Provider, answers: Answers): boolean {
  // The only filtering question in the flow. Everything else — `ukop`,
  // `situacija`, `pokojnik`, and every unanswered question — matches
  // everything by design.
  if (answers.nacin === 'kremiranje') {
    return p.services.some((s) => s.slug === 'kremiranje');
  }
  return true;
}

/**
 * Record completeness: one point each for facts that make a listing
 * actionable.
 *
 * **Caveat, kept visible because it is real:** this ranks providers partly by
 * how thoroughly *we* researched them, not by anything they did. It sits last
 * of the substantive terms for that reason, and the remedy is to complete the
 * data rather than to reweight it. If a provider ever complains about their
 * position, this is the term they would be right about.
 */
export function completenessScore(p: Provider): number {
  const phones = p.phones ?? [];
  let score = 0;
  if (phones.length > 0) score += 1;
  if (phones.some((ph) => ph.type === 'emergency' || ph.type === 'mobile')) score += 1;
  if (p.working_hours) score += 1;
  if (p.email) score += 1;
  if (p.website) score += 1;
  if (p.services.length >= 5) score += 1;
  return score;
}

/**
 * Clause 1 — availability.
 *
 * `available_24_7` wins outright; an `emergency` phone is the fallback. Both
 * absent means this clause is omitted rather than softened into something
 * vaguer.
 */
function availabilityClause(p: Provider): string | null {
  if (p.available_24_7) return 'Dostupni 0–24';
  if (hasEmergencyPhone(p)) return 'Dežurna linija';
  return null;
}

/**
 * Clause 2 — the most distinguishing remaining fact. First match wins.
 *
 * The order is not arbitrary: a rare service says something specific about
 * this provider, breadth says something weaker, and a match confirmation says
 * only that the filter did its job. Weakest last.
 */
function distinguishingClause(
  p: Provider,
  providers: Provider[],
  answers: Answers,
  frequency: Map<string, number>,
): string | null {
  // 1. Rarest service this provider offers, among those few enough to
  //    distinguish. Ties break on canonical order, so the output is stable.
  const rare = p.services
    .filter(
      (s) =>
        (frequency.get(s.slug) ?? 0) <= RARE_THRESHOLD &&
        // Rare is necessary, not sufficient: the service also has to be a
        // reason to choose this provider. See REASON_ELIGIBLE_SERVICES.
        REASON_ELIGIBLE_SERVICES.has(s.slug),
    )
    .sort((a, b) => {
      const byRarity =
        (frequency.get(a.slug) ?? 0) - (frequency.get(b.slug) ?? 0);
      if (byRarity !== 0) return byRarity;
      return canonicalIndex(a.slug) - canonicalIndex(b.slug);
    });

  if (rare.length > 0) {
    const phrase = SERVICE_SHORT_PHRASE[rare[0].slug];
    if (phrase) return phrase;
  }

  // 2. Widest range in the city. A strict maximum: if two providers tie on
  //    the most service rows, neither can claim to be the widest.
  const max = Math.max(...providers.map((q) => q.services.length));
  const tiedAtMax = providers.filter((q) => q.services.length === max).length;
  if (tiedAtMax === 1 && p.services.length === max) {
    return 'najveći izbor usluga';
  }

  // 3. Match confirmation — the weakest thing worth saying.
  if (answers.nacin === 'kremiranje' && p.services.some((s) => s.slug === 'kremiranje')) {
    return 'nudi kremiranje';
  }

  return null;
}

/**
 * The reason line: at most two clauses joined by `·`, composed from stored
 * facts only. Null when neither clause can be composed.
 *
 * Mandatory on every shortlist card — it is the difference between a
 * justified shortlist and an opaque ranking, and opacity is exactly what makes
 * the German portals read as brokers. A card that cannot say why it is in the
 * shortlist does not belong there, so a null here removes it.
 */
export function reasonLine(
  p: Provider,
  providers: Provider[],
  answers: Answers,
  frequency: Map<string, number> = serviceFrequency(providers),
): string | null {
  const clauses = [
    availabilityClause(p),
    distinguishingClause(p, providers, answers, frequency),
  ].filter((c): c is string => c !== null);

  return clauses.length > 0 ? clauses.join(' · ') : null;
}

/**
 * Sort comparator implementing SPEC_frontend.md → Ranking rules, in order:
 * criteria match, urgency (only on `preminuo`), completeness, then name.
 *
 * Deliberately absent, and each for a reason worth keeping: `events` click
 * counts (ranking on them makes the metric self-fulfilling and destroys its
 * value as evidence), anything paid (nothing is charged in Phase 1 and the
 * transparency footer is a promise), random or rotating order (it would break
 * the shareable-URL guarantee), and price (no pilot provider publishes one).
 */
function compare(a: RankedProvider, b: RankedProvider, answers: Answers): number {
  // 1. Criteria match — this is what produces the block partition.
  if (a.matches !== b.matches) return a.matches ? -1 : 1;

  // 2. Urgency, only when someone has died. On the other two paths a dežurni
  //    line is not what distinguishes a good choice.
  if (answers.situacija === 'preminuo') {
    if (a.provider.available_24_7 !== b.provider.available_24_7) {
      return a.provider.available_24_7 ? -1 : 1;
    }
    const aEmergency = hasEmergencyPhone(a.provider);
    const bEmergency = hasEmergencyPhone(b.provider);
    if (aEmergency !== bEmergency) return aEmergency ? -1 : 1;
  }

  // 3. Record completeness.
  const byCompleteness =
    completenessScore(b.provider) - completenessScore(a.provider);
  if (byCompleteness !== 0) return byCompleteness;

  // 4. Name, A–Z, collated for Croatian.
  return collator.compare(a.provider.name, b.provider.name);
}

/**
 * Rank a city's providers and split them into the two blocks.
 *
 * Guarantees this function is responsible for, per SPEC_frontend.md:
 * every provider in the city appears in the result, always — the two blocks
 * partition the set and never subset it.
 */
export function rankProviders(
  providers: Provider[],
  answers: Answers,
): Partitioned {
  const frequency = serviceFrequency(providers);

  const ranked: RankedProvider[] = providers
    .map((provider) => ({
      provider,
      matches: matchesCriteria(provider, answers),
      reason: reasonLine(provider, providers, answers, frequency),
    }))
    .sort((a, b) => compare(a, b, answers));

  const matching = ranked.filter((r) => r.matches);

  // Unreachable with current pilot data — the only filter is `kremiranje` and
  // four providers offer it — so this is a defensive branch, not a live case.
  if (matching.length === 0) {
    return { shortlist: [], others: ranked, noMatches: true };
  }

  // A card that cannot say why it is in the shortlist does not belong there.
  const shortlistable = matching.filter((r) => r.reason !== null);
  const shortlist = shortlistable.slice(0, SHORTLIST_CAP);

  const shortlisted = new Set(shortlist.map((r) => r.provider.id));
  const others = ranked.filter((r) => !shortlisted.has(r.provider.id));

  return { shortlist, others, noMatches: false };
}
