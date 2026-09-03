import type { Answers, Nacin, Situacija } from './ranking';

/**
 * The flow's answers, as they live in the URL.
 *
 * **State lives in the URL, not only in React state** (SPEC_frontend.md →
 * Navigation and state rules). That is what makes a result set shareable — a
 * family member sends the link to a sibling — what makes it survive a refresh,
 * and what makes browser Back work without any code of ours.
 *
 * Parameter names and values are Croatian, because a URL is customer-facing
 * text (SPEC.md → Naming Convention). The types they parse into are English.
 */

/** Where the deceased is now. Guidance only — it never filters or reorders. */
export type Pokojnik = 'kuca' | 'bolnica' | 'dom' | 'inozemstvo';

export type FlowAnswers = Answers & {
  pokojnik?: Pokojnik;
};

const SITUACIJA: readonly Situacija[] = ['preminuo', 'posljednji-dani', 'planiranje'];
const NACIN: readonly Nacin[] = ['kremiranje', 'ukop'];
const POKOJNIK: readonly Pokojnik[] = ['kuca', 'bolnica', 'dom', 'inozemstvo'];

/** Next gives repeated params as arrays; we only ever want one value. */
function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const v = one(value);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

/**
 * Read the answers out of a query string.
 *
 * **An unrecognised value is dropped, never an error.** Nothing in this flow is
 * required and nothing is typed, so no validation error is possible
 * (SPEC_frontend.md → rule 5) — and a hand-edited or truncated URL must still
 * produce a page, because the page is the thing the user came for.
 */
export function parseAnswers(
  searchParams: Record<string, string | string[] | undefined>,
): FlowAnswers {
  const answers: FlowAnswers = {};
  const situacija = pick(searchParams.situacija, SITUACIJA);
  const nacin = pick(searchParams.nacin, NACIN);
  const pokojnik = pick(searchParams.pokojnik, POKOJNIK);
  if (situacija) answers.situacija = situacija;
  if (nacin) answers.nacin = nacin;
  if (pokojnik) answers.pokojnik = pokojnik;
  return answers;
}

/**
 * Serialise answers back into a query string, in a fixed order.
 *
 * Fixed order matters: it makes the same set of answers produce the same URL
 * every time, so a shared link and a link built by the flow are byte-identical
 * and resolve to the same cache entry and the same `rel=canonical` target.
 *
 * Returns `''` when nothing is selected, so callers can append it to a path
 * unconditionally without producing a bare `?`.
 */
export function answersToQuery(answers: FlowAnswers): string {
  const params = new URLSearchParams();
  if (answers.situacija) params.set('situacija', answers.situacija);
  if (answers.nacin) params.set('nacin', answers.nacin);
  if (answers.pokojnik) params.set('pokojnik', answers.pokojnik);
  const s = params.toString();
  return s ? `?${s}` : '';
}

/** True when the user answered nothing — the bypass path, or a bare city URL. */
export function isUnanswered(answers: FlowAnswers): boolean {
  return !answers.situacija && !answers.nacin && !answers.pokojnik;
}
