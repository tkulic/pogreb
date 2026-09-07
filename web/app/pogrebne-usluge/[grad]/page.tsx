import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { ProviderCard } from '@/components/ProviderCard';
import { QuietProviderCard } from '@/components/QuietProviderCard';
import { SectionHeading } from '@/components/SectionHeading';
import { PageBack } from '@/components/PageBack';
import {
  answersToQuery,
  flowHref,
  isUnanswered,
  parseAnswers,
} from '@/lib/answers';
import { CATCHMENT, NACIN_LABEL, SITUACIJA_LABEL, coverageClaim } from '@/lib/copy';
import { getCityBySlug, getCityProviders } from '@/lib/queries';
import { rankProviders } from '@/lib/ranking';
import { openGraph } from '@/lib/seo';
import { breadcrumbs, providerItemList } from '@/lib/structured-data';
import { guidanceFor } from '@/lib/guidance';
import styles from './results.module.css';

/**
 * The results page — the destination of the flow, and the page the whole
 * product exists to render.
 *
 * **Dynamic, deliberately.** Two reasons, either of which would be enough: the
 * page reads live provider data, and the phone-selection rule depends on the
 * current time in Europe/Zagreb, so a cached render would hand a family the
 * office number at 3am.
 */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ grad: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  const title = `Pogrebnici u ${locative}`;
  const description = `Svi registrirani pogrebnici u ${locative}. Besplatno, bez prijave i bez posrednika.`;
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

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { grad } = await params;
  const [city, rawSearch] = await Promise.all([getCityBySlug(grad), searchParams]);

  // Unknown city → 404, not a redirect to something plausible.
  if (!city) notFound();

  const answers = parseAnswers(rawSearch);
  const query = answersToQuery(answers);

  // Back into the questions, with every answer still selected and this city
  // already chosen — `/${query}` used to land on the *landing page*, because a
  // query string with no `korak` is the landing page. Screen 3 is the right
  // destination: it is the last question, and screen 2 is already answered by
  // being here at all.
  const questionsHref = flowHref({ answers, grad: city.slug, korak: 'potrebe' });

  const providers = await getCityProviders(city.id);
  const { shortlist, others, noMatches } = rankProviders(providers, answers);

  const catchment = CATCHMENT[city.slug];
  const areaLabel = catchment?.label ?? city.name;
  // The form that follows "u". Stored, never derived — Croatian case endings
  // cannot be produced by string manipulation. See CATCHMENT.
  const areaLocative = catchment?.locative ?? city.name;
  const guidance = guidanceFor(answers);

  // Read back only what the user actually answered. `pokojnik` is deliberately
  // absent here: it changes guidance, not the list, so echoing it in a strip
  // about the list would misrepresent what it did.
  const chosen = [
    answers.situacija ? SITUACIJA_LABEL[answers.situacija] : null,
    answers.nacin ? NACIN_LABEL[answers.nacin] : null,
  ].filter((v): v is string => v !== null);

  return (
    <main className={`page ${styles.page}`}>
      {/*
        The list as the reader sees it, in the order the reader sees it —
        shortlist first, then the rest, which is exactly what `rankProviders`
        returned above. Handing a crawler a different order than the page shows
        would contradict `/kako-rangiramo`, which is the page that promises the
        ordering is explained rather than sold.
      */}
      <JsonLd
        data={providerItemList(
          [...shortlist, ...others].map((r) => r.provider),
          city.slug,
        )}
      />
      <JsonLd
        data={breadcrumbs([
          { name: 'Pogrebne usluge', path: '/' },
          { name: `Pogrebnici u ${areaLocative}`, path: `/pogrebne-usluge/${city.slug}` },
        ])}
      />

      <PageBack href={questionsHref} label="← Pitanja" />

      {/*
        The header is deliberately compact. Everything in it is orientation, and
        orientation should cost one glance — the cards are the page. The
        provider count that used to lead the context strip is gone: the section
        headings already carry `· N`, so it was the same number said three
        times, in the most prominent position on the page.
      */}
      <header className={styles.header}>
        {/*
          Both lines sit inside the `<h1>`, so the heading names the city rather
          than saying "Pogrebnici" on all seven pages. Rendered identically to
          the two-element version it replaces — see `results.module.css`.
        */}
        <h1 className={styles.title}>
          <span className={styles.titleName}>Pogrebnici</span>
          <span className={styles.city}>{areaLabel}</span>
        </h1>
        {/*
          The coverage claim, stated where the list is rather than only in the
          footer. It is the reason to trust this page over a search result, and
          it is count-free by decision — see `coverageClaim`. Neutrality
          ("nitko nam ne plaća") stays in the footer so the two claims are not
          said twice on one screen.
        */}
        <p className={styles.coverage}>{coverageClaim(areaLocative)}.</p>
        {chosen.length > 0 && (
          <p className={styles.chosen}>
            <span className={styles.chosenLabel}>odabrali ste</span>{' '}
            {chosen.join(' · ')}{' '}
            <Link className={styles.change} href={questionsHref}>
              promijenite
            </Link>
          </p>
        )}
        {isUnanswered(answers) && (
          <p className={styles.chosen}>
            <Link className={styles.change} href={questionsHref}>
              Odgovorite na dva pitanja
            </Link>{' '}
            i predložit ćemo koga kontaktirati prvog.
          </p>
        )}
      </header>

      {/*
        The shortlist block is omitted entirely when nothing matched — an empty
        heading would be worse than no heading. The page itself is never empty.
      */}
      {noMatches ? (
        <p className={styles.noMatches}>
          Nijedan pogrebnik u {areaLocative} ne nudi{' '}
          {answers.nacin ? NACIN_LABEL[answers.nacin].toLowerCase() : 'traženu uslugu'}.
          Prikazujemo sve.
        </p>
      ) : (
        shortlist.length > 0 && (
          <section className={styles.block}>
            <SectionHeading count={shortlist.length}>Najbolje odgovara</SectionHeading>
            <ul className={styles.list}>
              {shortlist.map((entry) => (
                <ProviderCard
                  key={entry.provider.id}
                  provider={entry.provider}
                  reason={entry.reason!}
                  cityName={city.name}
                  citySlug={city.slug}
                  query={query}
                />
              ))}
            </ul>
          </section>
        )
      )}

      {others.length > 0 && (
        <section className={styles.block}>
          <SectionHeading count={others.length} quiet>
            Ostali pogrebnici
          </SectionHeading>
          <ul className={styles.list}>
            {others.map((entry) => (
              <QuietProviderCard
                key={entry.provider.id}
                provider={entry.provider}
                cityName={city.name}
                citySlug={city.slug}
                query={query}
              />
            ))}
          </ul>
        </section>
      )}

      {/*
        Guidance sits *below* the providers, not above them.

        It is genuinely useful and it is honestly sourced, but a family that
        arrived here to find someone to call should meet the providers first.
        Above the list it pushed the product's actual service into second place
        and read as the page's main content; here it catches the reader who did
        not find what they needed in the list.
      */}
      {guidance && (
        <section className={styles.guidance} aria-label="Što učiniti prvo">
          <h2 className={styles.guidanceHeading}>Što učiniti prvo</h2>
          {guidance.lines.map((line) => (
            <p key={line} className={styles.guidanceText}>
              {line}
            </p>
          ))}
          <Link className={styles.footerLink} href="/sto-uciniti-prvo">
            Cijeli postupak
          </Link>
        </section>
      )}

      <footer className={styles.footer}>
        {/* Coverage is claimed in the header now; the footer carries what
            qualifies it — neutrality, the settlement list, and the rules. */}
        <p>Nitko nam ne plaća za bolju poziciju i nitko nije izostavljen.</p>
        <p className={styles.settlements}>
          {/* No verb — see Landing: the accusative would be "okolicu". */}
          {catchment ? `${areaLabel} — ${catchment.settlements.join(', ')}.` : null}
        </p>
        {/* Both links also sit in the desktop rail; on a phone this footer is
            the only route to them from the list. */}
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
