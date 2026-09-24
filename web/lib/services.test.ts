import { describe, expect, it } from 'vitest';
import { CANONICAL_SERVICE_ORDER, canonicalIndex } from './services';

/**
 * The service vocabulary's internal invariants.
 *
 * **These exist because one of them broke silently and stayed broken.**
 * `20260903120500_services_two_additions.sql` took the `services` table from 16
 * rows to 18 — `posredovanje-grobnog-mjesta` and `ugovaranje-unaprijed` — and
 * neither was added to `CANONICAL_SERVICE_ORDER`. `canonicalIndex` returns
 * `length` for an unknown slug rather than throwing, so both quietly sorted
 * last in every service list for eleven days, and nothing failed. Fixed
 * 2026-09-14; these tests are what stops it happening the next time a
 * migration adds a service.
 */
describe('service vocabulary', () => {
  /**
   * The seed list as it stands in production on 2026-09-14, in canonical
   * order. **A canary, not a rule** — when a migration adds a service, this
   * array is the thing that fails, which is the whole point: the failure is
   * the reminder to place the new slug deliberately rather than let it default
   * to last.
   */
  const PRODUCTION_SLUGS = [
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
    'posredovanje-grobnog-mjesta',
    'nadgrobni-spomenici',
    'uredenje-groba',
    'sredivanje-dokumentacije',
    'uredivanje-pokojnika',
    'glazba-na-pogrebu',
    'fotografiranje-pogreba',
    'ugovaranje-unaprijed',
  ];

  it('orders every service the database actually holds', () => {
    expect(CANONICAL_SERVICE_ORDER).toEqual(PRODUCTION_SLUGS);
  });

  /*
   * Three tests stood here until 2026-09-24 and went with what they guarded:
   * `SERVICE_SHORT_PHRASE` and `REASON_ELIGIBLE_SERVICES` existed only to
   * compose the gold reason line, and the reason line was removed with
   * ranking (SPEC_frontend.md -> Order and filtering). They were good tests --
   * one of them caught an invariant that had been documented and unenforced --
   * but there is nothing left for them to hold.
   *
   * `CANONICAL_SERVICE_ORDER` is still load-bearing: it orders the services
   * inside a row's disclosure and drives `/lista-pogrebnih-usluga`.
   */

  it('lists each service exactly once', () => {
    expect(new Set(CANONICAL_SERVICE_ORDER).size).toBe(
      CANONICAL_SERVICE_ORDER.length,
    );
  });

  describe('canonicalIndex', () => {
    it('ranks in list order', () => {
      expect(canonicalIndex('organizacija-pogreba')).toBe(0);
      expect(canonicalIndex('ugovaranje-unaprijed')).toBe(
        CANONICAL_SERVICE_ORDER.length - 1,
      );
    });

    it('places the grave cluster in the order it happens', () => {
      // Secure the plot, then the headstone, then the upkeep.
      expect(canonicalIndex('posredovanje-grobnog-mjesta')).toBeLessThan(
        canonicalIndex('nadgrobni-spomenici'),
      );
      expect(canonicalIndex('nadgrobni-spomenici')).toBeLessThan(
        canonicalIndex('uredenje-groba'),
      );
    });

    it('sorts an unknown slug last, never first', () => {
      // The behaviour that made the original gap invisible. Keep it — a
      // service present in the database but not here must still render — but
      // the canary above is what makes the gap loud.
      expect(canonicalIndex('nepostojeca-usluga')).toBe(
        CANONICAL_SERVICE_ORDER.length,
      );
    });
  });
});
