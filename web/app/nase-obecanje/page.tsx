import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../prose.module.css';

/**
 * The promises, in full.
 *
 * The landing page states four of them in a sentence each; this is the page
 * they are the short form of. It exists because the promises are the product's
 * only real differentiators — the reference portals surveyed during design all
 * end in a lead form and none of them can say any of this — and a
 * differentiator stated once in six words reads as marketing.
 *
 * **Every promise here carries what it rules out.** That is the whole design of
 * the page: "we don't sell your data" is a slogan, while "we cannot sell it
 * because we never collect it, and here is the one thing we do count" is a
 * position someone can check and hold us to. The `Što bilježimo` section is
 * therefore not a disclaimer bolted on — it is the promise being honest about
 * its own edge, and it must stay in step with SPEC_database.md → Usage logging.
 *
 * **Still absent: a named owner.** A promise page with nobody behind it is the
 * weakest kind, but a name cannot be invented (SPEC.md → Never: fabricating
 * data) and the project owner has chosen not to publish one. It waits on
 * `/o-nama`.
 *
 * A contact route no longer is absent. `/za-pogrebnike` takes corrections and
 * `/privatnost` says what happens to them, and the "javite nam" limit below
 * points at the first of those — for funeral directors. There is still no route
 * for a member of the public who is not one, which is the other half of the
 * same tracked gap.
 */
export const metadata: Metadata = {
  title: 'Naš credo',
  description: 'Četiri obećanja. Vola se drži za rogove, a čovjeka za riječ.',
  alternates: { canonical: '/nase-obecanje' },
};

/**
 * The four promises, in the same order as the landing page's short form. If one
 * changes, both change — a promise worded one way on the landing page and
 * another way here reads as the weaker of the two.
 */
const PROMISES: { title: string; body: string; excludes: string }[] = [
  {
    title: 'Fer',
    body:
      'Na popisu su svi pogrebnici registrirani u području koje pokrivamo — ' +
      'uključujući one koji nemaju web stranicu i one koji se nigdje ne ' +
      'oglašavaju. Popis nastaje iz javnih registara i javno dostupnih ' +
      'podataka, agregiranih s velikom pažnjom.',
    excludes:
      'Nitko ne može platiti bolju poziciju, niti za lošiju poziciju ' +
      'konkurentskog poduzeća. Ne postoji ni „istaknuto mjesto” koje bi se ' +
      'moglo kupiti.',
  },
  {
    title: 'Anonimno',
    body:
      'Nema prijave, nema obrasca, nema polja za ime, e-mail ni telefon. ' +
      'Nema kolačića i nema oznake koja bi vas pratila s ove stranice na ' +
      'drugu.',
    excludes:
      'Vaše podatke ne možemo prodati ni proslijediti jer ih nemamo. Kada ' +
      'pritisnete „Nazovi”, poziv ide izravno pogrebniku: broj je njegov, ' +
      'mi se ne uključujemo, ne preusmjeravamo poziv i ne znamo je li ' +
      'obavljen.',
  },
  {
    title: 'Besplatno',
    body:
      'Ne naplaćujemo kontakt, ne prodajemo upite i nemamo oglase — ni ' +
      'svoje, ni tuđe.',
    excludes:
      'Ako se ovo jednom promijeni, prvo se mijenja ova stranica, s datumom ' +
      'i s time što je točno promijenjeno. Obećanje koje se tiho promijeni ' +
      'nije obećanje.',
  },
  {
    title: 'Transparentno',
    body:
      'Pravila po kojima sastavljamo popis objavljena su u cijelosti i ' +
      'razumljivim jezikom, na stranici Kako rangiramo. Isti odgovori uvijek ' +
      'daju isti popis, pa se poveznica koju pošaljete ukućanima njima ' +
      'otvara jednako kao vama.',
    excludes:
      'Popis nije slučajan, ne rotira i ne ovisi o broju klikova. Ako ' +
      'mislite da je neko pravilo pogrešno, možete ga pročitati i predložiti ' +
      'promjenu — to je razlika između objavljenog pravila i ' +
      '„našeg algoritma”.',
  },
];

