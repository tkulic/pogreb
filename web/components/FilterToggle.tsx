'use client';

import styles from './FilterToggle.module.css';

/**
 * The funnel that opens the filter panel.
 *
 * **Only rendered where the city has more than `FILTERS_MIN_PROVIDERS`
 * providers**, which today is Zagreb and Split. A filter exists because the
 * list is too long to scan; a list you can see all of is not too long, and a
 * control that narrows four rows to one is noise.
 *
 * It carries its own state in the icon rather than in a label: filled while
 * open, and with a count when something is active, so a reader who scrolled
 * past the header can still tell the list has been narrowed. A funnel is one
 * of the few glyphs that survives having no tooltip, which matters at 73%
 * mobile traffic — but it still carries an `aria-label`, since the glyph is
 * decoration to a screen reader.
 */
export function FilterToggle({
  open,
  activeCount,
  onToggle,
}: {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${open ? styles.open : ''}`}
      aria-expanded={open}
      aria-label={open ? 'Zatvorite filtre' : 'Suzite popis'}
      onClick={onToggle}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 5.5h16l-6.2 7.3v5.6l-3.6 2.1v-7.7L4 5.5Z" />
      </svg>
      {activeCount > 0 && <span className={styles.count}>{activeCount}</span>}
    </button>
  );
}
