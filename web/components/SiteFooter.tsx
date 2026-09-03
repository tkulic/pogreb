import Link from 'next/link';
import { Logo } from './Logo';
import { MENU, SOURCES } from '@/lib/nav';
import styles from './SiteFooter.module.css';

/**
 * The footer, on every page.
 *
 * It carries three things a directory in this category is normally missing, and
 * the missing ones are how a reader decides it is a content farm: where the
 * data came from, what the site will and will not do, and a way to reach
 * somebody about it.
 *
 * **The `Službeni izvori` column is the load-bearing one.** Those four are the
 * primary sources the guidance text is written against (SPEC_frontend.md →
 * Question 3b) plus the registry the listings are drawn from. A family that
 * needs the *procedure* rather than a provider should be able to leave for
 * gov.hr from any page — sending them to the source is the honest outcome, and
 * a portal that hoards the reader is the pattern this product is defined
 * against.
 *
 * They are plain outbound links: no third-party request is made until the
 * visitor chooses to leave, so the one-origin position is untouched
 * (SPEC.md → Project Structure). `rel="noreferrer"` keeps the visitor's path
 * through this site from being disclosed to those servers, the same posture
 * that keeps `events` free of a referrer column.
 *
 * **Nothing route-specific and nothing from the database**, exactly as the
 * retired rail required: no city, no count, no provider link. That is what
 * lets the root layout render it on every route without a query, and it is why
 * it cannot go stale or claim Split on a page about somewhere else.
 *
 * **No named owner and no copyright line.** Both would have to be invented
 * (SPEC.md → Never: fabricating data), and an invented legal entity in a
 * footer is worse than an absent one. It is tracked as a known gap, and it is
 * also what currently keeps `/za-pogrebnike` out of `MENU` — see
 * `PROVIDER_FORM_PUBLIC`.
 */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand}>
            <Logo className={styles.mark} />
            <span className={styles.wordmark}>Pogrebne usluge</span>
          </Link>
          <p className={styles.claim}>
            Besplatan popis registriranih pogrebnika, bez prijave i bez
            posrednika.
          </p>
          <p className={styles.note}>
            Nitko nam ne plaća za bolju poziciju i nitko nije izostavljen. Ne
            tražimo vaše podatke i ne prodajemo upite.
          </p>
        </div>

        <nav className={styles.col} aria-label="Stranice">
          <h2 className={styles.colHeading}>Stranice</h2>
          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Službeni izvori">
          <h2 className={styles.colHeading}>Službeni izvori</h2>
          {SOURCES.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={styles.baseline}>
        <p className={styles.baselineText}>
          Podaci su prikupljeni iz Sudskog registra i javno dostupnih izvora, i
          unose se ručno. Ne procjenjujemo kvalitetu, ne objavljujemo recenzije
          i ne navodimo cijene.
        </p>
      </div>
    </footer>
  );
}
