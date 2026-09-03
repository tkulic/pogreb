import Link from 'next/link';
import { ActionLink } from './ActionLink';
import { StoneEngraving } from './StoneEngraving';
import { CATCHMENT, nationalCoverageClaim, providerNoun } from '@/lib/copy';
import { PROVIDER_FORM_PUBLIC } from '@/lib/nav';
import type { CityCoverage } from '@/lib/queries';
import styles from '@/app/landing.module.css';

/**
 * The landing page.
 *
 * It answers the one question the flow could not: *what is this?* Someone
 * arriving from a search result previously met "Što se dogodilo?" with no
 * indication of what the site was or who was asking — which is a lot to ask of
 * a stranger in the first hours after a death.
 *
 * **The `<h1>` now names the reader's situation rather than opening with the
 * coverage claim**, and that reverses a rule this spec settled deliberately.
 * The reasoning it settled on still stands — a stranger reads a count as the
 * size of our database rather than the size of the market — but it was
 * answering *how do we assert completeness* when the first question a stranger
 * actually brings is *is this for me*. "Netko vam je preminuo?" answers that in
 * four words; the coverage claim then answers the second question, in the strip
 * directly under the action, where it reads as evidence rather than as an
 * opening boast.
 *
 * Two guardrails on that, both binding:
 *
 * - **The claim keeps one wording.** `coverageClaim` is still the only place it
 *   is written, and it still appears on this page exactly once — a promise
 *   worded one way here and another way on `/nase-obecanje` reads as the weaker
 *   of the two.
 * - **The `<h1>` still carries the search terms.** "Pogrebne usluge u Splitu i
 *   okolici" is the phrase this product's entire distribution channel is built
 *   on, so the empathy line gains a second clause rather than displacing it. An
 *   `<h1>` that reads beautifully and ranks for nothing is not a trade a
 *   product distributed solely through Croatian-language search can afford.
 *
 * The structure below is deliberately the familiar one — hero, how it works,
 * why us, close. Familiarity is the point: a grieving family should not have to
 * learn a page before they can use it.
 *
 * **The city expansion is what changed this page most.** It was written around
 * a single pilot city and took one `city` prop, which the route filled with
 * `cities[0]` — so the day six more cities landed, the page silently began
 * presenting Dubrovnik as the whole product. Three consequences, all deliberate:
 *
 * - **The `<h1>` no longer names a place.** Dropping the city from it is right
 *   for search rather than a loss: this page should rank for *pogrebne usluge*,
 *   and `/pogrebne-usluge/{grad}` — which has its own `<h1>`, its own metadata
 *   and its own coverage claim — should rank for *pogrebne usluge split*. One
 *   page trying to be both would be weaker at each.
 * - **The coverage strip became a city list**, which does three jobs at once:
 *   it answers "is my town covered?", it is the bypass for someone who does not
 *   want to be led, and it is the internal linking that puts seven city pages
 *   one hop from the front door.
 * - **Each city carries its own provider count.** That is the count doing real
 *   work — a fact about a place, beside a link where the reader can go and
 *   count them — rather than a boast, which is the distinction the coverage
 *   rule actually draws. `nationalCoverageClaim` carries the same argument for
 *   counting cities in the section note.
 */
