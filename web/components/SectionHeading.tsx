import styles from './SectionHeading.module.css';

/**
 * A section heading with its count — `POGREBNICI · 13`.
 *
 * The count is required, not optional. SPEC_frontend.md → Guarantees: `N` is
 * stated so the reader can see that what is on screen is the whole of what the
 * heading claims. A heading without its count would quietly break that
 * guarantee, so the prop is not nullable.
 *
 * Since 2026-09-24 only the service listings use it: the city page states its
 * count in the header instead, beside the funnel that changes it.
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
