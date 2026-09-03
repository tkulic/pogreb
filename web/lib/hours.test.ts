import { describe, expect, it } from 'vitest';
import {
  formatPhone,
  openState,
  openStateLabel,
  selectDisplayPhone,
  zagrebNow,
} from './hours';
import { SPLIT_PILOT } from './__fixtures__/split-pilot';

/** A UTC instant, so tests do not depend on the machine's timezone. */
const utc = (iso: string) => new Date(iso);

describe('zagrebNow', () => {
  it('reads the local day and clock in Zagreb, not in the host timezone', () => {
    // 2026-01-15 is a Thursday. 22:30 UTC is 23:30 Zagreb (CET, UTC+1).
    expect(zagrebNow(utc('2026-01-15T22:30:00Z'))).toEqual({
      day: 'thu',
      minutes: 23 * 60 + 30,
    });
  });

  it('rolls the day over in local time, not UTC', () => {
    // 23:30 UTC on Thursday is already 00:30 Friday in Zagreb.
    expect(zagrebNow(utc('2026-01-15T23:30:00Z'))).toEqual({ day: 'fri', minutes: 30 });
  });

  it('observes DST — the same UTC hour is a different local hour in summer', () => {
    // CET (+1) in January, CEST (+2) in July. Getting this wrong is the
    // standard way a feature like this misleads people for half the year.
    const winter = zagrebNow(utc('2026-01-15T12:00:00Z'));
    const summer = zagrebNow(utc('2026-07-15T12:00:00Z'));
    expect(winter.minutes).toBe(13 * 60);
    expect(summer.minutes).toBe(14 * 60);
  });
});

describe('openState', () => {
  const hours = {
    mon: { from: '08:00', to: '16:00' },
    tue: { from: '08:00', to: '16:00' },
    sat: { closed: true },
    sun: { by_arrangement: true },
    // wed, thu, fri deliberately absent — unknown, not closed.
  } as const;

  it('reports 24/7 availability regardless of posted hours', () => {
    const state = openState({ available_24_7: true, working_hours: hours }, utc('2026-01-17T12:00:00Z'));
    expect(state).toEqual({ kind: 'always' });
  });

  it('is open inside posted hours', () => {
    // Monday 2026-01-12, 09:00 UTC = 10:00 Zagreb.
    expect(openState({ available_24_7: false, working_hours: hours }, utc('2026-01-12T09:00:00Z')))
      .toEqual({ kind: 'open' });
  });

  it('is closed outside posted hours', () => {
    // Monday 18:00 Zagreb.
    expect(openState({ available_24_7: false, working_hours: hours }, utc('2026-01-12T17:00:00Z')))
      .toEqual({ kind: 'closed' });
  });

  it('treats the closing minute as closed, not open', () => {
    // Monday exactly 16:00 Zagreb.
    expect(openState({ available_24_7: false, working_hours: hours }, utc('2026-01-12T15:00:00Z')))
      .toEqual({ kind: 'closed' });
  });

  it('reports an explicitly closed day as closed', () => {
    // Saturday 2026-01-17.
    expect(openState({ available_24_7: false, working_hours: hours }, utc('2026-01-17T11:00:00Z')))
      .toEqual({ kind: 'closed' });
  });

  it('never reports by_arrangement as closed', () => {
    // Sunday 2026-01-18, 03:00 Zagreb — "po dogovoru" means reachable.
    const state = openState({ available_24_7: false, working_hours: hours }, utc('2026-01-18T02:00:00Z'));
    expect(state).toEqual({ kind: 'by_arrangement' });
    expect(openStateLabel(state)).toBe('Po dogovoru');
  });

  it('returns null for an absent day — unknown is NOT closed', () => {
    // Wednesday 2026-01-14. This is the assertion that protects a family from
    // being told a provider is shut when we simply do not know.
    const state = openState({ available_24_7: false, working_hours: hours }, utc('2026-01-14T11:00:00Z'));
    expect(state).toBeNull();
    expect(openStateLabel(state)).toBeNull();
  });

  it('returns null when working_hours is absent entirely', () => {
    expect(openState({ available_24_7: false, working_hours: null }, utc('2026-01-12T09:00:00Z')))
      .toBeNull();
  });

  it('says nothing rather than guessing on a malformed time', () => {
    const broken = { mon: { from: 'morning', to: '16:00' } } as never;
    expect(openState({ available_24_7: false, working_hours: broken }, utc('2026-01-12T09:00:00Z')))
      .toBeNull();
  });
});

describe('selectDisplayPhone', () => {
  const lovrinac = SPLIT_PILOT.find((p) => p.slug === 'lovrinac')!;
  const anicic = SPLIT_PILOT.find((p) => p.slug === 'anicic')!;

  it('dials the stored primary during posted hours', () => {
    // Lovrinac is open Mon 07:00–19:00; phones[0] is the office line.
    const picked = selectDisplayPhone(lovrinac, utc('2026-01-12T09:00:00Z'));
    expect(picked?.phone.type).toBe('office');
    expect(picked?.isAfterHours).toBe(false);
  });

  it('promotes the dezurni line once the office is shut', () => {
    // Monday 22:00 Zagreb — this is the entire value of the listing at that hour.
    const picked = selectDisplayPhone(lovrinac, utc('2026-01-12T21:00:00Z'));
    expect(picked?.phone.type).toBe('emergency');
    expect(picked?.isAfterHours).toBe(true);
  });

  it('does not promote a dezurni line on an unknown day', () => {
    // An unknown state is not a closed state. Acting on it would mean acting
    // on information we do not have.
    const unknownDay = { ...lovrinac, working_hours: { mon: { from: '07:00', to: '19:00' } } };
    const picked = selectDisplayPhone(unknownDay, utc('2026-01-14T21:00:00Z')); // Wednesday
    expect(picked?.isAfterHours).toBe(false);
    expect(picked?.phone.type).toBe('office');
  });

  it('keeps the primary when the provider has no emergency number', () => {
    // Aničić has office + mobile only.
    const picked = selectDisplayPhone(anicic, utc('2026-01-12T21:00:00Z'));
    expect(picked?.isAfterHours).toBe(false);
    expect(picked?.phone.type).toBe('office');
  });

  it('returns null when there is no number at all', () => {
    expect(selectDisplayPhone({ ...anicic, phones: null }, utc('2026-01-12T09:00:00Z'))).toBeNull();
    expect(selectDisplayPhone({ ...anicic, phones: [] }, utc('2026-01-12T09:00:00Z'))).toBeNull();
  });

  it('picks a real number for every pilot provider', () => {
    for (const p of SPLIT_PILOT) {
      const picked = selectDisplayPhone(p, utc('2026-01-12T21:00:00Z'));
      expect(picked?.phone.number).toMatch(/^\+385\d+$/);
    }
  });
});

describe('formatPhone', () => {
  it('groups Croatian numbers the way they are written locally', () => {
    expect(formatPhone('+38521389890')).toBe('+385 21 389 890');
    expect(formatPhone('+385992128446')).toBe('+385 99 212 8446');
  });

  it('passes anything unrecognised through untouched', () => {
    expect(formatPhone('+4915112345678')).toBe('+4915112345678');
  });
});
