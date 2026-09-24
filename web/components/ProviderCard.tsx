import Link from 'next/link';
import { AvailabilityMark } from './AvailabilityMark';
import { ContactActions } from './ContactActions';
import type { Provider } from '@/lib/queries';
import styles from './ProviderCard.module.css';

type ProviderCardProps = {
  provider: Provider;
  /**
   * Mandatory on a shortlist card — a card that cannot say why it is there does
   * not belong there, and `rankProviders` enforces that by dropping such a
   * provider into the others block. It is nullable only for the service
   * listing pages, which are not a shortlist: every provider on one is there
   * for the single stated reason that they offer the service in the heading.
   */
  reason: string | null;
  cityName: string;
  citySlug: string;
  /** Preserved on the detail link so returning does not restart the flow. */
  query: string;
};

/**
 * A shortlist card.
 *
 * Order is fixed by SPEC_frontend.md → Card anatomy: name, 24-hour mark,
 * address, reason line, service list, contact actions. The reason line is
 * required rather than optional, which is why it is a plain `string` here —
 * the ranking function drops a provider from the shortlist when it cannot
 * compose one.
 */
export function ProviderCard({
  provider,
  reason,
  cityName,
  citySlug,
  query,
}: ProviderCardProps) {
  const detailHref = `/pogrebne-usluge/${citySlug}/${provider.slug}${query}`;

  return (
    <li className={styles.card}>
      <div className={styles.head}>
        <Link href={detailHref} className={styles.name}>
          {provider.name}
        </Link>
        {provider.available_24_7 && <AvailabilityMark variant="filled" />}
      </div>

      {provider.address && (
        <p className={styles.address}>
          {provider.address}, {cityName}
        </p>
      )}

      {reason && <p className={styles.reason}>{reason}</p>}

      {provider.services.length > 0 && (
        <p className={styles.services}>
          {provider.services.map((s) => s.name).join(' · ')}
        </p>
      )}

      {/*
        The raw fields go in, not a chosen number: the dežurni rule depends on
        the current time, so it runs in the browser. On these statically
        prerendered service listings a server-side choice would have frozen at
        build time — see ContactActions.
      */}
      <ContactActions
        entityId={provider.id}
        provider={provider}
        email={provider.email}
        detailHref={detailHref}
      />
    </li>
  );
}