export function Landing({ cities }: { cities: CityCoverage[] }) {
  return (
    <main className={`pageWide ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          {/*
            Situation first, keywords second, in one heading. The second clause
            is set quieter than the first so the page opens on the reader rather
            than on the product, without either clause leaving the h1.
          */}
          <h1 className={styles.title}>
            <span className={styles.titleLead}>Netko vam je preminuo?</span>
            <span className={styles.titleClaim}>
              Pogrebne usluge na jednom mjestu, bez posrednika.
            </span>
          </h1>

          {/*
            Screen 1 offers "posljednji dani" as well, so the lede has to widen
            the door the heading opened: someone whose relative is dying is in
            the same hours and needs the same list.
          */}
          <p className={styles.lede}>
            Ili je osoba u posljednjim danima, a vi ne znate što slijedi.
            Odgovorite na dva pitanja i recimo vam koga nazvati prvog — i zašto
            baš njega. Bez prijave, bez obrasca i bez posrednika.
          </p>

          <div className={styles.actions}>
            <ActionLink variant="primary" href="/?korak=situacija" fullWidth>
              Pronađite pogrebnika
            </ActionLink>
          </div>
        </div>

        {/*
          The one image slot on this page, and it is now filled: engraved line
          art rather than a stock photograph, on the stone texture, with the
          gold rule beneath. Bounded, never full-bleed, never behind text.
        */}
        <div className={`stoneTexture ${styles.band}`}>
          <StoneEngraving className={styles.engraving} />
        </div>
      </section>

      {/*
        The coverage list — what the single-city coverage strip became.

        Text links rather than buttons, deliberately: this is the bypass for
        someone who does not want to be led, and it must not compete with the
        one primary action above. Ordered by name, which is how `getCities`
        orders them — ordering by provider count would put Zagreb first and
        read as a ranking of the cities themselves, which is not a claim we
        hold.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Gradovi koje pokrivamo</h2>
        <ul className={styles.cities}>
          {cities.map((city) => (
            <li key={city.id} className={styles.cityItem}>
              <Link
                href={`/pogrebne-usluge/${city.slug}`}
                className={styles.cityLink}
              >
                {CATCHMENT[city.slug]?.label ?? city.name}
              </Link>
              {/*
                Honest per-city status. A city with no providers yet says so
                rather than reading "0 pogrebnika" — but it stays listed and
                linked, because the sitemap lists it too and the two must agree.
              */}
              <span className={styles.cityCount}>
                {city.providers > 0
                  ? `${city.providers} ${providerNoun(city.providers)}`
                  : 'u pripremi'}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.citiesNote}>
          {nationalCoverageClaim(cities.length)} — nitko nije izostavljen i
          nitko nam ne plaća za bolju poziciju. Svaki grad uključuje i okolicu;
          popis naselja piše uz rezultate.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Kako radi</h2>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              01
            </span>
            <span className={styles.stepTitle}>Dva pitanja, bez upisivanja</span>
            <span className={styles.stepBody}>
              Gdje je pogreb i treba li kremiranje ili ukop. Na svako možete
              odgovoriti „ne znam” i svejedno dobiti popis.
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              02
            </span>
            <span className={styles.stepTitle}>Dobijete popis s obrazloženjem</span>
            <span className={styles.stepBody}>
              Uz pogrebnike na vrhu piše zašto su ondje — dostupnost 0–24,
              dežurna linija, usluge koje drugi ne nude.
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              03
            </span>
            <span className={styles.stepTitle}>Nazovete izravno</span>
            <span className={styles.stepBody}>
              Broj je njihov, poziv ide izravno njima. Mi se ne uključujemo i
              ništa ne posredujemo.
            </span>
          </li>
        </ol>
      </section>

      {/*
        The promises are the product's actual differentiators, and they are the
        short form of a page that states each one in full — including what it
        rules out. Four here, four there, in the same order and the same words.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Zašto baš ovdje</h2>
        <ul className={styles.promises}>
          <li className={styles.promise}>
            <span className={styles.promiseTitle}>Svi, ne samo neki</span>
            <span className={styles.promiseBody}>
              U svakom gradu koji pokrivamo prikazujemo sve registrirane
              pogrebnike. Nitko nam ne plaća za bolju poziciju i nitko nije
              izostavljen.
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

      {/*
        The close. The same action, repeated at the foot of a longer page —
        familiar, and it does not break the one-primary-action rule, because
        there is still exactly one kind of heaviest thing on the screen.
      */}
      <section className={styles.close}>
        <div className={styles.closeInner}>
          <p className={styles.closeText}>
            Ako ne znate odakle početi, počnite ovdje. Dva pitanja, nijedno
            obavezno.
          </p>
          <div className={styles.actions}>
            <ActionLink variant="primary" href="/?korak=situacija" fullWidth>
              Pronađite pogrebnika
            </ActionLink>
            <Link href="/sto-uciniti-prvo" className={styles.bypass}>
              Ili pročitajte što učiniti prvo
            </Link>
          </div>
        </div>
      </section>

      {/*
        The provider route, and its placement is deliberate.

        It sits after the close, well clear of "Ne tražimo vaše podatke — nema
        prijave, nema obrasca". That promise is unchanged and stays true as
        written: it is addressed to the person looking for a funeral director,
        and their path through this product still asks nothing and submits
        nothing. A form for the businesses being listed is a different audience
        and a different transaction — but printed directly under that sentence
        it would read as a contradiction regardless, which is reason enough to
        keep the two apart.

        Set as the quietest thing on the page: a family must never mistake it
        for something they are being asked to do.
      */}
      {PROVIDER_FORM_PUBLIC && (
        <aside className={styles.provider}>
          <p className={styles.providerText}>
            Vodite pogrebno poduzeće ili obrt? Uvrštenje je besplatno, a
            pozicija se ne plaća.{' '}
            <Link href="/za-pogrebnike" className={styles.providerLink}>
              Za pogrebnike
            </Link>
          </p>
        </aside>
      )}
    </main>
  );
}
