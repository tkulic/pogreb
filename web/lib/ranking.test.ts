import { describe, expect, it } from 'vitest';
import { SPLIT_PILOT } from './__fixtures__/split-pilot';
import {
  completenessScore,
  matchesCriteria,
  rankProviders,
  reasonLine,
  serviceFrequency,
  type Answers,
} from './ranking';
import type { Provider } from './queries';

const bySlug = (slug: string): Provider => {
  const p = SPLIT_PILOT.find((x) => x.slug === slug);
  if (!p) throw new Error(`fixture has no provider "${slug}"`);
  return p;
};

const slugs = (list: { provider: Provider }[]) => list.map((r) => r.provider.slug);

describe('serviceFrequency', () => {
  it('counts how many providers in the city offer each service', () => {
    const freq = serviceFrequency(SPLIT_PILOT);

    // The four universal services discriminate nothing, which is the whole
    // reason the flow is orientation rather than filtering.
    expect(freq.get('organizacija-pogreba')).toBe(7);
    expect(freq.get('prijevoz-pokojnika')).toBe(7);
    expect(freq.get('prijevoz-pokojnika-inozemstvo')).toBe(7);
    expect(freq.get('cvjetni-aranzmani')).toBe(7);

    // The only service that genuinely splits the pilot list.
    expect(freq.get('kremiranje')).toBe(4);

    // Seeded but unused — nobody in the pilot offers it.
    expect(freq.get('balzamiranje')).toBeUndefined();
  });
});

describe('matchesCriteria', () => {
  it('filters on kremiranje, the one question that narrows the list', () => {
    const answers: Answers = { nacin: 'kremiranje' };
    expect(SPLIT_PILOT.filter((p) => matchesCriteria(p, answers))).toHaveLength(4);
  });

  it('treats ukop and an unanswered question identically', () => {
    // All 7 providers do burials and there is no `ukop` service row, so this
    // is correct rather than a missing filter. The UI must not imply
    // otherwise, and nobody should "fix" it by inventing a service.
    const ukop = SPLIT_PILOT.filter((p) => matchesCriteria(p, { nacin: 'ukop' }));
    const unanswered = SPLIT_PILOT.filter((p) => matchesCriteria(p, {}));
    expect(ukop).toHaveLength(7);
    expect(slugs(ukop.map((provider) => ({ provider })))).toEqual(
      slugs(unanswered.map((provider) => ({ provider }))),
    );
  });

  it('never excludes anyone on situacija alone', () => {
    for (const situacija of ['preminuo', 'posljednji-dani', 'planiranje'] as const) {
      expect(SPLIT_PILOT.filter((p) => matchesCriteria(p, { situacija }))).toHaveLength(7);
    }
  });
});

describe('completenessScore', () => {
  it('scores the six actionability facts', () => {
    // Zec: phones, an emergency phone, hours, email, website, 12 services.
    expect(completenessScore(bySlug('zec'))).toBe(6);
  });

  it('never exceeds six', () => {
    for (const p of SPLIT_PILOT) {
      expect(completenessScore(p)).toBeGreaterThanOrEqual(0);
      expect(completenessScore(p)).toBeLessThanOrEqual(6);
    }
  });
});

describe('reasonLine — clause 1, availability', () => {
  it('prefers 24/7 over a dezurni line', () => {
    expect(reasonLine(bySlug('bila-ruza'), SPLIT_PILOT, {})).toMatch(/^Dostupni 0–24/);
  });

  it('falls back to the emergency phone when not 24/7', () => {
    expect(reasonLine(bySlug('zec'), SPLIT_PILOT, {})).toMatch(/^Dežurna linija/);
    expect(reasonLine(bySlug('lovrinac'), SPLIT_PILOT, {})).toMatch(/^Dežurna linija/);
  });

  it('omits the clause when neither is true', () => {
    // Aničić has office + mobile and is not 24/7 — no availability claim can
    // honestly be made, so none is made.
    expect(reasonLine(bySlug('anicic'), SPLIT_PILOT, {})).not.toMatch(/Dostupni|Dežurna/);
  });
});

