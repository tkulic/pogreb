import type { ProviderService } from '@/lib/queries';
import styles from './ServicesDisclosure.module.css';

/**
 * The provider's services, collapsed behind a quiet disclosure.
 *
 * **A `<details>` element, not a modal, and the reason is search rather than
 * taste.** Service names are the keywords the `/usluga/{slug}` listings rank
 * on, and `<details>` keeps every one of them in the served HTML whether it is
 * open or shut — a crawler reads the lot. A dialog populated on click can lose
 * them from the page entirely, on exactly the pages that most need indexing
 * (`.seo/ANALYSIS_2026-09-24.md` → Coverage). Three lesser reasons agree: the
 * masthead already discloses this way, it works with no JavaScript, and taking
 * the whole screen away from a bereaved reader to answer "what do they offer"
 * is out of proportion to the question.
 *
 * **Collapsed by default, because the card had to get shorter.** Every service
 * used to render inline, which ran to three or four wrapped lines. That was
 * the right call when the page showed four shortlisted providers; at seventeen
 * in one list it is what stops a family scanning the list at all.
 *
 * It shares the row's third line with the actions rather than occupying a line
 * of its own — as a 44px row it spent ~750px of a Zagreb page on a control
 * nobody had asked to open.
 *
 * **The count is in the summary on purpose.** It is the part worth seeing
 * without opening anything: nine services against two is a real difference
 * between two businesses, readable at a glance and without our characterising
 * it.
 */
export function ServicesDisclosure({ services }: { services: ProviderService[] }) {
  // Nothing to disclose, and `Usluge (0)` would be worse than silence — five of
  // Zagreb's seventeen providers have no service rows at all, which is a gap in
  // our research rather than a fact about them.
  if (services.length === 0) return null;

  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        Usluge <span className={styles.count}>({services.length})</span>
      </summary>
      <p className={styles.services}>
        {services.map((s) => s.name).join(' · ')}
      </p>
    </details>
  );
}
