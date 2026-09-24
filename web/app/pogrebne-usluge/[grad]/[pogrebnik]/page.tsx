import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AvailabilityMark } from '@/components/AvailabilityMark';
import { DetailViewLogger } from '@/components/DetailViewLogger';
import { EmailAction } from '@/components/EmailAction';
import { ExternalLink } from '@/components/ExternalLink';
import { FlowBackLink } from '@/components/FlowBackLink';
import { JsonLd } from '@/components/JsonLd';
import { OpenStatus } from '@/components/OpenStatus';
import { PhoneList } from '@/components/PhoneList';
import { AfterHoursNote, PrimaryCallAction } from '@/components/PrimaryCallAction';
import { CATCHMENT } from '@/lib/copy';
import { getCityBySlug, getProviderBySlug, getProviderPageParams } from '@/lib/queries';
import { openGraph } from '@/lib/seo';
import { breadcrumbs, funeralHome } from '@/lib/structured-data';
import type { WeekDay, WorkingHoursDay } from '@/lib/database.types';
import styles from './detail.module.css';

/**
 * **Statically rendered, revalidated hourly.** This page used to be
 * `force-dynamic` for two reasons, and neither survived inspection:
 *
 * 1. *Time-dependent* — the open-now badge and the dežurni-phone rule. Both
 *    are pure functions of the current time over static columns, so they moved
 *    into `OpenStatus` and `PrimaryCallAction` and now run in the browser.
 *    That is **more** accurate, not less: a per-request render is right for the
 *    instant it ran, a client computation is right for the moment the reader is
 *    looking.
 * 2. *Reads live data* — true, but that is what `revalidate` is for. Provider
 *    rows change when a migration runs, which is not per request.
 *
 * The cost of getting this wrong was the whole crawl. 55 uncacheable pages
 * meant every Googlebot fetch ran a function and hit the database; under
 * concurrency TTFB went from 0.8s to 4.4s, Google read that as a host that
 * could not take the load, and rescheduled — leaving 88 URLs in *Discovered –
 * currently not indexed* (`.seo/ANALYSIS_2026-09-24.md` → ROOT CAUSE).
 *
 * `dynamicParams` stays at its default of `true`, so a provider added to the
 * database renders on demand and is cached from then on, without a rebuild.
 */
export const revalidate = 3600;

/**
 * All 55 provider pages, prerendered at build.
 *
 * `revalidate` alone was not enough: a dynamic segment with no params to build
 * is rendered on demand, so the first crawl of each page would still have paid
 * full origin cost. Enumerating them means Googlebot meets a file on the CDN.
 */
export async function generateStaticParams() {
  return getProviderPageParams();
}

type PageProps = {
  params: Promise<{ grad: string; pogrebnik: string }>;
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

export default async function ProviderPage({ params }: PageProps) {
  const { grad, pogrebnik } = await params;
  const city = await getCityBySlug(grad);
  if (!city) notFound();

  const provider = await getProviderBySlug(city.id, pogrebnik);
  // Unknown slug → 404, never a redirect to the city page.
  if (!provider) notFound();

  const phones = provider.phones ?? [];
  // Whether there is a phone block at all is time-independent — the selection
  // rule returns null only for a provider holding no numbers. The *which* and
  // the after-hours note are decided in the browser; see PrimaryCallAction.
  const hasPhone = phones.length > 0;

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
          restart the flow. Read in the browser rather than from `searchParams`,
          which would make this whole route per-request — see `revalidate`
          above and FlowBackLink. */}
      <Suspense
        fallback={
          <Link href={`/pogrebne-usluge/${city.slug}`} className={styles.back}>
            ← Svi pogrebnici
          </Link>
        }
      >
        <FlowBackLink citySlug={city.slug} className={styles.back} />
      </Suspense>

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
        {(hasPhone || provider.email) && (
          <>
            <div className={styles.actions}>
              {hasPhone && (
                <PrimaryCallAction provider={provider} className={styles.action} />
              )}
              {provider.email && (
                <EmailAction
                  entityId={provider.id}
                  email={provider.email}
                  className={styles.action}
                />
              )}
            </div>
            <AfterHoursNote provider={provider} className={styles.afterHours} />
          </>
        )}

        {provider.address && (
          <p className={styles.address}>
            {provider.address}, {city.name}
          </p>
        )}

        {/* Absent when we hold no hours at all — no open/closed claim anywhere.
            Computed in the browser so a cached page cannot claim "otvoreno" at
            midnight; see OpenStatus. */}
        <OpenStatus provider={provider} className={styles.status} />
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