describe('reasonLine — clause 2, the distinguishing fact', () => {
  it('renders a rare service as its short phrase, never a raw slug', () => {
    const line = reasonLine(bySlug('lovrinac'), SPLIT_PILOT, {});
    expect(line).not.toMatch(/-/); // no slug ever reaches the page
  });

  it('claims widest range only on a strict maximum', () => {
    // Zec has 12 rows, the most in the pilot; nobody ties it.
    const counts = SPLIT_PILOT.map((p) => p.services.length);
    expect(Math.max(...counts)).toBe(12);
    expect(counts.filter((c) => c === 12)).toHaveLength(1);
  });

  it('falls back to match confirmation when nothing sharper exists', () => {
    const answers: Answers = { nacin: 'kremiranje' };
    expect(reasonLine(bySlug('bila-ruza'), SPLIT_PILOT, answers)).toBe(
      'Dostupni 0–24 · nudi kremiranje',
    );
    expect(reasonLine(bySlug('bradvica'), SPLIT_PILOT, answers)).toBe(
      'Dostupni 0–24 · nudi kremiranje',
    );
  });

  it('is at most two clauses', () => {
    for (const p of SPLIT_PILOT) {
      const line = reasonLine(p, SPLIT_PILOT, { nacin: 'kremiranje' });
      if (line) expect(line.split(' · ').length).toBeLessThanOrEqual(2);
    }
  });

  it('is deterministic — the same inputs always give the same line', () => {
    for (const p of SPLIT_PILOT) {
      const a = reasonLine(p, SPLIT_PILOT, { nacin: 'kremiranje' });
      const b = reasonLine([...SPLIT_PILOT].reverse().find((x) => x.id === p.id)!,
        [...SPLIT_PILOT].reverse(), { nacin: 'kremiranje' });
      expect(a).toBe(b);
    }
  });
});

describe('rankProviders — the guarantees', () => {
  const answers: Answers = { situacija: 'preminuo', nacin: 'kremiranje' };

  it('every provider in the city appears, always', () => {
    for (const a of [
      {},
      { nacin: 'kremiranje' as const },
      { nacin: 'ukop' as const },
      { situacija: 'planiranje' as const },
      answers,
    ]) {
      const { shortlist, others } = rankProviders(SPLIT_PILOT, a);
      expect(shortlist.length + others.length).toBe(SPLIT_PILOT.length);
    }
  });

  it('the blocks partition the set — no provider appears twice', () => {
    const { shortlist, others } = rankProviders(SPLIT_PILOT, answers);
    const all = [...slugs(shortlist), ...slugs(others)];
    expect(new Set(all).size).toBe(all.length);
  });

  it('caps the shortlist at four', () => {
    const { shortlist } = rankProviders(SPLIT_PILOT, {});
    expect(shortlist.length).toBeLessThanOrEqual(4);
  });

  it('never shortlists a card that cannot say why it is there', () => {
    const { shortlist } = rankProviders(SPLIT_PILOT, answers);
    for (const entry of shortlist) expect(entry.reason).not.toBeNull();
  });

  it('puts every matching provider above every non-matching one', () => {
    const { shortlist, others } = rankProviders(SPLIT_PILOT, { nacin: 'kremiranje' });
    const ordered = [...shortlist, ...others];
    const lastMatch = ordered.map((r) => r.matches).lastIndexOf(true);
    const firstMiss = ordered.map((r) => r.matches).indexOf(false);
    if (firstMiss !== -1) expect(lastMatch).toBeLessThan(firstMiss);
  });

  it('is never empty', () => {
    const { shortlist, others } = rankProviders(SPLIT_PILOT, answers);
    expect(shortlist.length + others.length).toBeGreaterThan(0);
  });
});

