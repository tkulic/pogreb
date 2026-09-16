import type { Metadata } from 'next';
import Link from 'next/link';
import { CostCalculator } from '@/components/CostCalculator';
import { openGraph } from '@/lib/seo';
import styles from '../prose.module.css';
import local from './page.module.css';

/**
 * "Koliko košta pogreb" — the pillar cost page, and the calculator's home.
 *
 * The page answers one question a grieving family cannot ask anyone without
 * feeling ashamed of asking it, so the tone rule is stricter here than
 * anywhere else on the site: **no framing in which the cheaper choice is the
 * lesser one.** A family must be able to pick the plainest coffin without
 * being told, by implication, that they loved someone less.
 *
 * It explains the bill; it does not accuse anyone of inflating it.
 *
 * The figures come from published municipal tariffs and are documented in
 * `lib/costs.ts`, including why the page does not name the city they are drawn
 * from. The disclaimer beside the estimate does that work instead.
 *
 */
export const metadata: Metadata = {
  title: 'Koliko košta pogreb',
  description:
    'Koji troškovi nastaju prilikom pogreba — s procjenom koju možete prilagoditi.',
  alternates: { canonical: '/koliko-kosta-pogreb' },
  openGraph: openGraph({
    title: 'Koliko košta pogreb',
    description:
      'Koji troškovi nastaju prilikom pogreba — s procjenom koju možete prilagoditi.',
    path: '/koliko-kosta-pogreb',
  }),
};

export default function CostPage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Koliko košta pogreb</h1>
        <p className={styles.lede}>
          Pogreb se dogovara u nekoliko dana, s jednim pogrebnikom — nema vremena za obilazak i usporedbu cijena, 
          a pogrebnici ih u pravilu i ne objavljuju. 
          Ovdje možete unaprijed odrediti okvirnu cijenu i vidjeti što na nju utječe.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.heading}>Informativni kalkulator</h2>
        <CostCalculator />
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Vrste troškova u izračunu</h2>
        <p className={styles.body}>
          Troškovi pogreba mogu se svrstati četiri skupine, a razlike među njima su
          najvidljivije u odabiru lijesa i opsegu pogrebnih usluga.
        </p>
        <ol className={styles.list}>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Ono što se ne može izbjeći</p>
            <p className={styles.itemBody}>
              Preuzimanje i prijevoz pokojnika, rashladna prostorija, priprema,
              lijes, ispraćaj i otvaranje grobnog mjesta. Ovo su nužni troškovi
              svakog pogreba, bez obzira na to što odaberete.
            </p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Ono što možete izabrati</p>
            <p className={styles.itemBody}>
              Ukop ili kremiranje, vrsta lijesa, opseg obreda. Razlike u cijeni su ovdje
              najveće — osobito kad se radi o odabiru lijesa. 
            </p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Ono što se smatra obaveznim, a nije</p>
            <p className={styles.itemBody}>
              Iako se cvijeće, glazba, osmrtnice i karmine smatraju obaveznim, 
              dostojanstven pogreb je moguć i bez njih. Vi zadržavate pravo da ih ne naručite, 
              iako će vam pogrebnik ili obitelj možda sugerirati suprotno.
            </p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Ono što dolazi poslije pogreba</p>
            <p className={styles.itemBody}>
              Nadgrobni spomenik i godišnja grobna naknada. Naknada se plaća
              svake godine, trajno, i o njoj se u trenutku pogreba rijetko
              govori.
            </p>
          </li>
        </ol>
      </section>

      {/* Article 6, folded in as an optional deeper read rather than a page of
          its own — the reader who only wants the number should not have to
          scroll past it. */}
      <section className={styles.section}>
        <details className={local.details}>
          <summary className={local.summary}>Što morate platiti, a što ne morate</summary>
          <div className={local.disclosure}>
            <p className={styles.body}>
              Nijedan pogrebnik ne smije uvjetovati uslugu kupnjom onoga što ne
              želite. U praksi se sljedeće stavke često navode zajedno s
              obaveznima, iako nisu nužne:
            </p>
            <ul className={styles.list}>
              <li className={styles.item}>
                <p className={styles.itemTitle}>Vijenci i cvjetni aranžmani</p>
                <p className={styles.itemBody}>
                  Cijena ovisi o vrsti i količini cvijeća i razlikuje se
                  višestruko. Možete ih naručiti i izvan pogrebnog poduzeća.
                </p>
              </li>
              <li className={styles.item}>
                <p className={styles.itemTitle}>Osmrtnice u novinama</p>
                <p className={styles.itemBody}>
                  Objava u dnevnim novinama naplaćuje se po veličini oglasa.
                  Tiskane obavijesti koje se lijepe u mjestu jeftinije su, a
                  mnogi se danas oslanjaju i na objavu na internetu.
                </p>
              </li>
              <li className={styles.item}>
                <p className={styles.itemTitle}>Glazba na ispraćaju</p>
                <p className={styles.itemBody}>
                  Od jednog puhačkog instrumenta do zbora ili klape. Razlika u
                  cijeni je znatna.
                </p>
              </li>
              <li className={styles.item}>
                <p className={styles.itemTitle}>Vrsta lijesa</p>
                <p className={styles.itemBody}>
                  Odabir raskošnog lijesa može nerijetko udvostručiti cijenu cjelokupnog sprovoda. 
                   Ako je odabrano kremiranje, postoji i lijes
                  namijenjen kremiranju, koji je jeftiniji — ta informacija se često izostavlja.
                </p>
              </li>
              <li className={styles.item}>
                <p className={styles.itemTitle}>Karmine</p>
                <p className={styles.itemBody}>
                  Okupljanje nakon pogreba organizira obitelj i nije dio
                  pogrebne usluge.
                </p>
              </li>
            </ul>
            <p className={styles.note}>
              Najkorisnije što možete zatražiti jest <strong>ponuda</strong> 
              — popis stavki s cijenama, prije nego što išta potpišete.
            </p>
          </div>
        </details>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Izvori podataka o cijenama</h2>
        <p className={styles.body}>
          Iznosi se temelje na javno objavljenim cjenicima komunalnih društava
          koja upravljaju grobljima i obavljaju pogrebne usluge. Cjenici se u
          pravilu mijenjaju jednom godišnje, početkom siječnja. 
          Navedeni iznosi odražavaju tržište pogrebnih usluga u Hrvatskoj 2026. godine.
        </p>
        <p className={styles.body}>
          Cijene se razlikuju od grada do grada, ponekad i višestruko za istu
          uslugu. Zato je ovo procjena reda veličine, a ne ponuda — jedini
          točan iznos je onaj koji dobijete od pogrebnika.
        </p>
      </section>

      <nav className={styles.footerLinks} aria-label="Povezane stranice">
        <Link href="/preuzimanje-troskova-pogreba" className={styles.footerLink}>
          Preuzimanje troškova pogreba →
        </Link>
        <Link href="/sto-uciniti-prvo" className={styles.footerLink}>
          Što učiniti prvo →
        </Link>
      </nav>
    </main>
  );
}
