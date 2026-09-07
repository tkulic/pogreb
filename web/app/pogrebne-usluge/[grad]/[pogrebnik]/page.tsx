import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionLink } from '@/components/ActionLink';
import { AvailabilityMark } from '@/components/AvailabilityMark';
import { DetailViewLogger } from '@/components/DetailViewLogger';
import { EmailAction } from '@/components/EmailAction';
import { ExternalLink } from '@/components/ExternalLink';
import { JsonLd } from '@/components/JsonLd';
import { PhoneIcon } from '@/components/PhoneIcon';
import { PhoneList } from '@/components/PhoneList';
import { answersToQuery, parseAnswers } from '@/lib/answers';
import { CATCHMENT } from '@/lib/copy';
import { openState, openStateLabel, selectDisplayPhone } from '@/lib/hours';
import { getCityBySlug, getProviderBySlug } from '@/lib/queries';
import { openGraph } from '@/lib/seo';
import { breadcrumbs, funeralHome } from '@/lib/structured-data';
import type { WeekDay, WorkingHoursDay } from '@/lib/database.types';
import styles from './detail.module.css';

/** Time-dependent (open-now, after-hours phone) and reads live data. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ grad: string; pogrebnik: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DAYS: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: 'pon' },
  { key: 'tue', label: 'uto' },
  { key: 'wed', label: 'sri' },
  { key: 'thu', label: 'čet' },
  { key: 'fri', label: 'pet' },
  { key: 'sat', label: 'sub' },
  { key: 'sun', label: 'ned' },
];

/**
 * How one day reads.
 *
 * Returns null for an absent day, and the caller drops the row entirely.
 * **An absent day means unknown and must never render as "zatvoreno"** —
 * wrongly telling a family a provider is closed is the worst failure this page
 * can produce, and the schema encodes the two as different things precisely so
 * we can tell them apart here.
 */
function dayLabel(day: WorkingHoursDay | undefined): string | null {
  if (!day) return null;
  if ('closed' in day && day.closed) return 'zatvoreno';
  if ('by_arrangement' in day && day.by_arrangement) return 'po dogovoru';
  if ('from' in day && 'to' in day) return `${day.from}–${day.to}`;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { grad, pogrebnik } = await params;
  const city = await getCityBySlug(grad);
  if (!city) return {};
  const provider = await getProviderBySlug(city.id, pogrebnik);
  if (!provider) return {};

  const area = CATCHMENT[city.slug]?.locative ?? city.name;
  const description = `${provider.name} — pogrebne usluge u ${area}. Kontakt, radno vrijeme i popis usluga.`;
  const path = `/pogrebne-usluge/${city.slug}/${provider.slug}`;

  return {
    title: provider.name,
    description,
    alternates: { canonical: path },
    openGraph: openGraph({ title: provider.name, description, path }),
  };
}

