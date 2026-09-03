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

/**
 * Which question screen is showing. `null` means the landing page.
 *
 * Lives here rather than in the route because the results page also has to
 * build links back into the flow, and two files constructing flow URLs by hand
 * is how the "arrive with the current answers still selected" rule quietly
 * stopped being true.
 */
export type Korak = 'situacija' | 'mjesto' | 'potrebe';

/** `?korak=` absent → the landing page. Anything unexpected → the first step. */
export function parseKorak(value: string | string[] | undefined): Korak | null {
  const v = one(value);
  if (v === undefined) return null;
  return v === 'mjesto' || v === 'potrebe' ? v : 'situacija';
}

/**
 * The city chosen on screen 2, while the flow is still running.
 *
 * **It lives in the query string during the flow and in the path at the
 * results**, which is the same split the spec already describes: screen 2 is
 * "pre-answered from the city path segment" when you arrive from a city URL,
 * and has to be carried some other way when you arrive from the landing page.
 *
 * It is deliberately **not part of `FlowAnswers`.** `FlowAnswers` is the input
 * to ranking, and the city is not a ranking term — it decides *which*
 * providers are fetched, not how they are ordered. Putting it in there would
 * also leak `?grad=` into the results URL, where the path already says it.
 *
 * Validated against the cities that actually exist, so a hand-edited or stale
 * URL drops the value rather than producing a link to a city page that 404s.
 */
export function parseGrad(
  value: string | string[] | undefined,
  allowed: readonly string[],
): string | undefined {
  const v = one(value);
  return v && allowed.includes(v) ? v : undefined;
}

/**
 * A link to a question screen, carrying everything answered so far.
 *
 * Fixed parameter order, for the same reason `answersToQuery` has one: the
 * same state must produce the same URL every time, whether it was built by the
 * flow or by the results page linking back into it.
 */
export function flowHref(opts: {
  answers: FlowAnswers;
  grad?: string;
  korak: Korak;
}): string {
  const { answers, grad, korak } = opts;
  const params = new URLSearchParams();
  if (answers.situacija) params.set('situacija', answers.situacija);
  if (answers.nacin) params.set('nacin', answers.nacin);
  if (answers.pokojnik) params.set('pokojnik', answers.pokojnik);
  if (grad) params.set('grad', grad);
  params.set('korak', korak);
  return `/?${params.toString()}`;
}

/**
 * A link to the results for a city, carrying the answers.
 *
 * The city moves from the query string into the path here, and `grad` is
 * dropped rather than duplicated — a URL that said the city twice would give
 * two spellings of the same page for search engines to reconcile.
 */
export function resultsHref(grad: string, answers: FlowAnswers): string {
  return `/pogrebne-usluge/${grad}${answersToQuery(answers)}`;
}

/** True when the user answered nothing — the bypass path, or a bare city URL. */
export function isUnanswered(answers: FlowAnswers): boolean {
  return !answers.situacija && !answers.nacin && !answers.pokojnik;
}
