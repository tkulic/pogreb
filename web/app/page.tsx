import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionLink } from '@/components/ActionLink';
import { Landing } from '@/components/Landing';
import { OptionTile } from '@/components/OptionTile';
import { SiteHeader } from '@/components/SiteHeader';
import { answersToQuery, parseAnswers, type FlowAnswers } from '@/lib/answers';
import {
  CATCHMENT,
  NACIN_LABEL,
  POKOJNIK_LABEL,
  SITUACIJA_LABEL,
  VISIBLE_SITUACIJA,
} from '@/lib/copy';
import { getCities, getCityProviders } from '@/lib/queries';
import styles from './flow.module.css';

/**
 * The landing page and the question flow, on one route.
 *
 * `/` is the landing page. `/?korak=…` is the flow. Keeping both here means
 * the flow's answers stay in the query string of a single route rather than
 * needing a second Croatian route tree that the spec never defined.
 *
 * **No client JavaScript in the flow.** Every answer is a `<Link>` that writes
 * the answer into the URL, so the whole thing is server-rendered: Back works
 * natively and preserves answers, every intermediate state is shareable,
 * refresh is safe, and no validation error is possible because nothing is
 * typed and nothing is required.
 */
export const metadata: Metadata = {
  title: 'Pogrebne usluge — Split i okolica',
  description:
    'Popis svih registriranih pogrebnika u Splitu i okolici. Besplatno, bez ' +
    'prijave i bez posrednika.',
};

type Korak = 'situacija' | 'mjesto' | 'potrebe';

const STEP_NUMBER: Record<Korak, number> = { situacija: 1, mjesto: 2, potrebe: 3 };
const STEP_TOTAL = 3;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** `?korak=` absent → the landing page. Anything unexpected → the first step. */
function parseKorak(value: string | string[] | undefined): Korak | null {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === undefined) return null;
  return v === 'mjesto' || v === 'potrebe' ? v : 'situacija';
}

/** A link to this same flow with one answer changed, added or cleared. */
function step(answers: FlowAnswers, korak: Korak, patch: Partial<FlowAnswers> = {}) {
  const next: FlowAnswers = { ...answers, ...patch };
  // An explicit `undefined` in the patch means "I don't know" — clear it.
  for (const key of Object.keys(patch) as (keyof FlowAnswers)[]) {
    if (patch[key] === undefined) delete next[key];
  }
  const query = answersToQuery(next);
  return `/${query}${query ? '&' : '?'}korak=${korak}`;
}

export default async function HomePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const answers = parseAnswers(raw);
  const korak = parseKorak(raw.korak);
  const query = answersToQuery(answers);

  const cities = await getCities();
  // With one city, screen 2 is a single button. It becomes a real choice at
  // city #2 and a text input only when the settlement count makes buttons
  // impractical.
  const pilot = cities[0];
  const catchment = pilot ? CATCHMENT[pilot.slug] : undefined;

  if (korak === null) {
    const providers = pilot ? await getCityProviders(pilot.id) : [];
    return <Landing city={pilot} providerTotal={providers.length} />;
  }

  const resultsHref = pilot ? `/pogrebne-usluge/${pilot.slug}${query}` : '/';

  // Back goes to the previous step, or out of the flow to the landing page.
  const back =
    korak === 'situacija'
      ? { href: '/', label: '← Naslovnica' }
      : {
          href: step(answers, korak === 'potrebe' ? 'mjesto' : 'situacija'),
          label: '← Natrag',
        };

  return (
    <main className={`page ${styles.screen}`}>
      <SiteHeader back={back} step={{ current: STEP_NUMBER[korak], total: STEP_TOTAL }} />

      {korak === 'situacija' && (
        <>
          <div className={styles.question}>
            <h1 className={styles.title}>Što se dogodilo?</h1>
          </div>
          <div className={styles.options}>
            {VISIBLE_SITUACIJA.map((value) => (
              <OptionTile
                key={value}
                href={step(answers, 'mjesto', { situacija: value })}
                selected={answers.situacija === value}
              >
                {SITUACIJA_LABEL[value]}
              </OptionTile>
            ))}
          </div>
        </>
      )}

      {korak === 'mjesto' && (
        <>
          <div className={styles.question}>
            <h1 className={styles.title}>Gdje je pogreb?</h1>
            <p className={styles.hint}>obično u mjestu gdje je osoba preminula</p>
          </div>
          <div className={styles.options}>
            {cities.map((city) => (
              <OptionTile key={city.id} href={step(answers, 'potrebe')}>
                {CATCHMENT[city.slug]?.label ?? city.name}
              </OptionTile>
            ))}
          </div>
          {catchment && (
            <p className={styles.settlements}>
              Pogrebnici koji rade u {catchment.locative} —{' '}
              {catchment.settlements.join(', ')}.
            </p>
          )}
        </>
      )}

      {korak === 'potrebe' && (
        <>
          <div className={styles.section}>
            <div className={styles.question}>
              <h1 className={styles.title}>Kremiranje ili ukop?</h1>
            </div>
            <div className={styles.options}>
              {(['kremiranje', 'ukop'] as const).map((value) => (
                <OptionTile
                  key={value}
                  href={step(answers, 'potrebe', { nacin: value })}
                  selected={answers.nacin === value}
                >
                  {NACIN_LABEL[value]}
                </OptionTile>
              ))}
              {/* Every question carries an explicit escape. */}
              <OptionTile href={step(answers, 'potrebe', { nacin: undefined })} quiet>
                Još ne znam
              </OptionTile>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.subTitle}>Gdje je pokojnik sada?</h2>
            <div className={styles.options}>
              {(['kuca', 'bolnica', 'dom', 'inozemstvo'] as const).map((value) => (
                <OptionTile
                  key={value}
                  href={step(answers, 'potrebe', { pokojnik: value })}
                  selected={answers.pokojnik === value}
                >
                  {POKOJNIK_LABEL[value]}
                </OptionTile>
              ))}
              <OptionTile href={step(answers, 'potrebe', { pokojnik: undefined })} quiet>
                Ne znam
              </OptionTile>
            </div>
          </div>

          <ActionLink variant="primary" href={resultsHref} fullWidth>
            Prikažite pogrebnike
          </ActionLink>
        </>
      )}

      <div className={styles.spacer} />

      <div className={styles.foot}>
        {/*
          The bypass. Someone who does not want to be led must always be one tap
          from the list, on every screen.
        */}
        <Link href={pilot ? `/pogrebne-usluge/${pilot.slug}` : '/'} className={styles.bypass}>
          Preskočite pitanja i prikažite sve pogrebnike
        </Link>
      </div>
    </main>
  );
}
