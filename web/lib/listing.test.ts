import { describe, expect, it } from 'vitest';
import { SPLIT_PILOT } from './__fixtures__/split-pilot';
import {
  FILTERS,
  FILTERS_MIN_PROVIDERS,
  applyFilters,
  filterCounts,
  filtersAvailable,
  orderProviders,
  type Filter,
} from './listing';
import type { Provider } from './queries';

const names = (list: Provider[]) => list.map((p) => p.name);
const slugs = (list: Provider[]) => list.map((p) => p.slug);

const bySlug = (slug: string): Provider => {
  const p = SPLIT_PILOT.find((x) => x.slug === slug);
  if (!p) throw new Error(`fixture has no provider "${slug}"`);
  return p;
};

describe('orderProviders', () => {
  it('returns every provider, always', () => {
    const ordered = orderProviders(SPLIT_PILOT);
    expect(ordered).toHaveLength(SPLIT_PILOT.length);
    expect([...slugs(ordered)].sort()).toEqual([...SPLIT_PILOT.map((p) => p.slug)].sort());
  });

  it('is alphabetical, collated for Croatian rather than by code point', () => {
    // The point of the `hr` collator: Č, Ć, Š, Ž and Đ sort in place rather
    // than after Z. A naive sort would put "Čagalj" after "Tonkić".
    const ordered = names(orderProviders(SPLIT_PILOT));
    expect(ordered).toEqual([...ordered].sort(new Intl.Collator('hr').compare));

    const sample = ['Žanić', 'Čagalj', 'Tonkić', 'Aničić', 'Šarić'];
    const collated = [...sample].sort(new Intl.Collator('hr').compare);
    expect(collated).toEqual(['Aničić', 'Čagalj', 'Šarić', 'Tonkić', 'Žanić']);
    expect(collated).not.toEqual([...sample].sort());
  });

  it('does not mutate its input — the page renders the array it was given', () => {
    const before = slugs(SPLIT_PILOT);
    orderProviders(SPLIT_PILOT, true);
    expect(slugs(SPLIT_PILOT)).toEqual(before);
  });

  it('is stable across input order — the shareable URL guarantee', () => {
    const a = orderProviders(SPLIT_PILOT);
    const b = orderProviders([...SPLIT_PILOT].reverse());
    expect(slugs(a)).toEqual(slugs(b));
  });

  it('does not order on record completeness, which was the whole problem', () => {
    // The old comparator sorted on how many actionable facts we had collected,
    // which ranked providers by how thoroughly *we* had researched them. In
    // Zagreb eight tied on it and the alphabet decided a heading that claimed
    // to be a judgement. Stripping a provider's contact data must not move it.
    const gutted = SPLIT_PILOT.map((p) =>
      p.slug === 'zec' ? { ...p, email: null, website: null, working_hours: null } : p,
    );
    expect(slugs(orderProviders(gutted))).toEqual(slugs(orderProviders(SPLIT_PILOT)));
  });

  describe('availabilityFirst — the reader\'s instruction, not ours', () => {
    it('is off by default, so we never reorder on our own initiative', () => {
      expect(slugs(orderProviders(SPLIT_PILOT))).toEqual(
        slugs(orderProviders(SPLIT_PILOT, false)),
      );
    });

    it('puts every 24/7 provider above every other one', () => {
      const ordered = orderProviders(SPLIT_PILOT, true);
      const lastAvailable = ordered.findLastIndex((p) => p.available_24_7);
      const firstUnavailable = ordered.findIndex((p) => !p.available_24_7);
      expect(lastAvailable).toBeLessThan(firstUnavailable);
    });

    it('stays alphabetical inside each group', () => {
      const ordered = orderProviders(SPLIT_PILOT, true);
      const open = names(ordered.filter((p) => p.available_24_7));
      const rest = names(ordered.filter((p) => !p.available_24_7));
      const hr = new Intl.Collator('hr').compare;
      expect(open).toEqual([...open].sort(hr));
      expect(rest).toEqual([...rest].sort(hr));
    });

    it('still returns everyone — it sorts, it does not filter', () => {
      expect(orderProviders(SPLIT_PILOT, true)).toHaveLength(SPLIT_PILOT.length);
    });
  });
});

