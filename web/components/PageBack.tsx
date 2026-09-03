import Link from 'next/link';
import styles from './PageBack.module.css';

type PageBackProps = {
  /** Where "back" goes. */
  href: string;
  label: string;
  /** "2 / 3" in the flow. Omitted everywhere else. */
  step?: { current: number; total: number };
};

/**
 * The contextual back link, and the flow's step counter.
 *
 * Split out of `SiteHeader` when the masthead moved into the root layout: the
 * masthead is identical on every route, and this is the part that never can be
 * — it knows where the reader came from, which the layout does not.
 *
 * It stays a real `<Link>` to a known URL rather than `history.back()`, for the
 * reason the spec gives it as a numbered requirement: history can hold
 * anything, including another site, and a back control that sometimes leaves
 * the product is worse than none. It also keeps working with no JavaScript,
 * like the rest of the flow.
 */
export function PageBack({ href, label, step }: PageBackProps) {
  return (
    <div className={styles.bar}>
      <Link href={href} className={styles.back}>
        {label}
      </Link>
      {step ? (
        <span className={styles.step}>
          {step.current} / {step.total}
        </span>
      ) : null}
    </div>
  );
}
