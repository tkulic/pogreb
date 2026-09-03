import Link from 'next/link';
import { ActionLink } from './ActionLink';
import { SiteHeader } from './SiteHeader';
import { CATCHMENT, coverageClaim } from '@/lib/copy';
import type { City } from '@/lib/database.types';
import styles from '@/app/landing.module.css';

/**
 * The landing page.
 *
 * It answers the one question the flow could not: *what is this?* Someone
 * arriving from a search result previously met "Što se dogodilo?" with no
 * indication of what the site was or who was asking — which is a lot to ask of
 * a stranger in the first hours after a death.
 *
 * Structure is deliberately short: what it is, one action, how it works, what
 * we promise. The primary action sits above the fold and is the heaviest thing
 * on the screen; everything below it supports the decision to tap it rather
 * than competing with it.
 *
 * **The claim is coverage, not a count.** The page used to open with "popis
 * svih sedam pogrebnika", which said the true thing in the weakest available
 * way — see `coverageClaim`. The settlement list moved up out of the footer to
 * sit directly under the action, because it is the evidence for the claim in
 * the heading and it is the line that tells a stranger whether this site is
 * about their town at all.
 */
export function Landing({ city }: { city: City | undefined }) {
  const catchment = city ? CATCHMENT[city.slug] : undefined;
  const area = catchment?.label ?? city?.name ?? '';
  const areaLocative = catchment?.locative ?? city?.name ?? '';

  return (
    <main className={`page ${styles.page}`}>
      <SiteHeader />

      <section className={styles.hero}>
        <h1 className={styles.title}>
          {areaLocative ? coverageClaim(areaLocative) : 'Svi registrirani pogrebnici'}
        </h1>
        <p className={styles.lede}>
          Nijedan nije izostavljen. Uz svakog piše telefon, radno vrijeme i
          usluge. Odgovorite na dva pitanja i recimo vam koga nazvati prvog — i
          zašto baš njega.
        </p>

        <div className={styles.actions}>
          <ActionLink variant="primary" href="/?korak=situacija" fullWidth>
            Pronađite pogrebnika
          </ActionLink>
          {city && (
            <Link href={`/pogrebne-usluge/${city.slug}`} className={styles.bypass}>
              Ili odmah prikažite sve pogrebnike
            </Link>
          )}
        </div>
      </section>

      {/*
        The coverage strip — the evidence for the heading, and the answer to
        "is this site about my town?".

        It carries no verb, deliberately: "Pokrivamo Split i okolica" needs the
        accusative ("okolicu"), and a fourth stored case form to say one line is
        not worth it. Label plus area plus settlements reads correctly as a
        statement of coverage.
      */}
      {catchment && (
        <section className={styles.coverage} aria-label="Pokriveno područje">
          <span className={styles.coverageLabel}>pokriveno područje</span>
          <p className={styles.coverageValue}>
            {area} — {catchment.settlements.join(', ')}.
          </p>
        </section>
      )}

      {/*
        The one image slot on this page. Until an image is chosen it renders as
        stone texture alone — which is exactly what the texture exists for, and
        why every page must hold with no image at all.
      */}
      <div className={`stoneTexture ${styles.band}`} />

      <section className={styles.section}>
        <h2 className={styles.heading}>Kako radi</h2>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepText}>
              <span className={styles.stepTitle}>Dva pitanja, bez upisivanja</span>
              <span className={styles.stepBody}>
                Što se dogodilo i treba li kremiranje ili ukop. Na svako možete
                odgovoriti „ne znam” i svejedno dobiti popis.
              </span>
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepText}>
              <span className={styles.stepTitle}>Dobijete popis s obrazloženjem</span>
              <span className={styles.stepBody}>
                Uz pogrebnike na vrhu piše zašto su ondje — dostupnost 0–24,
                dežurna linija, usluge koje drugi ne nude.
              </span>
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepText}>
              <span className={styles.stepTitle}>Nazovete izravno</span>
              <span className={styles.stepBody}>
                Broj je njihov, poziv ide izravno njima. Mi se ne uključujemo i
                ništa ne posredujemo.
              </span>
            </span>
          </li>
        </ol>
      </section>

      {/*
        The promises are the product's actual differentiators, and they are now
        the short form of a page that states each one in full — including what
        it rules out, and what we do if we break it. Four here, four there, in
        the same order.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Naše obećanje</h2>
        <ul className={styles.promises}>
          <li className={styles.promise}>
            <span className={styles.promiseTitle}>Svi, ne samo neki</span>
            <span className={styles.promiseBody}>
              Prikazujemo sve registrirane pogrebnike u {areaLocative}. Nitko nam
              ne plaća za bolju poziciju i nitko nije izostavljen.
            </span>
          </li>
          <li className={styles.promise}>
            <span className={styles.promiseTitle}>Ne tražimo vaše podatke</span>
            <span className={styles.promiseBody}>
              Nema prijave, nema obrasca, nema kolačića za praćenje. Ne tražimo
              ime, e-mail ni broj telefona — pa ih ne možemo ni proslijediti.
            </span>
          </li>
          <li className={styles.promise}>
            <span className={styles.promiseTitle}>Besplatno</span>
            <span className={styles.promiseBody}>
              Za vas i za pogrebnike. Ne naplaćujemo kontakt i ne prodajemo
              upite.
            </span>
          </li>
          <li className={styles.promise}>
            <span className={styles.promiseTitle}>Provjerljivo</span>
            <span className={styles.promiseBody}>
              Pravila po kojima rangiramo objavljena su, a ne opisana općenito.
              Možete ih pročitati i reći nam da su pogrešna.
            </span>
          </li>
        </ul>
        <Link href="/nase-obecanje" className={styles.sectionLink}>
          Cijelo obećanje, i što isključuje
        </Link>
      </section>

      <div className={styles.foot}>
        <div className={styles.footLinks}>
          <Link href="/sto-uciniti-prvo" className={styles.footLink}>
            Što učiniti prvo
          </Link>
          <Link href="/kako-rangiramo" className={styles.footLink}>
            Kako rangiramo
          </Link>
          <Link href="/nase-obecanje" className={styles.footLink}>
            Naše obećanje
          </Link>
        </div>
      </div>
    </main>
  );
}