export default async function ProviderPage({ params, searchParams }: PageProps) {
  const { grad, pogrebnik } = await params;
  const [city, rawSearch] = await Promise.all([getCityBySlug(grad), searchParams]);
  if (!city) notFound();

  const provider = await getProviderBySlug(city.id, pogrebnik);
  // Unknown slug → 404, never a redirect to the city page.
  if (!provider) notFound();

  const answers = parseAnswers(rawSearch);
  const query = answersToQuery(answers);

  const selected = selectDisplayPhone(provider);
  const status = openStateLabel(openState(provider));
  const phones = provider.phones ?? [];

  const hourRows = provider.working_hours
    ? DAYS.map((d) => ({ ...d, value: dayLabel(provider.working_hours?.[d.key]) })).filter(
        (d): d is { key: WeekDay; label: string; value: string } => d.value !== null,
      )
    : [];

  return (
    <main className={`page ${styles.page}`}>
      {/*
        The business, as a business. Every field restates something this page
        already renders — name, address, phone, hours, services — so nothing
        here is a claim the reader cannot check. Null columns are omitted
        rather than filled in; see `lib/structured-data.ts` for what is
        deliberately absent and why.
      */}
      <JsonLd
        data={funeralHome(
          provider,
          city,
          provider.services.map((s) => s.name),
        )}
      />
      <JsonLd
        data={breadcrumbs([
          { name: 'Pogrebne usluge', path: '/' },
          {
            name: `Pogrebnici u ${CATCHMENT[city.slug]?.locative ?? city.name}`,
            path: `/pogrebne-usluge/${city.slug}`,
          },
          {
            name: provider.name,
            path: `/pogrebne-usluge/${city.slug}/${provider.slug}`,
          },
        ])}
      />

      {/*
        Logged from the client after mount, never during server render — see
        DetailViewLogger for why that distinction carries the whole integrity
        of this metric.
      */}
      <DetailViewLogger entityId={provider.id} />

      {/* Back to the results with the answers intact, so returning does not
          restart the flow. */}
      <Link href={`/pogrebne-usluge/${city.slug}${query}`} className={styles.back}>
        ← Svi pogrebnici
      </Link>

      <div className={styles.head}>
        <div className={styles.nameRow}>
          <h1 className={styles.name}>{provider.name}</h1>
          {provider.available_24_7 && <AvailabilityMark variant="filled" />}
        </div>

        {/*
          Two actions, side by side: call and e-mail.

          The e-mail action was previously a text link at the foot of the page,
          which put the second-most-likely thing a visitor wants below the
          opening hours. It is a CTA here and the address is still listed under
          `Kontakt`, so the button is the action and the address is the fact.

          Neither button reveals a number, unlike the shortlist card: every
          number is listed in full below, so there is nothing to reveal.

          The row collapses to one column on a phone — see `detail.module.css`.
        */}
        {(selected || provider.email) && (
          <>
            <div className={styles.actions}>
              {selected && (
                <ActionLink
                  variant="primary"
                  className={styles.action}
                  href={`tel:${selected.phone.number}`}
                >
                  <PhoneIcon />
                  Nazovite
                </ActionLink>
              )}
              {provider.email && (
                <EmailAction
                  entityId={provider.id}
                  email={provider.email}
                  className={styles.action}
                />
              )}
            </div>
            {selected?.isAfterHours && (
              <span className={styles.afterHours}>dežurni telefon</span>
            )}
          </>
        )}

        {provider.address && (
          <p className={styles.address}>
            {provider.address}, {city.name}
          </p>
        )}

        {/* Absent when we hold no hours at all — no open/closed claim anywhere. */}
        {status && <p className={styles.status}>{status}</p>}
      </div>

      {/*
        Kontakt holds every way to reach this provider directly: the numbers
        with their types, then the e-mail address on the same list, in the same
        shape. It used to sit in an unlabelled block after the opening hours,
        beside the website — which grouped it by "is a link" rather than by what
        a reader is looking for.
      */}
      {(phones.length > 0 || provider.email) && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Kontakt</h2>
          <PhoneList entityId={provider.id} phones={phones} />
          {provider.email && (
            <p className={styles.emailRow}>
              <ExternalLink
                entityId={provider.id}
                eventType="email_click"
                href={`mailto:${provider.email}?subject=${encodeURIComponent('Upit o pogrebnim uslugama')}`}
                className={styles.emailAddress}
              >
                {provider.email}
              </ExternalLink>
              <span className={styles.emailLabel}>e-mail</span>
            </p>
          )}
        </section>
      )}

      {provider.services.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Usluge</h2>
          <ul className={styles.services}>
            {provider.services.map((service) => (
              <li key={service.id} className={styles.service}>
                <span>{service.name}</span>
                {/* A price appears only where one is stored, and it was written
                    when the Split-only pilot had none. Whether any of the 45
                    providers now carries one has not been checked, so do not
                    read this as "renders for nobody" — `/nase-obecanje` is
                    worded to hold either way. */}
                {service.price_from !== null && (
                  <span className={styles.price}>
                    <span>
                      od {service.price_from} €
                      {service.price_to !== null && ` – ${service.price_to} €`}
                    </span>
                    <span className={styles.priceCaveat}>orijentacijski</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hourRows.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Radno vrijeme</h2>
          <ul className={styles.hours}>
            {hourRows.map((row) => (
              <li key={row.key} className={styles.hoursRow}>
                <span className={styles.day}>{row.label}</span>
                <span className={styles.times}>{row.value}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/*
        The website keeps its place after the opening hours — it is the last
        thing a visitor needs, and sending them off-site earlier would end the
        visit at the moment they were still deciding. What it gains is a heading
        of its own, so it reads as a section like the three above rather than as
        a loose link the page trails off into.
      */}
      {provider.website && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Web stranica</h2>
          <ExternalLink
            entityId={provider.id}
            eventType="website_click"
            href={provider.website}
            className={styles.link}
          >
            {provider.website.replace(/^https?:\/\//, '')}
          </ExternalLink>
        </section>
      )}

      {/*
        `last_verified_at` is deliberately not displayed, and no freshness claim
        of any kind appears — not even a soft one. With manual entry the date
        goes stale, a visible stale date damages trust more than no date, and an
        unverifiable reassurance is worse than both. The field stays internal,
        for data-quality triage.

        No map either: coordinates are null for all seven providers, and a
        mapping API would be a new external integration.
      */}
    </main>
  );
}
