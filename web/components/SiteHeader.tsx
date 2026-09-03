import Link from 'next/link';
import styles from './SiteHeader.module.css';

type SiteHeaderProps = {
  /** Where "back" goes. Omitted on the landing page, which has nowhere back. */
  back?: { href: string; label: string };
  /** "2 / 3" in the flow. Omitted everywhere else. */
  step?: { current: number; total: number };
};

/**
 * The header on every page.
 *
 * It exists because the product previously had no way home and no way between
 * steps except the browser's own Back button. Two things only: the wordmark,
 * which always returns to the landing page, and a contextual back link.
 *
 * The back link is a real `<Link>` to a known URL rather than
 * `router.back()` — history could hold anything, including another site, and
 * a back control that sometimes leaves the product is worse than none. It also
 * means the whole header works with no JavaScript.
 */
export function SiteHeader({ back, step }: SiteHeaderProps) {
  // On a desktop viewport the rail carries the wordmark, so a header holding
  // nothing else has nothing left to show and hides itself rather than leaving
  // an empty ruled bar above the page's own heading.
  const bare = !back && !step;

  return (
    <header className={bare ? `${styles.header} ${styles.bare}` : styles.header}>
      <Link href="/" className={styles.wordmark}>
        Pogrebne usluge
      </Link>

      {step ? (
        <span className={styles.step}>
          {step.current} / {step.total}
        </span>
      ) : null}

      {back ? (
        <Link href={back.href} className={styles.back}>
          {back.label}
        </Link>
      ) : null}
    </header>
  );
}
