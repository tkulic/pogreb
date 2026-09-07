import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { ProviderCard } from '@/components/ProviderCard';
import { SectionHeading } from '@/components/SectionHeading';
import { CATCHMENT, providerShare } from '@/lib/copy';
import {
  getCityBySlug,
  getCityProviders,
  getServiceBySlug,
  getServicePageParams,
} from '@/lib/queries';
import { rankProviders } from '@/lib/ranking';
import { openGraph } from '@/lib/seo';
import { breadcrumbs, providerItemList } from '@/lib/structured-data';
import styles from './service.module.css';

/**
 * An indexable, service-filtered listing — `/pogrebne-usluge/split/usluga/kremiranje`.
 *
 * The literal `usluga` segment is what makes the entity/service slug collision
 * **structurally impossible** rather than accidentally absent: it survives a
 * future provider named "Urne", which is the exact case that made the earlier
 * arrangement unguarded rather than merely unbroken.
 */

type PageProps = {
  params: Promise<{ grad: string; usluga: string }>;
};

/**
 * Which of these pages exist, decided from the data at build time.
 *
 * A page is generated only when the service has **≥3 providers in that city
 * and fewer than all of them** — below three it is thin content, and at
 * all-of-them it duplicates the city page under a different URL.
 *
 * `dynamicParams = false` is the half that makes the rule bite: without it,
 * every non-qualifying service would still render on demand, which is exactly
 * the thin content the rule exists to prevent. A slug outside this set 404s.
 */
export async function generateStaticParams() {
  return getServicePageParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { grad, usluga } = await params;
  const [city, service] = await Promise.all([
    getCityBySlug(grad),
    getServiceBySlug(usluga),
  ]);
  if (!city || !service) return {};

  const area = CATCHMENT[city.slug];
  const title = `${service.name} — ${area?.label ?? city.name}`;
  const description = `Pogrebnici koji nude uslugu "${service.name.toLowerCase()}" u ${area?.locative ?? city.name}.`;
  const path = `/pogrebne-usluge/${city.slug}/usluga/${service.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: openGraph({ title, description, path }),
  };
}

export default async function ServiceListingPage({ params }: PageProps) {
  const { grad, usluga } = await params;
  const [city, service] = await Promise.all([
    getCityBySlug(grad),
    getServiceBySlug(usluga),
  ]);
  if (!city || !service) notFound();

  const all = await getCityProviders(city.id);
  const offering = all.filter((p) => p.services.some((s) => s.slug === service.slug));

  // Defensive: generateStaticParams should never produce a slug that gets here
  // with nobody offering it.
  if (offering.length === 0) notFound();

  // Ranked with no flow answers — this page is reached from search, not from
  // the wizard, so there is no situacija to weight urgency by. Reason lines
  // are still composed, because "why this one" is useful however you arrived.
  const { shortlist, others } = rankProviders(offering, {});
  const ranked = [...shortlist, ...others];

  const catchment = CATCHMENT[city.slug];
  const areaLabel = catchment?.label ?? city.name;
  const areaLocative = catchment?.locative ?? city.name;
  const share = providerShare(offering.length, all.length);

  return (
    <main className={`page ${styles.page}`}>
      <JsonLd
        data={providerItemList(
          ranked.map((r) => r.provider),
          city.slug,
        )}
      />
      <JsonLd
        data={breadcrumbs([
          { name: 'Pogrebne usluge', path: '/' },
          { name: `Pogrebnici u ${areaLocative}`, path: `/pogrebne-usluge/${city.slug}` },
          {
            name: service.name,
            path: `/pogrebne-usluge/${city.slug}/usluga/${service.slug}`,
          },
        ])}
      />

      <Link href={`/pogrebne-usluge/${city.slug}`} className={styles.back}>
        ← Svi pogrebnici
      </Link>

      <header className={styles.header}>
        {/* Both lines inside the heading — see `service.module.css`. */}
        <h1 className={styles.title}>
          <span className={styles.titleName}>{service.name}</span>
          <span className={styles.city}>{areaLabel}</span>
        </h1>
        {/*
          A worded share, not two counts. "Ovu uslugu nudi šest pogrebnika od
          trinaest pogrebnika u Splitu i okolici" asked the reader to do
          arithmetic before the sentence meant anything, and it was correct only
          for as long as both numbers held. See `providerShare`.
        */}
        {share && (
          <p className={styles.lede}>
            Ovu uslugu u {areaLocative} nudi {share}.
          </p>
        )}
        {catchment && (
          <p className={styles.settlements}>
            Pogrebnici koji rade u {catchment.locative} —{' '}
            {catchment.settlements.join(', ')}.
          </p>
        )}
      </header>

      <section>
        <SectionHeading count={ranked.length}>Pogrebnici</SectionHeading>
        <ul className={styles.list}>
          {ranked.map((entry) => (
            <ProviderCard
              key={entry.provider.id}
              provider={entry.provider}
              reason={entry.reason}
              cityName={city.name}
              citySlug={city.slug}
              query=""
            />
          ))}
        </ul>
      </section>

      <footer className={styles.footer}>
        <p>
          Prikazujemo sve registrirane pogrebnike u {areaLocative} koji nude ovu
          uslugu. Nitko nam ne plaća za bolju poziciju.
        </p>
        <Link className={styles.footerLink} href="/kako-rangiramo">
          Kako rangiramo
        </Link>
        <Link className={styles.footerLink} href="/nase-obecanje">
          Naš credo
        </Link>
      </footer>
    </main>
  );
}
