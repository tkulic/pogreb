import { describe, expect, it } from 'vitest';
import {
  COFFIN,
  CORE_GROUPS,
  CREMATION_GROUP,
  DEFAULT_EXTRAS,
  EXTRAS,
  GRAVE_EARTH,
  GRAVE_TOMB,
  ROUNDING_STEP,
  estimate,
  formatEstimate,
  formatEur,
  formatRange,
  roundToStep,
  type CostAnswers,
} from './costs';

/**
 * The cost estimate.
 *
 * One property here is worth more than any individual figure, because it is
 * the one that would fail silently rather than throw: **every total must equal
 * the parts printed beneath it** — the headline against its two blocks, and
 * each block against its itemised lines. A cost page whose own arithmetic does
 * not reconcile is worse than no cost page.
 */

const base: CostAnswers = {
  nacin: 'ukop',
  lijes: 'standardni',
  extras: DEFAULT_EXTRAS,
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** Floating-point money: compare to the cent, not to the bit. */
const cents = (x: number) => Math.round(x * 100);
/** Normalise ICU's non-breaking spaces and dashes so assertions stay readable. */
const plain = (s: string) =>
  s.replace(/\s/g, ' ').replace(/–|—/g, '-').replace(/€/g, 'EUR').trim();

describe('estimate — structure', () => {
  it('shows the reader groups, not tariff rows', () => {
    // A dozen rows reading "Opremanje kovčega 12,23 €" overwhelms exactly the
    // reader who opened the panel hoping to understand the bill.
    const e = estimate(base);
    const core = e.lines.filter((l) => l.block === 'core');
    const choices = e.lines.filter((l) => l.block === 'choice');
    expect(core).toHaveLength(CORE_GROUPS.length + 1); // + the grave group
    expect(choices).toHaveLength(1 + DEFAULT_EXTRAS.length); // coffin + extras
  });

  it('never shows a group small enough for rounding to distort it', () => {
    // The other reason tariff rows are grouped: a 16,38 € line rounded to the
    // nearest 10 € is off by more than a fifth.
    for (const l of estimate(base).lines) {
      expect(l.from).toBeGreaterThan(ROUNDING_STEP * 2);
    }
  });

  it('keeps the exact tariff totals behind each group', () => {
    const core = estimate(base).lines.filter((l) => l.block === 'core');
    const fixed = sum(CORE_GROUPS.map((g) => sum(g.items.map((t) => t.gross))));
    // The grave line spans both kinds, so the core's ends come from different
    // tariffs: the tomb at the bottom, the earth grave at the top.
    expect(cents(sum(core.map((l) => l.from)))).toBe(
      cents(fixed + sum(GRAVE_TOMB.items.map((t) => t.gross))),
    );
    expect(cents(sum(core.map((l) => l.to)))).toBe(
      cents(fixed + sum(GRAVE_EARTH.items.map((t) => t.gross))),
    );
  });

  it('lists extras in constant order, not click order', () => {
    const clicked = estimate({ ...base, extras: ['karmine', 'vijenac'] });
    const labels = clicked.lines.filter((l) => l.block === 'choice').map((l) => l.label);
    expect(labels).toEqual([COFFIN.standardni.label, EXTRAS.vijenac.label, EXTRAS.karmine.label]);
  });
});

describe('estimate — the grave', () => {
  const graveOf = (e: ReturnType<typeof estimate>) =>
    e.lines.find((l) => l.label === 'Otvaranje grobnog mjesta')!;

  it('keeps the tomb cheaper to open than an earth grave', () => {
    // Counter-intuitive and load-bearing for the copy: a tomb is expensive to
    // buy and cheap to open. It is also what makes the grave line a range.
    expect(sum(GRAVE_TOMB.items.map((t) => t.gross))).toBeLessThan(
      sum(GRAVE_EARTH.items.map((t) => t.gross)),
    );
  });

  it('spans both kinds of grave, because the reader is never asked which', () => {
    const g = graveOf(estimate(base));
    expect(g.from).toBeCloseTo(sum(GRAVE_TOMB.items.map((t) => t.gross)), 2);
    expect(g.to).toBeCloseTo(sum(GRAVE_EARTH.items.map((t) => t.gross)), 2);
  });

  it('never prices buying the plot, only opening it', () => {
    // Allocated by order of registration, not sold from a price list. Any
    // number we put here would be the least defensible one on the page; the
    // UI states the exclusion instead.
    const g = graveOf(estimate(base));
    expect(g.to).toBeLessThan(400);
  });
});

describe('estimate — cremation', () => {
  it('adds transport only when there is no local crematorium', () => {
    const near = formatEstimate(estimate({ ...base, nacin: 'kremiranje', krematorij: 'blizu' }));
    const far = formatEstimate(estimate({ ...base, nacin: 'kremiranje', krematorij: 'daleko' }));

    expect(near.core.from).toBe(near.core.to); // wholly tariffed, so a point
    expect(far.core.to).toBeGreaterThan(far.core.from); // transport is a range
    expect(far.headline.from).toBeGreaterThan(near.headline.from);
  });

  it('charges an urn instead of opening a grave', () => {
    const c = estimate({ ...base, nacin: 'kremiranje', krematorij: 'blizu' });
    const labels = c.lines.map((l) => l.label);
    expect(labels).toContain(CREMATION_GROUP.label);
    expect(labels).toContain('Urna');
    expect(labels).not.toContain(GRAVE_EARTH.label);
  });

  it('keeps the coffin, because a cremation still needs one', () => {
    const c = estimate({ ...base, nacin: 'kremiranje', krematorij: 'blizu' });
    expect(c.lines.map((l) => l.label)).toContain(COFFIN.standardni.label);
  });
});

describe('estimate — assumptions travel with the number', () => {
  it('carries the karmine headcount into the itemisation', () => {
    const e = estimate({ ...base, extras: ['karmine'] });
    const k = e.lines.find((l) => l.label === EXTRAS.karmine.label);
    expect(k?.assumption).toBeTruthy();
  });

  it('leaves lines without an assumption undecorated', () => {
    const e = estimate({ ...base, extras: ['vijenac'] });
    const v = e.lines.find((l) => l.label === EXTRAS.vijenac.label);
    expect(v?.assumption).toBeUndefined();
  });
});

describe('formatEstimate — rounding', () => {
  it('reconciles at every level, for every combination of answers', () => {
    // The whole reason the totals are derived rather than rounded separately.
    const tiers = ['osnovni', 'standardni', 'sarkofag'] as const;
    const nacini = ['ukop', 'kremiranje'] as const;
    const kremat = ['blizu', 'daleko'] as const;

    for (const lijes of tiers) {
      for (const nacin of nacini) {
        for (const krematorij of kremat) {
          for (const extras of [
            [],
            DEFAULT_EXTRAS,
            ['vijenac', 'osmrtnica', 'glazba', 'karmine'],
          ]) {
            const d = formatEstimate(
              estimate({
                nacin,
                lijes,
                krematorij,
                extras: extras as CostAnswers['extras'],
              }),
            );
            // Headline equals its two blocks…
            expect(d.headline.from).toBe(d.core.from + d.choices.from);
            expect(d.headline.to).toBe(d.core.to + d.choices.to);
            // …and each block equals the lines printed under it.
            for (const [block, key] of [
              ['core', 'core'],
              ['choices', 'choice'],
            ] as const) {
              const rows = d.lines.filter((l) => l.block === key);
              expect(sum(rows.map((r) => r.from))).toBe(d[block].from);
              expect(sum(rows.map((r) => r.to))).toBe(d[block].to);
            }
          }
        }
      }
    }
  });

  it('puts every displayed figure on the rounding step', () => {
    const d = formatEstimate(estimate(base));
    for (const n of [
      d.headline.from,
      d.headline.to,
      d.core.from,
      d.core.to,
      d.choices.from,
      d.choices.to,
      ...d.lines.flatMap((l) => [l.from, l.to]),
    ]) {
      expect(n % ROUNDING_STEP).toBe(0);
    }
  });

  it('rounds to the step, in both directions', () => {
    expect(roundToStep(613.56)).toBe(610);
    expect(roundToStep(211.58)).toBe(210);
    expect(roundToStep(285.88)).toBe(290);
    expect(roundToStep(0)).toBe(0);
  });

  it('never collapses a real range into a single number', () => {
    const d = formatEstimate({
      lines: [{ label: 'x', from: 1001, to: 1002, block: 'core' }],
      deferred: [],

    });
    expect(d.core.to - d.core.from).toBe(ROUNDING_STEP);
  });

  it('leaves an exact point value a point value', () => {
    const d = formatEstimate({
      lines: [{ label: 'x', from: 1000, to: 1000, block: 'core' }],
      deferred: [],

    });
    expect(d.core).toEqual({ from: 1000, to: 1000 });
  });

  it('does not round the recurring annual fee out of existence', () => {
    // At a 50 € step this range renders as 0–100 €, which is why it is 10.
    const annual = estimate(base).deferred.find((d) => d.from === 10);
    expect(annual).toBeDefined();
    expect(roundToStep(annual!.from)).toBe(10);
    expect(roundToStep(annual!.to)).toBe(80);
  });
});

describe('formatting — Croatian', () => {
  it('groups thousands the Croatian way and puts the mark last', () => {
    // ICU puts a non-breaking space before the mark; normalise before compare.
    expect(plain(formatEur(1010))).toBe('1.010 EUR');
    expect(plain(formatEur(262, { decimals: 2 }))).toBe('262,00 EUR');
  });

  it('writes a range with one currency mark, not two', () => {
    expect(plain(formatRange(930, 1100))).toBe('930 - 1.100 EUR');
  });

  it('collapses a range whose ends are equal', () => {
    expect(plain(formatRange(610, 610))).toBe('610 EUR');
  });
});
