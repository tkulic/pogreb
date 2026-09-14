import { describe, expect, it } from 'vitest';
import { providerCountLabel } from './copy';

/**
 * Croatian numeral agreement, which is the whole reason `providerCountLabel`
 * is a function rather than a template string.
 *
 * The live data exercises exactly one of its two branches — no city currently
 * holds a count ending in 1 — so these tests are the only thing standing
 * between the rule and the day Zagreb reaches 21.
 */
describe('providerCountLabel', () => {
  it('takes the nominative singular for 1', () => {
    expect(providerCountLabel(1)).toBe('1 pogrebnik');
  });

  it('takes the genitive for 2–4', () => {
    expect(providerCountLabel(2)).toBe('2 pogrebnika');
    expect(providerCountLabel(3)).toBe('3 pogrebnika');
    expect(providerCountLabel(4)).toBe('4 pogrebnika');
  });

  it('keeps the genitive for 5 and above, where a plural would be wrong', () => {
    expect(providerCountLabel(5)).toBe('5 pogrebnika');
    expect(providerCountLabel(9)).toBe('9 pogrebnika');
    expect(providerCountLabel(20)).toBe('20 pogrebnika');
  });

  it('treats 11–14 as the 5+ case, not as the digit they end in', () => {
    // The trap: 11 ends in 1 and 12–14 end in 2–4, but the teens do not follow
    // the last digit. Getting this wrong yields "11 pogrebnik".
    expect(providerCountLabel(11)).toBe('11 pogrebnika');
    expect(providerCountLabel(12)).toBe('12 pogrebnika');
    expect(providerCountLabel(13)).toBe('13 pogrebnika');
    expect(providerCountLabel(14)).toBe('14 pogrebnika');
  });

  it('follows the last digit again above the teens', () => {
    expect(providerCountLabel(21)).toBe('21 pogrebnik');
    expect(providerCountLabel(22)).toBe('22 pogrebnika');
    expect(providerCountLabel(31)).toBe('31 pogrebnik');
    expect(providerCountLabel(101)).toBe('101 pogrebnik');
  });

  it('applies the teens rule again at 111, not just at 11', () => {
    // 111 ends in "11" and must behave like 11 rather than like 1 or 101.
    expect(providerCountLabel(111)).toBe('111 pogrebnika');
    expect(providerCountLabel(112)).toBe('112 pogrebnika');
  });

  /**
   * The counts the live data actually holds on 2026-09-14. Not a rule — a
   * canary, so a change to the agreement logic shows up as a diff against the
   * seven strings the landing page renders today.
   */
  it('renders the seven live city counts', () => {
    const live = { zagreb: 20, split: 13, rijeka: 6, zadar: 5, osijek: 3, pula: 2, dubrovnik: 2 };
    expect(Object.values(live).map(providerCountLabel)).toEqual([
      '20 pogrebnika',
      '13 pogrebnika',
      '6 pogrebnika',
      '5 pogrebnika',
      '3 pogrebnika',
      '2 pogrebnika',
      '2 pogrebnika',
    ]);
  });
});
