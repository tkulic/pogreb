import Link from 'next/link';
import { AvailabilityMark } from './AvailabilityMark';
import type { Provider } from '@/lib/queries';
import styles from './QuietProviderCard.module.css';

/**
 * An others-block card: name, address, and the 24-hour mark outlined rather
 * than filled.
 *
 * The whole card is one link. There is deliberately **no contact action and no
 * visible number or email address** here — see the module CSS for why that
 * costs a tap and buys two things worth more than the tap.
 */
export function QuietProviderCard({
  provider,
  cityName,
  citySlug,
  query,
}: {
  provider: Provider;
  cityName: string;
  citySlug: string;
  query: string;
}) {
  return (
    <li className={styles.card}>
      <Link
        href={`/pogrebne-usluge/${citySlug}/${provider.slug}${query}`}
        className={styles.link}
      >
        <span className={styles.text}>
          <span className={styles.name}>{provider.name}</span>
          {provider.address && (
            <span className={styles.address}>
              {provider.address}, {cityName}
            </span>
          )}
        </span>
        {provider.available_24_7 && <AvailabilityMark variant="outlined" />}
      </Link>
    </li>
  );
}
