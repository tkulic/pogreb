/**
 * Service vocabulary that is not in the database.
 *
 * Two things live here because the `services` table cannot carry them:
 * a canonical ordering (the table has only `id`, `name`, `slug` — no sort
 * column), and the short display phrases the reason line needs.
 */

/**
 * Canonical seed order, per SPEC_database.md → Seed data.
 *
 * Service lists render in this order everywhere — on cards and on the detail
 * page. It is not alphabetical and must not be sorted: it runs roughly in the
 * order a family encounters the decisions, which is why `organizacija-pogreba`
 * leads and `fotografiranje-pogreba` trails.
 *
 * Keyed on `slug` rather than `id` because slugs are stable and readable,
 * while the uuids differ per environment.
 */
export const CANONICAL_SERVICE_ORDER: readonly string[] = [
  'organizacija-pogreba',
  'kremiranje',
  'prijevoz-pokojnika',
  'prijevoz-pokojnika-inozemstvo',
  'ekshumacija',
  'balzamiranje',
  'lijesovi',
  'urne',
  'cvjetni-aranzmani',
  'osmrtnice',
  'nadgrobni-spomenici',
  'uredenje-groba',
  'sredivanje-dokumentacije',
  'uredivanje-pokojnika',
  'glazba-na-pogrebu',
  'fotografiranje-pogreba',
];

/**
 * Short display phrases for the reason line.
 *
 * The reason line reads as a clause inside a sentence — `Dežurna linija ·
 * klesarske usluge` — so these are lowercase and shorter than
 * `services.name`, which is a standalone list label. The two genuinely
 * diverge: "Klesarske usluge / nadgrobni spomenici" is right in a service
 * list and unreadable in a two-clause line.
 *
 * Every slug in CANONICAL_SERVICE_ORDER has an entry, so a service becoming
 * rare enough to surface can never render as a raw slug.
 */
export const SERVICE_SHORT_PHRASE: Readonly<Record<string, string>> = {
  'organizacija-pogreba': 'organizacija pogreba',
  kremiranje: 'kremiranje',
  'prijevoz-pokojnika': 'prijevoz pokojnika',
  'prijevoz-pokojnika-inozemstvo': 'prijevoz u inozemstvo',
  ekshumacija: 'ekshumacija',
  balzamiranje: 'balzamiranje',
  lijesovi: 'lijesovi',
  urne: 'urne',
  'cvjetni-aranzmani': 'cvjetni aranžmani',
  osmrtnice: 'osmrtnice',
  'nadgrobni-spomenici': 'klesarske usluge',
  'uredenje-groba': 'uređenje groba',
  'sredivanje-dokumentacije': 'sređivanje dokumentacije',
  'uredivanje-pokojnika': 'uređivanje pokojnika',
  'glazba-na-pogrebu': 'glazba na pogrebu',
  'fotografiranje-pogreba': 'fotografiranje pogreba',
};

/** Position in canonical order; unknown slugs sort last, never first. */
export function canonicalIndex(slug: string): number {
  const i = CANONICAL_SERVICE_ORDER.indexOf(slug);
  return i === -1 ? CANONICAL_SERVICE_ORDER.length : i;
}

/**
 * Services eligible to appear as the reason line's second clause.
 *
 * A service being rare is necessary but not sufficient — it also has to be a
 * *reason to choose this provider*. Three kinds of rare service are not, and
 * are excluded:
 *
 * - **Goods chosen in person with the provider** — `urne`, `lijesovi`. This is
 *   the same argument SPEC_frontend.md uses to reject a service picker: a
 *   casket is not a filter, it is an item chosen an hour later, in person.
 * - **Out of register for the moment** — `ekshumacija`. Exhumation is a real
 *   service and a real search term, but "Dežurna linija · ekshumacija" is the
 *   wrong thing to say to someone whose relative died tonight.
 * - **Nice-to-have extras** — `fotografiranje-pogreba`. Genuinely useful when
 *   relatives cannot travel, but it does not drive the choice of provider in
 *   the first hours, and it crowds out a stronger clause.
 *
 * Without this filter the clause misfires in both directions: it surfaced
 * `ekshumacija` and `urne` for two pilot providers, and it made the
 * widest-range clause unreachable, because the widest provider always tripped
 * the rare-service rule first.
 *
 * **This list is copy, not logic.** It encodes an editorial judgement about
 * what recommends a funeral director, and it is the project owner's to change.
 * Adding a service here is safe; the rarity threshold still gates it.
 */
export const REASON_ELIGIBLE_SERVICES: ReadonlySet<string> = new Set([
  'organizacija-pogreba',
  'kremiranje',
  'prijevoz-pokojnika',
  'prijevoz-pokojnika-inozemstvo',
  'balzamiranje',
  'cvjetni-aranzmani',
  'osmrtnice',
  'nadgrobni-spomenici',
  'uredenje-groba',
  'sredivanje-dokumentacije',
  'uredivanje-pokojnika',
  'glazba-na-pogrebu',
]);
