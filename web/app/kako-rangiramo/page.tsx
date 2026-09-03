import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../prose.module.css';

/**
 * The ranking rules, in plain Croatian.
 *
 * The rules are **published, not merely documented** — the transparency footer
 * on every listing links here, and that footer is a promise. A shortlist whose
 * basis cannot be read is exactly what makes the German portals read as
 * brokers.
 *
 * Everything on this page is a description of our own algorithm, so unlike
 * `/sto-uciniti-prvo` it needs no external source. It must stay in step with
 * `lib/ranking.ts`: if the code changes, this page changes in the same pass.
 */
export const metadata: Metadata = {
  title: 'Kako rangiramo',
  description:
    'Redoslijed pogrebnika na našem popisu određuju jasna pravila. Nitko ne ' +
    'plaća za bolju poziciju.',
  alternates: { canonical: '/kako-rangiramo' },
};

const RULES: { title: string; body: string }[] = [
  {
    title: 'Odgovara li vašem odabiru',
    body:
      'Ako ste odabrali kremiranje, pogrebnici koji tu uslugu nude dolaze prvi. ' +
      'Ako niste odabrali ništa ili ste odabrali ukop, ovaj korak ne mijenja ' +
      'redoslijed — sve pogrebne usluge u našem popisu organiziraju ukop.',
  },
  {
    title: 'Dostupnost, kada je hitno',
    body:
      'Ako ste rekli da je osoba preminula, pogrebnici dostupni 0–24 dolaze ' +
      'prvi, zatim oni koji imaju dežurni telefon. Kada nije hitno, dostupnost ' +
      'ne mijenja redoslijed.',
  },
  {
    title: 'Potpunost podataka',
    body:
      'Pogrebnik o kojem imamo više provjerenih podataka — telefon, dežurnu ' +
      'liniju, radno vrijeme, e-mail, web stranicu, popis usluga — dolazi ' +
      'ispred onoga o kojem imamo manje. Popis koji se ne može iskoristiti ' +
      'vrijedi vam manje od onoga koji može.',
  },
  {
    title: 'Abecedno',
    body:
      'Kada je sve ostalo jednako, redoslijed je abecedni, po hrvatskoj ' +
      'abecedi — Č, Ć, Š, Ž i Đ na svojim mjestima.',
  },
];

const NEVER: string[] = [
  'Nitko nam ne plaća za bolju poziciju. U ovoj fazi ne naplaćujemo ništa, ni pogrebnicima ni vama.',
  'Ne rangiramo prema broju klikova ni pregleda. Kada bi broj klikova dizao poziciju, viša pozicija bi donosila više klikova — brojka bi mjerila samu sebe.',
  'Redoslijed nije slučajan i ne rotira. Isti odgovori uvijek daju isti popis, pa se poveznica koju pošaljete ukućanima otvara jednako i njima.',
  'Ne rangiramo prema cijeni. Nijedan pogrebnik u pilot-području ne objavljuje cijenu, pa je nemamo.',
];

export default function RankingPage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Kako rangiramo</h1>
        <p className={styles.lede}>
          Prikazujemo sve registrirane pogrebnike u području koje pokrivamo —
          nikoga ne izostavljamo. Redoslijed određuju ova pravila, ovim redom.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.heading}>Redoslijed</h2>
        <ol className={styles.list}>
          {RULES.map((rule) => (
            <li key={rule.title} className={styles.item}>
              <span className={styles.itemTitle}>{rule.title}</span>
              <span className={styles.itemBody}>{rule.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Zašto neki pogrebnici imaju obrazloženje</h2>
        <p className={styles.body}>
          Uz pogrebnike na vrhu popisa piše kratko obrazloženje — na primjer{' '}
          <em>„Dežurna linija · klesarske usluge”</em>. Ono je uvijek sastavljeno
          od podataka koje o njima imamo: jesu li dostupni 0–24 ili imaju dežurni
          telefon, i koja je njihova najrjeđa ili najšira ponuda usluga u
          području. Ako o pogrebniku nemamo dovoljno podataka da napišemo takvo
          obrazloženje, ne prikazujemo ga na vrhu popisa — ali ga i dalje
          prikazujemo.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Što ne utječe na redoslijed</h2>
        <ul className={styles.list}>
          {NEVER.map((line) => (
            <li key={line} className={styles.item}>
              <span className={styles.itemBody}>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/*
        This caveat is in the spec as something to "keep visible", and the most
        honest place to keep it visible is the page a provider would read if
        they were unhappy with their position.
      */}
      <p className={styles.note}>
        Jedno ograničenje vrijedi reći naglas: potpunost podataka djelomično
        mjeri koliko smo temeljito mi istražili nekog pogrebnika, a ne što je on
        učinio. Zato je taj kriterij posljednji, iza dostupnosti. Ako ste
        pogrebnik i mislite da su vaši podaci nepotpuni, javite nam — ispravak
        podataka je pravi lijek za to, a ne drugačije bodovanje.
      </p>

      <Link href="/" className={styles.footerLink}>
        Pronađite pogrebnika
      </Link>
    </main>
  );
}
