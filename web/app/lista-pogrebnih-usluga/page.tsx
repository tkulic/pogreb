import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageBack } from '@/components/PageBack';
import {
  answersToQuery,
  briefHref,
  parseAnswers,
  parseGrad,
  parseTrebam,
} from '@/lib/answers';
import { CATCHMENT } from '@/lib/copy';
import { resolveTicks, sheetServices } from '@/lib/brief';
import { getAllServices, getCities } from '@/lib/queries';
import { openGraph } from '@/lib/seo';
import { CANONICAL_SERVICE_ORDER } from '@/lib/services';
import { BriefSheet } from './BriefSheet';

/**
 * `/lista-pogrebnih-usluga` — the sheet a family carries to the funeral
 * director. SPEC_frontend.md → The list a family carries.
 *
 * **A top-level route taking `?grad=`, not a segment under the city.**
 * `/pogrebne-usluge/{grad}/lista` would sit in the same namespace as
 * `{pogrebnik}`, and the `usluga` segment exists precisely so that collision is
 * structurally impossible rather than accidentally absent. This page gains
 * nothing from a pretty path — it is never indexed.
 */

/** Today's date, and a service list that changes when the data does. */
export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * **`noindex` and an OpenGraph card are not in tension, and this page needs
 * both.**
 *
 * `noindex` is about search: the sheet is generated per family from query
 * state, so indexing it would offer a crawler a combinatorial set of
 * near-identical pages. The card is about messaging, and this is the single
 * most-shared page in the product by design — the share button is one of its
 * three actions. A shared link with no card of its own inherits the layout's,
 * which titles it *"Pogrebne usluge"* and points `og:url` at the site root:
 * the recipient sees a generic site card, or their client renders nothing and
 * leaves a bare string, which is what a plain-text URL looks like.
 *
 * `robots.txt` deliberately does not disallow this route — a disallowed URL is
 * never fetched, so the `noindex` would never be read *and* the messengers'
 * own fetchers, which honour `robots.txt` rather than the meta tag, would be
 * turned away from the card.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const rawSearch = await searchParams;
  const cities = await getCities();
  const grad = parseGrad(
    rawSearch.grad,
    cities.map((c) => c.slug),
  );
  const city = cities.find((c) => c.slug === grad);
  if (!city) return { robots: { index: false, follow: false } };

  const areaLocative = CATCHMENT[city.slug]?.locative ?? city.name;

  /**
   * **`absolute`, so the layout's `· Pogrebne usluge` template is skipped.**
   *
   * Every other route wants the brand appended, because the title is read in
   * a SERP or a browser tab where the site is not otherwise named. This one is
   * read in the header a browser prints at the top of the page — and the sheet
   * beneath it already carries the mark, `pogreb.net` and its own title, so
   * the template produced the site's name twice on one side of A4.
   */
  const title = 'Lista pogrebnih usluga';
  const description = `Popis pogrebnih usluga koje trebate, spreman za razgovor s pogrebnikom u ${areaLocative}.`;

  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    // Built by the helper, never inline: Next replaces the layout's openGraph
    // wholesale rather than merging into it. See lib/seo.ts.
    openGraph: openGraph({
      title,
      description,
      // The answers and the ticks belong in the shared URL — it is the sheet.
      path: briefHref({
        grad: city.slug,
        answers: parseAnswers(rawSearch),
        ticks: parseTrebam(rawSearch.trebam, CANONICAL_SERVICE_ORDER),
      }),
    }),
  };
}

export default async function BriefPage({ searchParams }: PageProps) {
  const rawSearch = await searchParams;
  const [cities, services] = await Promise.all([getCities(), getAllServices()]);

  const grad = parseGrad(
    rawSearch.grad,
    cities.map((c) => c.slug),
  );
  // The sheet says where, or it is not a sheet — every consumer of it, from
  // the heading to the proposed `city_events` row, is city-scoped. Absent and
  // unknown are treated alike, as the results page treats an unknown city.
  if (!grad) notFound();

  const city = cities.find((c) => c.slug === grad)!;
  const answers = parseAnswers(rawSearch);
  const parsed = parseTrebam(rawSearch.trebam, CANONICAL_SERVICE_ORDER);

  const { common, rare } = sheetServices(answers, services);
  const ticks = resolveTicks(answers, parsed);

  const catchment = CATCHMENT[city.slug];
  const areaLabel = catchment?.label ?? city.name;

  /**
   * Formatted on the server and passed down as a string.
   *
   * The client must not recompute it: the browser's timezone is not
   * Europe/Zagreb for a diaspora reader — which the search data says is a real
   * share of this audience — and a date that differs between the server render
   * and the hydration is a mismatch on the one line the sheet is dated by.
   */
  const date = new Intl.DateTimeFormat('hr-HR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Zagreb',
  }).format(new Date());

  return (
    <main className="page">
      <PageBack
        href={`/pogrebne-usluge/${city.slug}${answersToQuery(answers)}`}
        label="← Pogrebnici"
      />
      <BriefSheet
        grad={city.slug}
        cityId={city.id}
        areaLabel={areaLabel}
        answers={answers}
        common={common}
        rare={rare}
        initialTicks={ticks}
        date={date}
      />
    </main>
  );
}
