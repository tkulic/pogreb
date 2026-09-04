import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Landing } from '@/components/Landing';
import { OptionTile } from '@/components/OptionTile';
import { PageBack } from '@/components/PageBack';
import {
  flowHref,
  parseAnswers,
  parseGrad,
  parseKorak,
  resultsHref,
  type FlowAnswers,
  type Korak,
} from '@/lib/answers';
import {
  CATCHMENT,
  NACIN_LABEL,
  SITUACIJA_LABEL,
  VISIBLE_SITUACIJA,
} from '@/lib/copy';
import { getCityCoverage } from '@/lib/queries';
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
 *
 * **Screen 2 became a real question with the city expansion**, exactly as the
 * spec predicted it would at city #2. It was a single button over one city, and
 * the answer was thrown away because there was nothing to remember — the flow
 * then sent everyone to `cities[0]`. With seven cities that silently routed a
 * family who chose Zagreb to the Dubrovnik listing, so the chosen city is now
 * carried in the URL like every other answer (`parseGrad`, `flowHref`).
 */
export const metadata: Metadata = {
  title: 'Pogrebne usluge — svi registrirani pogrebnici',
  description:
    'Popis svih registriranih pogrebnika u Zagrebu, Splitu, Rijeci, Osijeku, ' +
    'Zadru, Puli i Dubrovniku. Besplatno, bez prijave i bez posrednika.',
};

const STEP_NUMBER: Record<Korak, number> = { situacija: 1, mjesto: 2, potrebe: 3 };
const STEP_TOTAL = 3;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const answers = parseAnswers(raw);
  const korak = parseKorak(raw.korak);

  // One query serving both branches: the landing page needs the coverage list,
  // and the flow needs the same cities for screen 2 and to validate `?grad=`.
  const cities = await getCityCoverage();
  const grad = parseGrad(
    raw.grad,
    cities.map((c) => c.slug),
  );

  if (korak === null) return <Landing cities={cities} />;

  /** A link to this same flow with one answer changed, added or cleared. */
  const step = (korakTo: Korak, patch: Partial<FlowAnswers> = {}, gradTo = grad) => {
    const next: FlowAnswers = { ...answers, ...patch };
    // An explicit `undefined` in the patch means "I don't know" — clear it.
    for (const key of Object.keys(patch) as (keyof FlowAnswers)[]) {
      if (patch[key] === undefined) delete next[key];
    }
    return flowHref({ answers: next, grad: gradTo, korak: korakTo });
  };

  // Screen 2 is the one mandatory screen, so screen 3 cannot be rendered
  // without it. This is not a validation error — nothing was typed and nothing
  // is wrong — it simply puts the reader on the question that has to be
  // answered. It also catches a shared link made before `?grad=` existed.
  if (korak === 'potrebe' && !grad) {
    redirect(flowHref({ answers, korak: 'mjesto' }));
  }

  const catchment = grad ? CATCHMENT[grad] : undefined;
  const chosen = grad ? cities.find((c) => c.slug === grad) : undefined;

  // Back goes to the previous step, or out of the flow to the landing page.
  const back =
    korak === 'situacija'
      ? { href: '/', label: '← Naslovnica' }
      : {
          href: step(korak === 'potrebe' ? 'mjesto' : 'situacija'),
          label: '← Natrag',
        };

  return (
    <main className={`page ${styles.screen}`}>
      <PageBack
        href={back.href}
        label={back.label}
        step={{ current: STEP_NUMBER[korak], total: STEP_TOTAL }}
      />

      {korak === 'situacija' && (
        <>
          <div className={styles.question}>
            <h1 className={styles.title}>Što se dogodilo?</h1>
          </div>
          <div className={styles.options}>
            {VISIBLE_SITUACIJA.map((value) => (
              <OptionTile
                key={value}
                href={step('mjesto', { situacija: value })}
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
              <OptionTile
                key={city.id}
                href={step('potrebe', {}, city.slug)}
                selected={grad === city.slug}
              >
                {CATCHMENT[city.slug]?.label ?? city.name}
              </OptionTile>
            ))}
          </div>
          {/*
            The settlement lists are long enough across seven cities that
            printing all of them here would bury the buttons. The chosen city's
            list is shown on its results page, where it qualifies that page's
            claim; here one line says what "i okolica" is doing.
          */}
          <p className={styles.settlements}>
            Svaki grad uključuje i okolicu — popis naselja piše uz rezultate.
          </p>
        </>
      )}

      {/*
        The last question, and answering it *is* the submit: every tile links
        straight to the results rather than to another `?korak=potrebe` URL, so
        nothing sits between choosing and seeing the list. The
        `Prikažite pogrebnike` button this replaces was a second tap that could
        only ever lead to one place.

        `Gdje je pokojnik sada?` used to be a second question on this screen and
        is out for now. `pokojnik` stays parsed, typed and wired into
        `lib/guidance.ts`, exactly as the hidden `planiranje` situation is, so
        restoring it is markup here and nothing else — its guidance line simply
        never fires meanwhile.
      */}
      {korak === 'potrebe' && grad && (
        <>
          <div className={styles.question}>
            <h1 className={styles.title}>Kremiranje ili ukop?</h1>
          </div>
          <div className={styles.options}>
            {(['kremiranje', 'ukop'] as const).map((value) => (
              <OptionTile
                key={value}
                href={resultsHref(grad, { ...answers, nacin: value })}
                selected={answers.nacin === value}
              >
                {NACIN_LABEL[value]}
              </OptionTile>
            ))}
            {/*
              Every question carries an explicit escape, and this one now goes
              where the two answers go. As a `step('potrebe', …)` link it
              rewrote the URL the reader was already on, so it rendered as a
              grey tile that visibly did nothing — the defect this fixes.
            */}
            <OptionTile href={resultsHref(grad, { ...answers, nacin: undefined })} quiet>
              Još ne znam
            </OptionTile>
          </div>
        </>
      )}

      <div className={styles.spacer} />

      <div className={styles.foot}>
        {/*
          The bypass. Someone who does not want to be led must always be one tap
          from the list — but with seven cities the city is genuinely required,
          so before it is chosen the bypass can only skip to that one question.
          Screen 2 was always the one mandatory screen; this is that rule
          becoming visible rather than a new restriction.
        */}
        {grad ? (
          <Link href={`/pogrebne-usluge/${grad}`} className={styles.bypass}>
            Preskočite pitanja i prikažite sve pogrebnike u{' '}
            {catchment?.locative ?? chosen?.name}
          </Link>
        ) : (
          // Nothing on screen 2 itself: "skip the questions and just pick a
          // city" is not an escape from a screen that *is* picking a city.
          korak !== 'mjesto' && (
            <Link href={flowHref({ answers, korak: 'mjesto' })} className={styles.bypass}>
              Preskočite pitanja i samo odaberite grad
            </Link>
          )
        )}
      </div>
    </main>
  );
}
