import Link from 'next/link';
import { Logo } from './Logo';
import { MENU } from '@/lib/nav';
import styles from './SiteHeader.module.css';

/**
 * The masthead — mark, wordmark and menu, on every page at every width.
 *
 * It replaces two things at once: the old header, which held a wordmark and a
 * back link and hid itself on desktop, and `SiteRail`, the sticky 220px column
 * that carried the navigation beside the content above 1024px. The rail solved
 * a real problem — a 560px column centred in a 1440px window reads as an
 * unfinished phone app — but it solved it with a shape nobody arrives already
 * knowing. A masthead over a reading column is the shape every visitor has
 * seen, and familiarity is worth more here than novelty: the people deciding
 * whether this product is real are a grieving family, a provider, a journalist,
 * and none of them should have to learn a layout first.
 *
 * **No primary action in it.** That rule survives the rail: the heaviest thing
 * on any screen is still the call button (or, on the landing page, the one CTA
 * into the flow). The menu is quiet text links.
 *
 * **Nothing route-specific and nothing from the database** — no city, no count,
 * no back link. That is what lets the root layout render it once for every
 * route without a query. The contextual back link that used to live here is
 * now `PageBack`, rendered by the pages that have somewhere to go back to.
 *
 * The mobile menu is a `<details>` disclosure, so the whole header works with
 * no JavaScript and opens nothing that could be called a modal. Above the
 * breakpoint the links sit inline and the disclosure is hidden; the two
 * renderings are separate markup rather than one panel that CSS forces open,
 * because forcing a closed `<details>` open with CSS is unreliable across
 * browsers and this is navigation, which may not be flaky.
 */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Logo className={styles.mark} />
          <span className={styles.wordmark}>Pogrebne usluge</span>
        </Link>

        {/* Desktop: the menu inline. */}
        <nav className={styles.nav} aria-label="Glavni izbornik">
          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: the same links behind a JavaScript-free disclosure. */}
        <details className={styles.menu}>
          <summary className={styles.menuButton}>Izbornik</summary>
          <nav className={styles.menuPanel} aria-label="Izbornik">
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} className={styles.menuLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
