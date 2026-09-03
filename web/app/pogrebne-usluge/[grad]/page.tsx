import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProviderCard } from '@/components/ProviderCard';
import { QuietProviderCard } from '@/components/QuietProviderCard';
import { SectionHeading } from '@/components/SectionHeading';
import { SiteHeader } from '@/components/SiteHeader';
import { answersToQuery, isUnanswered, parseAnswers } from '@/lib/answers';
import { CATCHMENT, NACIN_LABEL, SITUACIJA_LABEL } from '@/lib/copy';
import { getCityBySlug, getCityProviders } from '@/lib/queries';
import { rankProviders } from '@/lib/ranking';
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
  const area = catchment?.label ?? city.name;
  const locative = catchment?.locative ?? city.name;

  return {
    title: `Pogrebne usluge — ${area}`,
    description: `Svi registrirani pogrebnici u ${locative}. Besplatno, bez prijave i bez posrednika.`,
    // Filter state is not a canonical page: each combination points back at
    // the bare city page, and is excluded from the sitemap.
    alternates: { canonical: `/pogrebne-usluge/${city.slug}` },
  };
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { grad } = await params;
  const [city, rawSearch] = await Promise.all([getCityBySlug(grad), searchParams]);

  // Unknown city → 404, not a redirect to something plausible.
  if (!city) notFound();

  const answers = parseAnswers(rawSearch);
  const query = answersToQuery(answers);

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
      <SiteHeader back={{ href: `/${query}`, label: '← Pitanja' }} />

      {/*
        The header is deliberately compact. Everything in it is orientation, and
        orientation should cost one glance — the cards are the page. The
        provider count that used to lead the context strip is gone: the section
        headings already carry `· N`, so it was the same number said three
        times, in the most prominent position on the page.
      */}
      <header className={styles.header}>
        <h1 className={styles.title}>Pogrebnici</h1>
        <p className={styles.city}>{areaLabel}</p>
        {chosen.length > 0 && (
          <p className={styles.chosen}>
            <span className={styles.chosenLabel}>odabrali ste</span>{' '}
            {chosen.join(' · ')}{' '}
            <Link className={styles.change} href={`/${query}`}>
              promijenite
            </Link>
          </p>
        )}
        {isUnanswered(answers) && (
          <p className={styles.chosen}>
            <Link className={styles.change} href={`/${query}`}>
              Odgovorite na dva pitanja
            </Link>{' '}
            i predložit ćemo koga nazvati prvog.
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
        <p>
          Prikazujemo sve registrirane pogrebnike u {areaLocative}. Nitko nam ne
          plaća za bolju poziciju.
        </p>
        <p className={styles.settlements}>
          {/* No verb — see Landing: the accusative would be "okolicu". */}
          {catchment ? `${areaLabel} — ${catchment.settlements.join(', ')}.` : null}
        </p>
        <Link className={styles.footerLink} href="/kako-rangiramo">
          Kako rangiramo
        </Link>
      </footer>
    </main>
  );
}
