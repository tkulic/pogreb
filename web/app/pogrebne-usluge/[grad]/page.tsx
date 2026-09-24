import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { CityListing } from '@/components/CityListing';
import { CATCHMENT } from '@/lib/copy';
import { getCities, getCityBySlug, getCityProviders } from '@/lib/queries';
import { filtersAvailable, orderProviders } from '@/lib/listing';
import { openGraph } from '@/lib/seo';
import { breadcrumbs, providerItemList } from '@/lib/structured-data';
import styles from './results.module.css';

/**
 * A city's providers — the page the whole product exists to render.
 *
 * ## Statically rendered, and that is a search decision
 *
 * This page was `force-dynamic` until 2026-09-24, for two reasons that both
 * expired. The phone-selection rule depends on the current time, which now
 * runs in the browser (`ContactActions`); and the page read `searchParams` on
 * the server for ranking and guidance, which opts a route into per-request
 * rendering whatever `revalidate` says. **Removing ranking removed the last
 * server-side use of the answers**, so everything answer-dependent moved into
 * `CityListing` and the route became cacheable — the last uncached indexable
 * URLs on the site, on the page that draws the most impressions of any
 * (SPEC_frontend.md → Rendering).
 *
 * `generateStaticParams` is required, not optional: `revalidate` alone on a
 * dynamic segment leaves the route served on demand, so the first crawl of
 * each city still pays full origin cost.
 *
 * **What a crawler gets is the complete, unfiltered, alphabetical list** with
 * its `ItemList` — the same thing a reader with no JavaScript gets. The filter
 * narrows it afterwards, in the browser, on the reader's own instruction.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ grad: city.slug }));
}

type PageProps = {
  params: Promise<{ grad: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { grad } = await params;
  const city = await getCityBySlug(grad);
  if (!city) return {};

  const catchment = CATCHMENT[city.slug];
  const locative = catchment?.locative ?? city.name;

  // Not "Pogrebne usluge — …": the root layout's template appends
  // "· Pogrebne usluge", so that phrasing rendered the brand phrase twice in
  // one title and spent SERP width saying nothing the second time.
  //
  // **The title deliberately keeps "Pogrebnici" and was not widened.** The
  // 2026-09-14 search read is the reason the description below changed, and
  // the same data argues against touching this line: "pogrebnik" already
  // ranks 6–10, while the phrasing that ranks 55–64 is "pogrebno poduzeće".
  // Fitting both reads as "Pogrebnici i pogrebna poduzeća u Zagrebu i
  // okolici · Pogrebne usluge" — 68 characters, truncated in the SERP, and
  // stuffed. Trading a position that works for one that might is the wrong
  // bet at 27% query visibility, so the second phrasing goes in the
  // description and the page's own first line instead. The 4-week test this
  // records runs to ≈2026-10-12.
  const title = `Pogrebnici u ${locative}`;
  // Carries the two phrasings the title cannot: "pogrebna poduzeća" in the
  // nominative, and "pogrebne usluge" adjacent to the city name rather than
  // stranded after the template's separator. The completeness promise still
  // leads, because it is the reason to click this result over a directory.
  //
  // The three nouns are what a `ProviderRow` actually renders — services,
  // address, contact actions. "Radno vrijeme" was in an earlier draft and was
  // wrong: hours live on the provider detail page, one click further on. A
  // description that promises what the landed-on page does not show is a
  // bounce, and Google reads the bounce.
  const description = `Sva registrirana pogrebna poduzeća i obrti u ${locative}. Pogrebne usluge, adrese i kontakti — besplatno, bez prijave i bez posrednika.`;
  const path = `/pogrebne-usluge/${city.slug}`;

  return {
    title,
    description,
    // Filter state is not a canonical page: each combination points back at
    // the bare city page, and is excluded from the sitemap.
    alternates: { canonical: path },
    // Built by the helper, never inline: Next replaces the layout's openGraph
    // wholesale rather than merging into it. See lib/seo.ts.
    openGraph: openGraph({ title, description, path }),
  };
}

export default async function CityPage({ params }: PageProps) {
  const { grad } = await params;
  const city = await getCityBySlug(grad);

  // Unknown city → 404, not a redirect to something plausible.
  if (!city) notFound();

  const providers = await getCityProviders(city.id);
  // Alphabetical, complete, unfiltered -- what a crawler and a reader with no
  // JavaScript both get. `CityListing` re-orders and narrows it in the browser
  // if the reader asks.
  const listed = orderProviders(providers);

  const catchment = CATCHMENT[city.slug];
  const areaLabel = catchment?.label ?? city.name;
  // The form that follows "u". Stored, never derived — Croatian case endings
  // cannot be produced by string manipulation. See CATCHMENT.
  const areaLocative = catchment?.locative ?? city.name;

  return (
    <main className={`page ${styles.page}`}>
      {/*
        The list as the reader sees it, in the order the reader sees it —
        alphabetical, complete, unfiltered. Since 2026-09-24 that is trivially
        true rather than something to keep in step: there is one order, nothing
        is promoted, and the filter that narrows the page for a reader runs
        after this markup is served.
      */}
      <JsonLd data={providerItemList(listed, city.slug)} />
      <JsonLd
        data={breadcrumbs([
          { name: 'Pogrebne usluge', path: '/' },
          // Matches the visible trail word for word. Structured data that
          // describes a breadcrumb the page does not show is the state this
          // page was in until 2026-09-24, and it is what the markup is for.
          { name: areaLabel, path: `/pogrebne-usluge/${city.slug}` },
        ])}
      />

      {/*
        Everything that depends on the URL, in the browser — the header
        included, since the count and the funnel are both client state. It
        deliberately does not use `useSearchParams`: that would put a Suspense
        fallback in the served HTML where the provider list should be. See
        `CityListing`.
      */}
      <CityListing
        providers={listed}
        citySlug={city.slug}
        areaLabel={areaLabel}
        areaLocative={areaLocative}
        filtersAvailable={filtersAvailable(providers.length)}
      />

      <footer className={styles.footer}>
        {/*
          The coverage summary and the settlement list, as one sentence
          (owner, 2026-09-24). They were two separate things in two places —
          a claim under the heading and a bare list at the foot — and neither
          said what the other was for. Together they read as what they are:
          what this page shows, and where.

          It is the footer rather than the header because it qualifies the
          list; the heading and the rows come first.
        */}
        <p>
          Prikazujemo registrirane pogrebnike u {areaLocative}
          {catchment ? `: ${catchment.settlements.join(', ')}.` : '.'}
        </p>
        <p>
          Ne rangiramo pogrebnike. Popis je abecedni, nitko nam ne plaća za
          poziciju i nitko nije izostavljen.
        </p>
        <Link className={styles.footerLink} href="/nase-obecanje">
          Naš credo
        </Link>
      </footer>
    </main>
  );
}
