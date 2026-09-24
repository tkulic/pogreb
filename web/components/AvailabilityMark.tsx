import styles from './AvailabilityMark.module.css';

/**
 * The round-the-clock mark, shown only when `entities.available_24_7` is true.
 *
 * **`0–24` in a list, `Dostupni 0–24` on the detail page.** The same fact
 * used to appear twice on one card — once here and once as a clause of the
 * reason line — so the clause went and the mark took its wording. In a row it
 * then had to share a line with a name of up to 37 characters, which the long
 * form cannot do at 360px; the detail page has the width and uses the sentence.
 *
 * **It is never colour-only.** The characters are rendered, not implied — so
 * the mark survives a colour-blind reader, a monochrome print and a font
 * failure. There is deliberately no icon variant and no aria-label standing in
 * for a visible word.
 */
export function AvailabilityMark({ long = false }: { long?: boolean }) {
  return (
    <span className={styles.base}>{long ? 'Dostupni 0–24' : '0–24'}</span>
  );
}
