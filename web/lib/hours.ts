import type { Entity, Phone, WeekDay, WorkingHours } from './database.types';

/**
 * Opening hours and after-hours phone selection.
 *
 * Two rules here are load-bearing and easy to get quietly wrong:
 *
 * 1. **Everything is computed in `Europe/Zagreb`, which observes DST.** Doing
 *    this in the server's local time or in UTC is the standard way a feature
 *    like this misleads people for half the year.
 * 2. **An absent day means unknown and renders as nothing — never as
 *    "zatvoreno".** Wrongly telling a family a provider is closed is the worst
 *    failure this product can produce, and the schema deliberately encodes
 *    "closed" and "unknown" as different things so we can tell them apart.
 */

export const ZAGREB = 'Europe/Zagreb';

/**
 * `null` is not a fourth state to render — it means we hold no information and
 * must therefore say nothing at all.
 */
export type OpenState =
  | { kind: 'always' }          // available_24_7
  | { kind: 'open' }
  | { kind: 'closed' }
  | { kind: 'by_arrangement' }
  | null;                        // unknown — render nothing

const DAY_ORDER: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Local weekday and minutes-since-midnight in Zagreb, whatever the host TZ. */
export function zagrebNow(now: Date = new Date()): { day: WeekDay; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZAGREB,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = get('weekday').toLowerCase().slice(0, 3);
  const day = (DAY_ORDER.find((d) => d === weekday) ?? 'mon') as WeekDay;

  // "24" appears at midnight in some ICU versions; normalise it to 0.
  const hour = Number(get('hour')) % 24;
  return { day, minutes: hour * 60 + Number(get('minute')) };
}

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Is this provider open right now?
 *
 * Order matters: `available_24_7` overrides `working_hours` entirely, because a
 * provider who answers at 3am is available regardless of what their office
 * hours say.
 */
export function openState(
  entity: Pick<Entity, 'available_24_7' | 'working_hours'>,
  now: Date = new Date(),
): OpenState {
  if (entity.available_24_7) return { kind: 'always' };

  const hours: WorkingHours | null = entity.working_hours;
  if (!hours) return null; // no hours section, and no open/closed claim anywhere

  const { day, minutes } = zagrebNow(now);
  const today = hours[day];

  // The distinction the schema exists to preserve.
  if (today === undefined) return null;

  if ('closed' in today && today.closed) return { kind: 'closed' };
  if ('by_arrangement' in today && today.by_arrangement) {
    // Never a closed state: "po dogovoru" means reachable, not shut.
    return { kind: 'by_arrangement' };
  }

  if ('from' in today && 'to' in today) {
    const from = toMinutes(today.from);
    const to = toMinutes(today.to);
    if (from === null || to === null) return null; // malformed — say nothing
    return minutes >= from && minutes < to ? { kind: 'open' } : { kind: 'closed' };
  }

  return null;
}

/** Croatian rendering of an open state. `null` renders nothing at all. */
export function openStateLabel(state: OpenState): string | null {
  if (!state) return null;
  switch (state.kind) {
    case 'always':
      return 'Dostupni 0–24';
    case 'open':
      return 'Otvoreno';
    case 'closed':
      return 'Zatvoreno';
    case 'by_arrangement':
      return 'Po dogovoru';
  }
}

export type SelectedPhone = {
  phone: Phone;
  /** True when we picked the dežurni line because the office is shut. */
  isAfterHours: boolean;
};

/**
 * Which number the primary action dials. One rule, shared by the shortlist
 * card and the detail page.
 *
 * This is the whole point of typing phones in the schema: after hours the
 * office line is useless, and the emergency line is the entire value of the
 * listing.
 *
 * Note it deliberately keys on *currently closed* rather than on "not open".
 * An unknown state is not a closed state, so an absent day never promotes the
 * dežurni number — we would be acting on information we do not have.
 */
export function selectDisplayPhone(
  entity: Pick<Entity, 'available_24_7' | 'working_hours' | 'phones'>,
  now: Date = new Date(),
): SelectedPhone | null {
  const phones = entity.phones ?? [];
  if (phones.length === 0) return null;

  const state = openState(entity, now);
  if (state?.kind === 'closed') {
    const emergency = phones.find((p) => p.type === 'emergency');
    if (emergency) return { phone: emergency, isAfterHours: true };
  }

  // Otherwise the stored primary: the array is ordered, first entry is primary.
  return { phone: phones[0], isAfterHours: false };
}

/**
 * `+38521389890` → `+385 21 389 890`.
 *
 * Display only — `tel:` links always use the stored E.164 string, which is
 * what makes them dial reliably.
 */
export function formatPhone(e164: string): string {
  const m = /^\+385(\d+)$/.exec(e164);
  if (!m) return e164;

  // A Croatian national number is a two-digit area or network code followed by
  // a six- or seven-digit subscriber number, written 3+3 or 3+4 respectively:
  // 021 389 890, 099 212 8446. Splitting the tail evenly into threes would
  // leave a stray final digit on mobiles.
  const rest = m[1];
  const head = rest.slice(0, 2);
  const tail = rest.slice(2);

  let grouped: string;
  if (tail.length === 6 || tail.length === 7) {
    grouped = `${tail.slice(0, 3)} ${tail.slice(3)}`;
  } else {
    // Unexpected length — group in threes rather than assert a format we do
    // not recognise. Display only; the tel: link uses the stored E.164 string.
    grouped = tail.replace(/(\d{3})(?=\d)/g, '$1 ');
  }

  return `+385 ${head} ${grouped}`.trim();
}
