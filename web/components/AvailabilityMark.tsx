import styles from './AvailabilityMark.module.css';

/**
 * The 24-hour mark, shown only when `entities.available_24_7` is true.
 *
 * Two variants, and the difference is weight rather than meaning: `filled` on
 * shortlist cards, `outlined` in the others block, which is reduced rather
 * than restyled.
 *
 * **It is never colour-only.** The text `24 SATA` is rendered, not implied —
 * so it survives a colour-blind reader, a monochrome print, and a font
 * failure. There is deliberately no icon variant and no aria-label standing in
 * for a visible word.
 */
export function AvailabilityMark({
  variant = 'filled',
}: {
  variant?: 'filled' | 'outlined';
}) {
  return (
    <span className={`${styles.base} ${styles[variant]}`}>24 sata</span>
  );
}