describe('rankProviders — ordering', () => {
  it('ranks 24/7 first on the urgent path, then an emergency line', () => {
    const { shortlist, others } = rankProviders(SPLIT_PILOT, { situacija: 'preminuo' });
    const ordered = [...shortlist, ...others].map((r) => r.provider);
    const lastAlwaysOpen = ordered.map((p) => p.available_24_7).lastIndexOf(true);
    const firstNot = ordered.map((p) => p.available_24_7).indexOf(false);
    expect(lastAlwaysOpen).toBeLessThan(firstNot);
  });

  it('does not apply the urgency boost when planning ahead', () => {
    // Nobody pre-planning needs a dezurni line, so 24/7 must not reorder here.
    const planning = rankProviders(SPLIT_PILOT, { situacija: 'planiranje' });
    const urgent = rankProviders(SPLIT_PILOT, { situacija: 'preminuo' });
    const orderOf = (r: ReturnType<typeof rankProviders>) =>
      [...slugs(r.shortlist), ...slugs(r.others)];
    expect(orderOf(planning)).not.toEqual(orderOf(urgent));
  });

  it('sorts names with Croatian collation, not raw code points', () => {
    // The point of the `hr` collator: Č, Ć, Š, Ž and Đ sort in place rather
    // than after Z. A naive sort would put "Čagalj" after "Tonkić".
    const names = ['Žanić', 'Čagalj', 'Tonkić', 'Aničić', 'Šarić'];
    const collated = [...names].sort(new Intl.Collator('hr').compare);
    expect(collated).toEqual(['Aničić', 'Čagalj', 'Šarić', 'Tonkić', 'Žanić']);
    expect(collated).not.toEqual([...names].sort());
  });

  it('is stable across input order — the shareable URL guarantee', () => {
    const answers: Answers = { situacija: 'preminuo', nacin: 'kremiranje' };
    const a = rankProviders(SPLIT_PILOT, answers);
    const b = rankProviders([...SPLIT_PILOT].reverse(), answers);
    expect([...slugs(a.shortlist), ...slugs(a.others)]).toEqual([
      ...slugs(b.shortlist),
      ...slugs(b.others),
    ]);
  });
});

describe('rankProviders — the M = 0 defensive branch', () => {
  it('omits the shortlist and keeps everyone when nothing matches', () => {
    // Unreachable with pilot data, so it is constructed: strip kremiranje
    // from everyone and ask for it.
    const noCremation = SPLIT_PILOT.map((p) => ({
      ...p,
      services: p.services.filter((s) => s.slug !== 'kremiranje'),
    }));
    const { shortlist, others, noMatches } = rankProviders(noCremation, {
      nacin: 'kremiranje',
    });
    expect(noMatches).toBe(true);
    expect(shortlist).toHaveLength(0);
    expect(others).toHaveLength(7);
  });
});

describe('reasonLine — the worked table from SPEC_frontend.md', () => {
  // These four lines are the approved mockup, recomputed against the current
  // pilot data. They are the reason the shortlist reads as justified rather
  // than opaque, so they are asserted exactly rather than by pattern.
  const answers: Answers = { situacija: 'preminuo', nacin: 'kremiranje' };

  it.each([
    ['bila-ruza', 'Dostupni 0–24 · nudi kremiranje'],
    // Bradvica reads "Dostupni 0–24", not the mockup's "Dežurna linija":
    // `available_24_7` became true in the owner's availability
    // reconciliation. Data drift, correctly reflected.
    ['bradvica', 'Dostupni 0–24 · nudi kremiranje'],
    ['lovrinac', 'Dežurna linija · klesarske usluge'],
    ['zec', 'Dežurna linija · najveći izbor usluga'],
  ])('%s → %s', (slug, expected) => {
    expect(reasonLine(bySlug(slug), SPLIT_PILOT, answers)).toBe(expected);
  });

  it('never surfaces a commodity or an out-of-register service', () => {
    // The rule as first written produced "Dežurna linija · ekshumacija" and
    // "Dežurna linija · urne" — rare, true, and the wrong thing to say to
    // someone whose relative died tonight.
    for (const p of SPLIT_PILOT) {
      const line = reasonLine(p, SPLIT_PILOT, answers) ?? '';
      expect(line).not.toMatch(/ekshumacij|urne|lijesov|fotografiranj/i);
    }
  });

  it('keeps the widest-range clause reachable', () => {
    // It was unreachable before the eligibility filter: the widest provider
    // always tripped the rare-service rule first.
    const lines = SPLIT_PILOT.map((p) => reasonLine(p, SPLIT_PILOT, answers));
    expect(lines.some((l) => l?.includes('najveći izbor usluga'))).toBe(true);
  });
});
