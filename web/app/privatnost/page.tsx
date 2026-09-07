import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../prose.module.css';

/**
 * The privacy notice, and it covers exactly one thing.
 *
 * **Scope is the whole design of this page.** The product asks a family
 * nothing — no login, no form, no cookie, no third-party request — and a
 * generic privacy policy would quietly undo that by implying there is
 * something to disclose. So this page opens by saying who it is *not* about,
 * and every section after that is about `/za-pogrebnike`, the product's only
 * form (`lib/nav.ts` → PROVIDER_FORM_PUBLIC).
 *
 * **The field list below must match the form.** `public/__forms.html` and
 * `app/za-pogrebnike/page.tsx` already have to agree with each other or a
 * submission arrives with an empty field; this page is the third copy, and it
 * is the one where a mismatch is a false statement rather than a bug. A field
 * added to the form and not named here means we are collecting something the
 * notice does not disclose.
 *
 * **Deliberate, and a known deficiency rather than an oversight:** the
 * controller is not named. GDPR Art. 13(1)(a) asks for the identity *and* the
 * contact details of the controller; this page gives the contact and says
 * plainly that there is no legal person behind the site, which is honest but
 * incomplete. The project owner decided it this way on 2026-09-04. Naming a
 * controller is a one-line change in the section below, and the right fix.
 *
 * The Croatian here has not had a native-speaker read (SPEC_frontend.md →
 * Known gaps), and this is the page where that matters most, because it is the
 * one making legal statements.
 */
export const metadata: Metadata = {
  title: 'Privatnost',
  description:
    'Što se događa s podacima iz obrasca za pogrebnike. Posjetitelji koji ' +
    'traže pogrebnika ne ostavljaju nikakve podatke.',
  alternates: { canonical: '/privatnost' },
  /**
   * `noindex`, by decision: the indexed surface of this site stays limited to
   * pages that help a searching family, and this page helps nobody who is
   * searching. It is reachable from the footer and from the form itself, which
   * is where a funeral director looks for it and the only place it has to be.
   *
   * Deliberately *not* also disallowed in `robots.ts`. A disallowed URL is one
   * a crawler never fetches, so it never reads this header either — the two
   * mechanisms cancel out rather than reinforcing, and `noindex` alone is the
   * one that actually removes a page from an index. `/specimen` is disallowed
   * for a different reason: it is a development page nobody should fetch at
   * all, indexed or not.
   */
  robots: { index: false, follow: true },
};

/** The address published for data requests. The only contact route the site has. */
const CONTACT_EMAIL = 'dnevnica.online@gmail.com';

/**
 * Every field the form sends, and what happens to each one.
 *
 * Whether a value gets published is the distinction that matters to a funeral
 * director: the point of the form is to correct or add a *listing*, so business
 * details are meant to end up on a public page, while the details of the person
 * who happened to fill it in are not.
 */
const FIELDS: { label: string; note: string }[] = [
  {
    label: 'Naziv tvrtke ili obrta',
    note: 'Objavljuje se na stranici pogrebnika.',
  },
  {
    label: 'OIB',
    note:
      'Neobavezno. Koristimo ga samo da vas sigurno povežemo s upisom u ' +
      'javnom registru. Ne objavljujemo ga.',
  },
  {
    label: 'Grad',
    note: 'Objavljuje se, jer određuje na kojem se popisu pojavljujete.',
  },
  {
    label: 'O čemu se radi',
    note:
      'Ispravak, izostavljanje s popisa, suradnja ili nešto drugo. Služi nam ' +
      'samo za razvrstavanje poruka.',
  },
  {
    label: 'Vaše ime',
    note:
      'Neobavezno. Ne objavljujemo ga — služi nam da vam se obratimo imenom.',
  },
  {
    label: 'Telefon',
    note:
      'Neobavezno. Ako je to poslovni broj tvrtke, objavljuje se; ako je vaš ' +
      'osobni, ne objavljuje se. Ako niste sigurni, napišite to u poruci.',
  },
  {
    label: 'E-mail',
    note:
      'Obavezno, jer vam bez njega ne možemo odgovoriti. Poslovni e-mail ' +
      'tvrtke objavljuje se; osobni ne.',
  },
  {
    label: 'Poruka',
    note: 'Ne objavljuje se. Čitamo je i odgovaramo na nju.',
  },
];

/** The rights, as GDPR names them, in plain Croatian. */
const RIGHTS: string[] = [
  'Pravo na pristup — možete pitati koje podatke o vama imamo i dobiti njihovu kopiju.',
  'Pravo na ispravak — ako je nešto netočno, ispravljamo.',
  'Pravo na brisanje — možete zatražiti da izbrišemo poruku i podatke iz nje.',
  'Pravo na ograničenje obrade i pravo na prigovor — možete se usprotiviti tome kako podatke koristimo.',
  'Pravo na prenosivost — možete dobiti podatke u obliku koji se može prenijeti drugdje.',
];

