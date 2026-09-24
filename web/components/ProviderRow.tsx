import Link from 'next/link';
import { AvailabilityMark } from './AvailabilityMark';
import { RowActions } from './RowActions';
import { ServicesDisclosure } from './ServicesDisclosure';
import type { Provider } from '@/lib/queries';
import styles from './ProviderRow.module.css';

/**
 * One provider, as a row in a list.
 *
 * **It was `ProviderCard` until 2026-09-24, and the rename is the change.**
 * The card ran to ~256px — name, mark, address, reason line, three full-width
 * contact buttons and a 44px services row — so a phone showed three providers
 * of Zagreb's seventeen and the list read as a wall. Three lines and an icon
 * cluster bring that to ~86px and six or seven per screen.
 *
 * Three lines, in this order:
 *
 * 1. **Name** (the link to the detail page) and the `0–24` mark.
 * 2. **Address**, deliberately without the city — the `<h1>` already names it,
 *    and appending it cost eight characters on every row to say nothing. It
 *    still carries the settlement where one is stored (*"Gaj 37, Lučko"*),
 *    which is the part a reader actually needs.
 * 3. **Services disclosure** and the actions.
 *
 * **The gold reason line is gone.** It had stopped working where it was needed
 * most: 2 of 17 rows in Zagreb carried one, because the rare-service rule
 * cannot fire in a large list and the availability clause is suppressed
 * whenever the mark already says it. A decoration that appears on an eighth of
 * the rows is not structure.
 */
export function ProviderRow({
  provider,
  citySlug,
  query,
}: {
  provider: Provider;
  citySlug: string;
  /** Preserved on the detail link so returning does not restart the flow. */
  query: string;
}) {
  const detailHref = `/pogrebne-usluge/${citySlug}/${provider.slug}${query}`;

  return (
    <li className={styles.row}>
      <span className={styles.head}>
        <Link href={detailHref} className={styles.name}>
          {provider.name}
        </Link>
        {provider.available_24_7 && <AvailabilityMark />}
      </span>

      {provider.address && <span className={styles.address}>{provider.address}</span>}

      <span className={styles.foot}>
        <ServicesDisclosure services={provider.services} />
        <RowActions provider={provider} detailHref={detailHref} />
      </span>
    </li>
  );
}
