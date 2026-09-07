import Link from 'next/link';
import { ActionLink } from './ActionLink';
import { CATCHMENT, nationalCoverageClaim, providerFloor } from '@/lib/copy';
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
  // Summed across the live rows, then rounded down by `providerFloor` — the
  // page never states the true total. See the note at the section below.
  const floor = providerFloor(
    cities.reduce((sum, city) => sum + city.providers, 0),
  );

  return (
    <main className={`pageWide ${styles.page}`}>
      {/*
        The hero photograph sits *behind* the text, which is a deliberate break
        with the image policy that governed every other band on the site
        (bounded, never full-bleed, never behind type). The project owner took
        that decision on 2026-09-07 and SPEC_frontend.md → Image policy records
        it as an exception scoped to this one section.

        What makes it safe rather than merely wanted is the scrim: a radial
        wash of `--stone` at near-full strength under the text, fading to
        nothing at the band's edges. The text block is centred and held to a
        measure, so it sits inside the plateau where the wash is ≥74% opaque —
        above 8:1 for `--ink` even over the darkest part of the photograph,
        against the 4.5:1 AA floor. The stop positions in
        `landing.module.css` are that constraint, not a taste call.

        Served as AVIF → WebP → JPEG from our own origin, at two widths. No
        `next/image`: that would route the file through an image CDN at runtime,
        and a single origin is a GDPR position here, not a preference.
      */}
      <section className={styles.hero}>
        <picture>
          <source
            type="image/avif"
            srcSet="/img/hero-640.avif 640w, /img/hero-1280.avif 1280w"
            sizes="(min-width: 1024px) 1000px, 100vw"
          />
          <source
            type="image/webp"
            srcSet="/img/hero-640.webp 640w, /img/hero-1280.webp 1280w"
            sizes="(min-width: 1024px) 1000px, 100vw"
          />
          {/*
            `alt=""`, deliberately: the photograph carries no information the
            heading does not already state, so announcing it would add noise to
            a screen reader on the one page where orientation matters most.

            `width`/`height` are the intrinsic ratio and exist to stop the
            decoded image from reflowing the band; the band's own height is what
            actually reserves the space, so there is no layout shift either way.
          */}
          <img
            className={styles.heroImage}
            src="/img/hero-1280.jpg"
            alt=""
            width={1280}
            height={853}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <div className={styles.heroText}>
          {/*
            Situation first, keywords second, in one heading. The second clause
            is set quieter than the first so the page opens on the reader rather
            than on the product, without either clause leaving the h1.
          */}
          <h1 className={styles.title}>
            <span className={styles.titleLead}>Netko vam je preminuo?</span>
            <span className={styles.titleClaim}>
              Ne morate znati odakle početi. Pogrebne usluge, na jednom mjestu.
            </span>
          </h1>

          <div className={styles.actions}>
            <ActionLink variant="primary" href="/?korak=situacija" fullWidth>
              Pronađite pogrebnika
            </ActionLink>
          </div>
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
                Honest per-city status, without the count. It read "20
                pogrebnika" / "2 pogrebnika" beside each city, which put Zagreb
                and Dubrovnik on a scale the reader has no use for — a family in
                Dubrovnik needs to know their town is covered, not that it is
                the smallest column on the page. "Svi registrirani" is the same
                promise `coverageClaim` makes on the city page itself, in two
                words.

                A city with no providers yet still says so, and stays listed and
                linked, because the sitemap lists it too and the two must agree.
              */}
              <span className={styles.cityCount}>
                {city.providers > 0 ? 'svi registrirani' : 'u pripremi'}
              </span>
            </li>
          ))}
        </ul>
        {/*
          The one scale claim on the page, and a floor rather than a count:
          `providerFloor` rounds down to the previous ten, so it is true when
          written and can only become more true as providers are added. That is
          the whole reason it is allowed here while exact counts are not — see
          `providerShare` and `providerFloor` in lib/copy.ts.
        */}
        <p className={styles.citiesNote}>
          {nationalCoverageClaim(cities.length)}
          {floor && `, njih ${floor}`} — nitko nije izostavljen i nitko nam ne
          plaća za bolju poziciju. Svaki grad uključuje i okolicu; popis naselja
          piše uz rezultate.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Kako do pogrebnika</h2>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              01
            </span>
            <span className={styles.stepTitle}>Dva pitanja</span>
            <span className={styles.stepBody}>
              Gdje i koju vrstu pogreba želite? Vaši odgovori nam pomažu pronaći
              bolje rezultate. Možete dobiti popis pogrebnika i bez odgovaranja
              na pitanja.
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              02
            </span>
            <span className={styles.stepTitle}>Popis pogrebnika</span>
            <span className={styles.stepBody}>
              Uz pogrebnike na vrhu piše zašto su ondje — dostupnost 0–24,
              dežurna linija, usluge koje drugi ne nude.
            </span>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              03
            </span>
            <span className={styles.stepTitle}>Izravan kontakt</span>
            <span className={styles.stepBody}>
              Poziv ili poruka idu izravno njima. Mi se ne uključujemo i ne
              posredujemo.
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
            <span className={styles.promiseTitle}>Fer</span>
            <span className={styles.promiseBody}>
              U svakom gradu koji pokrivamo prikazujemo sve registrirane
              pogrebnike. Nitko ne plaća za bolju poziciju i nitko nije
              izostavljen.
            </span>
          </li>
          <li className={styles.promise}>
            <span className={styles.promiseTitle}>Anonimno</span>
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
            <span className={styles.promiseTitle}>Transparentno</span>
            <span className={styles.promiseBody}>
              Pravila po kojima rangiramo objavljena su. Možete ih pročitati i
              predložiti promjene.
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

        It sits after the close, well clear of the `Anonimno` promise above —
        no sign-up, no form. That promise is unchanged and stays true as
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
            Vodite pogrebno poduzeće ili obrt? Predložite promjenu ili započnite
            suradnju.{' '}
            <Link href="/za-pogrebnike" className={styles.providerLink}>
              Za pogrebnike
            </Link>
          </p>
        </aside>
      )}
    </main>
  );
}
