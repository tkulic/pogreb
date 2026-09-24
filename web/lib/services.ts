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
  // Added 2026-09-14. The grave cluster now runs in the order it happens:
  // secure the plot, then the headstone, then the upkeep.
  'posredovanje-grobnog-mjesta',
  'nadgrobni-spomenici',
  'uredenje-groba',
  'sredivanje-dokumentacije',
  'uredivanje-pokojnika',
  'glazba-na-pogrebu',
  'fotografiranje-pogreba',
  // Added 2026-09-14, and last deliberately. This list runs in the order a
  // family encounters the decisions — and pre-arrangement is not a decision in
  // that sequence at all. It belongs to the `planiranje` path, which is a
  // different person on a different timeline. Leading with it would put "book
  // your own funeral" at the top of a list read by someone whose relative died
  // tonight; trailing is the honest position, for a stronger version of the
  // reason `fotografiranje-pogreba` trails.
  'ugovaranje-unaprijed',
];


/** Position in canonical order; unknown slugs sort last, never first. */
export function canonicalIndex(slug: string): number {
  const i = CANONICAL_SERVICE_ORDER.indexOf(slug);
  return i === -1 ? CANONICAL_SERVICE_ORDER.length : i;
}

