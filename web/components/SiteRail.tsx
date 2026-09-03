import Link from 'next/link';
import styles from './SiteRail.module.css';

/**
 * The desktop masthead rail — **desktop only, static, and route-independent.**
 *
 * The app was mobile-*only* rather than mobile-first: every page capped at a
 * 560px column and centred, which is right on a phone and reads as an
 * unfinished phone app in a 1440px window. The rail is the answer chosen over
 * a wider single column and over a card grid: it gives the wide viewport
 * something deliberate to hold — wordmark, what this is, the pages that are
 * always relevant — while the provider list stays exactly one column, so
 * Kamen's "entries separated by cut rules, no containers" survives untouched
 * and the design still reads calmly at forty providers.
 *
 * Four rules it lives by:
 *
 * 1. **It is `display: none` below the breakpoint**, and nothing in it is the
 *    only copy of anything. Every link here also sits in a page footer, so a
 *    phone loses nothing by never rendering it.
 * 2. **No primary action.** The landing page has exactly one heaviest thing on
 *    the screen and it is the call to find a provider; a second CTA here would
 *    split it. The rail holds statements and quiet links only.
 * 3. **It states what the site is, never what a page claims.** The coverage
 *    claim belongs to the page — the landing `<h1>` and the results header both
 *    carry it — and the first draft of this rail repeated it word for word
 *    beside those, which read as a stutter rather than as emphasis.
 * 4. **No city, no count, nothing from the database.** That is what lets the
 *    root layout render it without a query on every route in the product,
 *    including the statically rendered prose pages, and it is why the rail
 *    cannot go stale or claim Split on a page about somewhere else.
 */
export function SiteRail() {
  return (
    <aside className={styles.rail} aria-label="O ovoj stranici">
      <Link href="/" className={styles.wordmark}>
        Pogrebne usluge
      </Link>

      <p className={styles.claim}>
        Besplatan popis pogrebnika, bez prijave i bez posrednika.
      </p>

      <p className={styles.note}>
        Nitko nam ne plaća za bolju poziciju. Ne tražimo vaše podatke i ne
        prodajemo upite.
      </p>

      <nav className={styles.nav} aria-label="Stranice">
        <Link href="/sto-uciniti-prvo" className={styles.navLink}>
          Što učiniti prvo
        </Link>
        <Link href="/kako-rangiramo" className={styles.navLink}>
          Kako rangiramo
        </Link>
        <Link href="/nase-obecanje" className={styles.navLink}>
          Naše obećanje
        </Link>
      </nav>
    </aside>
  );
}