/** What the promise does not cover. Stated by us, before anyone asks. */
const LIMITS: string[] = [
  'Ne ocjenjujemo kvalitetu usluge. Nemamo ocjene ni recenzije jer ih nemamo od koga dobiti, a izmišljene bi bile gore od nikakvih.',
  'Ne uspoređujemo cijene i ne rangiramo po njima. Pogrebnici u pravilu ne objavljuju cjenike; ako ipak postoji cijena, stoji na stranici pogrebnika i označena je kao orijentacijska.',
  'Ne znamo koji pogrebnik dolazi u koje mjesto. Područje koje navodimo je područje popisa, a ne tvrdnja da svaki pogrebnik s popisa radi u svakom naselju.',
  'Podatke unosimo ručno. Stoga oni mogu zastarjeti. Ako je neki broj, radno vrijeme ili usluga netočna, javite nam i ispravit ćemo — ispravak je pravi lijek za to.',
];

export default function PromisePage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Naš credo</h1>
        <p className={styles.lede}>
          Četiri obećanja. Vola se drži za rogove, a čovjeka za riječ.
        </p>
      </header>

      <section className={styles.section}>
        <ul className={styles.list}>
          {PROMISES.map((promise) => (
            <li key={promise.title} className={styles.item}>
              <span className={styles.itemTitle}>{promise.title}</span>
              <span className={styles.itemBody}>{promise.body}</span>
              <span className={styles.itemExcludes}>{promise.excludes}</span>
            </li>
          ))}
        </ul>
      </section>

      {/*
        The edge of the second promise, stated by us rather than discovered by
        someone reading network requests. Must stay in step with
        SPEC_database.md → Usage logging: if `events` ever gains a column, this
        paragraph changes in the same pass.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Što bilježimo</h2>
        <p className={styles.body}>
          Jedno bilježimo, i vrijedi to pojasniti: koliko je puta otvoren
          profil pojedinog pogrebnika i koliko je puta pritisnut njegov broj
          ili e-mail. Bilježi se samo to — koji pogrebnik i koja radnja.
        </p>
        <p className={styles.body}>
          Ne bilježimo IP adresu, ni skraćenu ni šifriranu. Ne bilježimo koji
          uređaj ili pretraživač koristite, s koje ste stranice došli, ni bilo
          kakvu oznaku po kojoj bi se dvije radnje mogle povezati u jednu
          osobu. Zapis o pritisnutom broju ne zna ništa o vama, pa ga se ne
          može ni pripisati vama.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Što obećanje ne pokriva</h2>
        <ul className={styles.list}>
          {LIMITS.map((line) => (
            <li key={line} className={styles.item}>
              <span className={styles.itemBody}>{line}</span>
            </li>
          ))}
        </ul>
        {/*
          The last limit above says "javite nam", and until now there was
          nowhere to write. LIMITS is a list of plain strings, so the address
          lands here rather than inside the sentence that promises it.
        */}
        <p className={styles.note}>
          Ako ste pogrebnik i nešto o vama nije točno, ispravak se traži na
          stranici{' '}
          <Link href="/za-pogrebnike" className={styles.footerLink}>
            Za pogrebnike
          </Link>
          .
        </p>
      </section>

      {/*
        No count in this sentence, on purpose. It said "jedno područje" through
        the seven-city expansion, and a number written by hand here would go
        stale the same way — the landing page counts cities from the live rows
        precisely so that copy like this does not have to.
      */}
      <p className={styles.note}>
        Popis svakodnevno raste: pokrivamo dio Hrvatske, a ne cijelu zemlju, i
        svaki novi grad dodajemo po istim pravilima.
      </p>

      <div className={styles.footerLinks}>
        <Link href="/kako-rangiramo" className={styles.footerLink}>
          Kako rangiramo
        </Link>
        <Link href="/" className={styles.footerLink}>
          Pronađite pogrebnika
        </Link>
      </div>
    </main>
  );
}