export default function PrivacyPage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Privatnost</h1>
        <p className={styles.lede}>
          Ova stranica govori o jednoj jedinoj stvari: o obrascu za pogrebnike.
          Ako tražite pogrebnika, ne ostavljate nikakve podatke i ovo se na vas
          ne odnosi.
        </p>
      </header>

      {/*
        First, and stated before anything else, because a privacy page on a
        site that asks nothing is otherwise read as evidence that it does.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Ako tražite pogrebnika</h2>
        <p className={styles.body}>
          Ne pitamo vas ništa. Nema prijave, nema obrasca i nema kolačića. Ne
          bilježimo vašu IP adresu, uređaj, pretraživač ni stranicu s koje ste
          došli. Kada pritisnete „Nazovi”, poziv ide izravno pogrebniku — mi se
          ne uključujemo i ne znamo je li obavljen.
        </p>
        <p className={styles.body}>
          Bilježimo jedno, i bez ikakve oznake o vama: koliko je puta otvoren
          profil pojedinog pogrebnika i koliko je puta pritisnut njegov broj
          ili e-mail. To je opisano u cijelosti na stranici{' '}
          <Link href="/nase-obecanje" className={styles.footerLink}>
            Naš credo
          </Link>
          .
        </p>
      </section>

      {/*
        The identity half of Art. 13(1)(a) is missing here by decision, so the
        paragraph says so rather than filling the gap with something vague. If a
        name or a registered obrt ever exists, it replaces the first sentence.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Tko obrađuje podatke</h2>
        <p className={styles.body}>
          Ovu stranicu održava privatna osoba, a ne tvrtka — iza nje ne stoji
          pravna osoba koju bismo ovdje mogli navesti. Za sve što se tiče
          podataka pišite na{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerLink}>
            {CONTACT_EMAIL}
          </a>
          . To je jedina adresa na koju stižu takvi zahtjevi i odgovaramo na
          njih osobno.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>
          Što skupljamo i što s podatcima radimo
        </h2>
        <p className={styles.body}>
          Samo ono što sami upišete u obrazac na stranici{' '}
          <Link href="/za-pogrebnike" className={styles.footerLink}>
            Za pogrebnike
          </Link>
          . Ništa se ne dodaje automatski i ništa se ne prikuplja u pozadini.
        </p>
        <ul className={styles.list}>
          {FIELDS.map((field) => (
            <li key={field.label} className={styles.item}>
              <span className={styles.itemTitle}>{field.label}</span>
              <span className={styles.itemBody}>{field.note}</span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Obrazac ima i jedno skriveno polje koje služi za odbijanje
          automatiziranih poruka. Ostaje prazno kada obrazac ispuni čovjek.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Zašto to smijemo obrađivati</h2>
        <p className={styles.body}>
          Zato što ste nam se sami javili. Slanjem obrasca dajete pristanak da
          podatke iz njega koristimo za ono zbog čega ste ih poslali — da vam
          odgovorimo i da ispravimo ili dopunimo vaš upis na popisu. Ni za što
          drugo.
        </p>
        <p className={styles.body}>
          Pristanak možete povući u svakom trenutku, pisanjem na adresu iznad.
          Povlačenje ne utječe na ono što je do tada već ispravljeno na popisu,
          jer podaci o tvrtki na popisu potječu iz javnih registara i tamo
          ostaju neovisno o obrascu.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Gdje se podaci čuvaju</h2>
        <p className={styles.body}>
          Obrazac obrađuje Netlify (Netlify, Inc.), servis koja poslužuje ovu
          stranicu. Poslana poruka pohranjuje se kod njih i
          preusmjerava nam se e-mailom. To znači da podaci putuju izvan
          Europskog gospodarskog prostora, na temelju standardnih ugovornih
          klauzula i okvira za prijenos podataka između EU-a i SAD-a.
        </p>
        <p className={styles.body}>
          Nikome drugome podatke ne prosljeđujemo. Ne prodajemo ih, ne
          razmjenjujemo i ne koristimo za slanje ponuda — ni svojih, ni tuđih.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Koliko dugo</h2>
        <p className={styles.body}>
          Poruku čuvamo dok ne riješimo ono zbog čega ste je poslali, a najdulje
          dvanaest mjeseci od primitka. Nakon toga je brišemo — i iz Netlifyjeve
          pohrane i iz e-pošte. Ako želite da to bude prije, napišite nam i
          brišemo odmah.
        </p>
        <p className={styles.body}>
          Ispravljeni podaci o tvrtki ostaju na popisu i nakon brisanja poruke,
          jer su to javni poslovni podaci i oni su svrha popisa.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Vaša prava</h2>
        <ul className={styles.list}>
          {RIGHTS.map((right) => (
            <li key={right} className={styles.item}>
              <span className={styles.itemBody}>{right}</span>
            </li>
          ))}
        </ul>
        <p className={styles.body}>
          Za bilo koje od njih dovoljno je pisati na{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerLink}>
            {CONTACT_EMAIL}
          </a>
          . Ako mislite da s vašim podacima ne postupamo ispravno, možete se
          obratiti i Agenciji za zaštitu osobnih podataka (AZOP), nadzornom
          tijelu u Hrvatskoj.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Kolačići</h2>
        <p className={styles.body}>
          Nema ih. Nijednog — ni našeg, ni tuđeg. Zato vas na ulazu ne pitamo
          ništa o kolačićima: nemamo što pitati. Pisma se poslužuju s ove
          stranice, a ne s Googleovih poslužitelja, pa vaša IP adresa ne odlazi
          nikome trećem dok čitate.
        </p>
      </section>

      <div className={styles.footerLinks}>
        <Link href="/nase-obecanje" className={styles.footerLink}>
          Naš credo
        </Link>
        <Link href="/" className={styles.footerLink}>
          Pronađite pogrebnika
        </Link>
      </div>
    </main>
  );
}