describe('applyFilters', () => {
  it('returns everyone when nothing is active', () => {
    expect(applyFilters(SPLIT_PILOT, [])).toHaveLength(SPLIT_PILOT.length);
  });

  it('filters on cremation', () => {
    const matching = applyFilters(SPLIT_PILOT, ['kremiranje']);
    expect(matching).toHaveLength(4);
    for (const p of matching) {
      expect(p.services.some((s) => s.slug === 'kremiranje')).toBe(true);
    }
  });

  it('is conjunctive — a provider must satisfy every active filter', () => {
    const both = applyFilters(SPLIT_PILOT, ['kremiranje', 'inozemstvo']);
    const krem = applyFilters(SPLIT_PILOT, ['kremiranje']);
    expect(both.length).toBeLessThanOrEqual(krem.length);
    for (const p of both) {
      expect(p.services.some((s) => s.slug === 'kremiranje')).toBe(true);
      expect(p.services.some((s) => s.slug === 'prijevoz-pokojnika-inozemstvo')).toBe(true);
    }
  });

  it('is monotone — adding a filter never widens the result', () => {
    let previous = applyFilters(SPLIT_PILOT, []).length;
    const active: Filter[] = [];
    for (const f of FILTERS) {
      active.push(f);
      const n = applyFilters(SPLIT_PILOT, active).length;
      expect(n).toBeLessThanOrEqual(previous);
      previous = n;
    }
  });

  it('is order-independent — AND is commutative', () => {
    const a = slugs(applyFilters(SPLIT_PILOT, ['kremiranje', 'inozemstvo']));
    const b = slugs(applyFilters(SPLIT_PILOT, ['inozemstvo', 'kremiranje']));
    expect(a).toEqual(b);
  });

  it('can match nobody, which is why the empty view exists', () => {
    const noCremation = SPLIT_PILOT.map((p) => ({
      ...p,
      services: p.services.filter((s) => s.slug !== 'kremiranje'),
    }));
    expect(applyFilters(noCremation, ['kremiranje'])).toHaveLength(0);
  });

  it('excludes a provider with no service rows from every filter', () => {
    // 8 of 55 live providers have none, 5 of them in Zagreb. A filter is a
    // claim about our data, not about the market, and this is where that bites.
    const blank = { ...bySlug('zec'), services: [] };
    for (const f of FILTERS) {
      expect(applyFilters([blank], [f])).toHaveLength(0);
    }
    expect(applyFilters([blank], [])).toHaveLength(1);
  });
});

describe('filterCounts', () => {
  it('reports each filter as it would stand alone when nothing is ticked', () => {
    const counts = filterCounts(SPLIT_PILOT, []);
    expect(counts.kremiranje).toBe(applyFilters(SPLIT_PILOT, ['kremiranje']).length);
    expect(counts.inozemstvo).toBe(applyFilters(SPLIT_PILOT, ['inozemstvo']).length);
  });

  it('is conditional on what is already ticked, never a per-city total', () => {
    // The fragility this exists for: Zagreb's three filters stand at 5, 7 and
    // 3 individually and at one together. Unconditional counts would show
    // three reassuring numbers on the way to a list of one.
    const alone = filterCounts(SPLIT_PILOT, []).inozemstvo;
    const withCremation = filterCounts(SPLIT_PILOT, ['kremiranje']).inozemstvo;
    expect(withCremation).toBe(
      applyFilters(SPLIT_PILOT, ['kremiranje', 'inozemstvo']).length,
    );
    expect(withCremation).toBeLessThanOrEqual(alone);
  });

  it('reports an active filter as the current result size', () => {
    const active: Filter[] = ['kremiranje'];
    expect(filterCounts(SPLIT_PILOT, active).kremiranje).toBe(
      applyFilters(SPLIT_PILOT, active).length,
    );
  });

  it('never advertises a count the reader cannot reach', () => {
    // Every number on screen equals the size of the list that tapping it
    // produces. That is what makes the interactive path to an empty result
    // impossible: you always see the destination first.
    for (const active of [[], ['kremiranje'], ['inozemstvo', 'dokumentacija']] as Filter[][]) {
      const counts = filterCounts(SPLIT_PILOT, active);
      for (const f of FILTERS) {
        const next = active.includes(f) ? active : [...active, f];
        expect(counts[f]).toBe(applyFilters(SPLIT_PILOT, next).length);
      }
    }
  });
});

describe('filtersAvailable — the size threshold', () => {
  it('needs more than six providers, which is what fits on one phone screen', () => {
    expect(FILTERS_MIN_PROVIDERS).toBe(7);
    expect(filtersAvailable(6)).toBe(false);
    expect(filtersAvailable(7)).toBe(true);
  });

  it('excludes the seven-provider Split pilot fixture only just', () => {
    // The fixture is the original pilot; live Split is 13 and does get filters.
    expect(filtersAvailable(SPLIT_PILOT.length)).toBe(SPLIT_PILOT.length >= 7);
  });

  it('is the rule that keeps an empty result off the small city pages', () => {
    // Measured 2026-09-24: 28 of 63 city × combination pairs return nothing,
    // and every one is in a city at or below the threshold. Zadar has no
    // cremation provider at all, so one tap would have emptied it.
    expect(filtersAvailable(4)).toBe(false); // Zadar, Slavonski Brod
    expect(filtersAvailable(2)).toBe(false); // Pula, Dubrovnik
    expect(filtersAvailable(17)).toBe(true); // Zagreb
    expect(filtersAvailable(13)).toBe(true); // Split
  });
});
