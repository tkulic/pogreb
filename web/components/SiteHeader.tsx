import Link from 'next/link';
import { Logo } from './Logo';
import { MENU, isNavGroup } from '@/lib/nav';
import { NavDisclosure } from './NavDisclosure';
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
 *
 * ## Groups, and why they render differently at the two widths
 *
 * A `NavGroup` (see `lib/nav.ts`) has children and no destination of its own.
 *
 * **Desktop** gives it a second `<details>`, for the same reason the mobile
 * menu is one: it is the only disclosure that opens with no JavaScript, and
 * `<summary>` is focusable and toggles on Enter and Space without any ARIA of
 * ours. A hover-opened panel was the alternative and is worse — CSS cannot open
 * a `<details>` on hover, and the `:focus-within` constructions that fake it
 * put a menu behind a tabindex on a non-interactive element.
 *
 * **Mobile renders the children inline under their label instead**, because the
 * panel they would sit in is already a disclosure. Nesting one inside the other
 * costs a grieving reader two taps to reach a page, and the whole panel is four
 * labels and two children — small enough to show at once.
 *
 * ## Closing
 *
 * Both disclosures are `NavDisclosure`, which is a plain `<details>` plus one
 * effect: it closes when the route changes. The header sits in the root layout
 * and is never unmounted by a client-side navigation, and `open` is a DOM
 * property React does not control — so without it a reader who chose *Koliko
 * košta pogreb* got the page they asked for with the panel still over its
 * heading.
 *
 * That is an enhancement, not a dependency: with no JavaScript both still open
 * and close on click, which is the behaviour they had before.
 *
 * What remains: **neither closes on an outside click or on Escape.** Fixing
 * that needs listeners on the document, which is a real menu implementation,
 * and the thing a reader does next is almost always follow a link — which now
 * closes it.
 */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Logo className={styles.mark} />
          <span className={styles.wordmark}>Pogrebne usluge</span>
        </Link>

        {/* Desktop: the menu inline, groups behind their own disclosure. */}
        <nav className={styles.nav} aria-label="Glavni izbornik">
          {MENU.map((item) =>
            isNavGroup(item) ? (
              <NavDisclosure key={item.label} className={styles.group}>
                <summary className={styles.groupButton}>{item.label}</summary>
                <div className={styles.groupPanel}>
                  {item.items.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={styles.groupLink}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </NavDisclosure>
            ) : (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Mobile: the same links behind a JavaScript-free disclosure. */}
        <NavDisclosure className={styles.menu}>
          <summary className={styles.menuButton}>Izbornik</summary>
          <nav className={styles.menuPanel} aria-label="Izbornik">
            {MENU.map((item) =>
              isNavGroup(item) ? (
                <div key={item.label} className={styles.menuGroup}>
                  <p className={styles.menuGroupLabel}>{item.label}</p>
                  {item.items.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`${styles.menuLink} ${styles.menuChildLink}`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.menuLink}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </NavDisclosure>
      </div>
    </header>
  );
}
