import { FILTERS, type Answers, type Filter, type Nacin, type Situacija } from './listing';

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
  const params = new URLSearchParams();
  // `situacija` and `pokojnik` survive because the guidance strip reads them.
  if (answers.situacija) params.set('situacija', answers.situacija);
  if (answers.pokojnik) params.set('pokojnik', answers.pokojnik);
  // **`nacin` is translated, not carried.** On a city page the list is
  // narrowed by `filtri`, so shipping `nacin` as well would put the same
  // instruction in the URL twice and let the two disagree. `ukop` translates
  // to nothing at all -- every provider does burials.
  if (answers.nacin === 'kremiranje') params.set('filtri', 'kremiranje');
  const qs = params.toString();
  return `/pogrebne-usluge/${grad}${qs ? `?${qs}` : ''}`;
}

/* --------------------------------------------------------------------------
   City-page filters and order.

   Separate from `FlowAnswers` on purpose. The flow's answers describe the
   family's situation and drive the guidance strip; these describe what the
   reader has asked this one list to do. Keeping them apart is what let
   `nacin` stop being a filter when ranking was removed without disturbing the
   guidance that still depends on it.
   -------------------------------------------------------------------------- */

/**
 * The active filters, read out of `?filtri=`.
 *
 * Unknown values are dropped rather than erroring, like every other parser
 * here: a hand-edited or stale URL must still produce a page. Order is
 * normalised to `FILTERS` order so the same selection always spells the same
 * URL, whichever order the reader ticked them in.
 */
export function parseFiltri(
  value: string | string[] | undefined,
  available = true,
): Filter[] {
  // **Below the size threshold a city ignores filters entirely.** Without
  // this, a link carrying `?filtri=kremiranje` opened on Zadar -- which has no
  // cremation provider at all -- renders an empty page, and no amount of
  // chip logic can prevent that because the state arrives by URL rather than
  // by click. Ignoring it is safe precisely where it applies: at six providers
  // or fewer the whole list is on one screen with nothing hidden.
  if (!available) return [];
  const v = one(value);
  if (!v) return [];
  const picked = new Set(v.split(','));
  return FILTERS.filter((f) => picked.has(f));
}

/** Serialise filters back, in a fixed order. `''` when nothing is active. */
export function filtriToQuery(filters: readonly Filter[]): string {
  const ordered = FILTERS.filter((f) => filters.includes(f));
  return ordered.join(',');
}

/**
 * Whether the reader asked for round-the-clock providers first.
 *
 * Absent means alphabetical, which is the default and the only order we ever
 * choose ourselves.
 */
export function parsePoredak(value: string | string[] | undefined): boolean {
  return one(value) === 'dostupnost';
}

/** True when the user answered nothing — the bypass path, or a bare city URL. */
export function isUnanswered(answers: FlowAnswers): boolean {
  return !answers.situacija && !answers.nacin && !answers.pokojnik;
}

/* --------------------------------------------------------------------------
   `/lista-pogrebnih-usluga` — the sheet a family carries.

   Its URL state lives here rather than in `lib/brief.ts` for the reason the
   file header gives: one module owns every URL this product builds, so that no
   page hand-assembles one. `lib/brief.ts` owns what the sheet *means* — which
   services are ticked by default, which hide — and imports from here.
   -------------------------------------------------------------------------- */

/** The route. One constant, because the results page and the sheet share it. */
export const BRIEF_PATH = '/lista-pogrebnih-usluga';

/**
 * The ticked services, read out of `?trebam=`.
 *
 * **`undefined` and `[]` mean different things, and the distinction is the
 * whole contract.** Absent means the family has not touched the list, so the
 * sheet derives its ticks from the flow answers. Present-but-empty means they
 * have, and unticked everything — a state the page must be able to hold, or
 * the last untick would silently spring every default back on.
 *
 * Unknown slugs are dropped rather than erroring, like every other parser
 * here: a hand-edited or stale URL must still produce a page.
 */
export function parseTrebam(
  value: string | string[] | undefined,
  allowed: readonly string[],
): string[] | undefined {
  const v = one(value);
  if (v === undefined) return undefined;
  if (v === '') return [];
  const seen = new Set<string>();
  return v
    .split(',')
    .filter((slug) => allowed.includes(slug) && !seen.has(slug) && seen.add(slug));
}

/**
 * A link to the sheet, carrying the city, the answers and the ticks.
 *
 * Fixed parameter order, for the same reason `answersToQuery` has one: the
 * same state must produce the same URL every time, so a link the results page
 * builds and a link the sheet rewrites after a tick are byte-identical.
 *
 * `ticks` omitted leaves `trebam` off entirely, which is how the results page
 * links in — it has no business deciding what the family needs.
 */
export function briefHref(opts: {
  grad: string;
  answers: FlowAnswers;
  ticks?: readonly string[];
}): string {
  const { grad, answers, ticks } = opts;
  const params = new URLSearchParams();
  params.set('grad', grad);
  if (answers.situacija) params.set('situacija', answers.situacija);
  if (answers.nacin) params.set('nacin', answers.nacin);
  if (answers.pokojnik) params.set('pokojnik', answers.pokojnik);
  // Set even when empty — see `parseTrebam`. `URLSearchParams` renders that as
  // a bare `trebam=`, which round-trips back to "touched, nothing ticked".
  if (ticks) params.set('trebam', ticks.join(','));
  return `${BRIEF_PATH}?${params.toString()}`;
}
