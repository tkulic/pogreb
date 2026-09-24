'use client';

import { FILTERS, type Filter } from '@/lib/listing';
import styles from './ListingFilters.module.css';

const LABEL: Record<Filter, string> = {
  kremiranje: 'Kremiranje',
  inozemstvo: 'Pokojnik je u inozemstvu',
  dokumentacija: 'Pomoć oko dokumentacije',
};

/**
 * The filter panel, behind the masthead's funnel.
 *
 * ## Checkboxes, not chips
 *
 * These are independent options combined with AND, which is precisely what a
 * checkbox group is; a row of toggle buttons was pretending to be one. Three
 * consequences follow and all three are improvements: the full wording fits
 * because each option owns a line, the counts align into a column that can be
 * read as a set, and the control loses the border-and-padding chrome that made
 * four options look like a control panel.
 *
 * ## The counts are conditional
 *
 * Each number is what that filter **would** leave given what is already
 * ticked, not the city's total for it. Zagreb's three stand at 5, 7 and 3
 * individually and at **one** together — unconditional counts would show three
 * reassuring numbers on the way to a list of one. Counting against the current
 * selection means every state a reader reaches was reached through a number
 * they saw first.
 *
 * ## The last checkbox sorts rather than filters
 *
 * It is worded *"Prvo prikaži…"* — show first — rather than naming the
 * condition, because below a hairline among three filters, `Dostupni 0–24`
 * would read as a fourth filter. A checkbox is also the honest control for it:
 * a sort the reader ticks is visibly their instruction, where a ranking we
 * applied was not.
 *
 * ## Rows are 36px, under the 44px guidance, deliberately
 *
 * The rows tile with no dead space and run the full width of the column, so
 * each target is roughly 346 × 36 ≈ 12,500px² against the ~1,900px² a 44×44
 * square guarantees. It is a larger target, not a smaller one.
 */
export function ListingFilters({
  active,
  counts,
  availabilityFirst,
  onToggleFilter,
  onToggleOrder,
}: {
  active: readonly Filter[];
  counts: Record<Filter, number>;
  availabilityFirst: boolean;
  onToggleFilter: (filter: Filter) => void;
  onToggleOrder: () => void;
}) {
  return (
    <div className={styles.panel}>
      {FILTERS.map((filter) => (
        <label key={filter} className={styles.option}>
          <input
            type="checkbox"
            className={styles.box}
            checked={active.includes(filter)}
            onChange={() => onToggleFilter(filter)}
          />
          <span className={styles.label}>{LABEL[filter]}</span>
          <span className={styles.count}>{counts[filter]}</span>
        </label>
      ))}

      <span className={styles.divider} />

      <label className={styles.option}>
        <input
          type="checkbox"
          className={styles.box}
          checked={availabilityFirst}
          onChange={onToggleOrder}
        />
        <span className={styles.label}>Prvo prikaži dostupne 0–24</span>
      </label>
    </div>
  );
}
