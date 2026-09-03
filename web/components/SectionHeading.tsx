import styles from './SectionHeading.module.css';

/**
 * A section heading with its count — `NAJBOLJE ODGOVARA · 4`.
 *
 * The count is required, not optional. SPEC_frontend.md → Guarantees: `N` is
 * stated in both headings so the reader can see the two blocks partition the
 * set rather than subset it. A heading without its count would quietly break
 * that guarantee, so the prop is not nullable.
 *
 * Renders an `<h2>`: one `<h1>` per page, section headings are `<h2>`.
 */
export function SectionHeading({
  children,
  count,
  quiet = false,
}: {
  children: React.ReactNode;
  count: number;
  quiet?: boolean;
}) {
  return (
    <h2 className={`${styles.heading} ${quiet ? styles.quiet : ''}`}>
      <span>{children}</span>
      <span className={styles.count} aria-hidden="true">
        ·
      </span>
      <span className={styles.count}>{count}</span>
    </h2>
  );
}
