import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { openGraph } from '@/lib/seo';
import styles from '../prose.module.css';

/**
 * "Preuzimanje troškova pogreba" — the entitlements page.
 *
 * The highest-value page in the pipeline and the one with no competitor: the
 * schemes exist, they are published, and nobody assembles them in one place. A
 * family that qualifies is usually told about none of them at the moment they
 * would matter.
 *
 * ## The framing rule, which decides whether this page works
 *
 * **It reads as information you are entitled to, never as charity for the
 * poor.** These are statutory rights and a members' association, not help for
 * the unfortunate — and a reader who feels pitied by a paragraph will close the
 * page before reaching the one that would have paid for the funeral. Practical
 * consequences: no "ako si ne možete priuštiti", no sympathy voice, and each
 * scheme stated as a condition and an entitlement rather than as a hardship.
 *
 * The title carries the same decision. It was *"Tko plaća pogreb ako obitelj ne
 * može"*, which names the reader's failure in the headline; the route and the
 * heading now name the mechanism instead.
 *
 * **Body donation is the most delicate item on the site.** It is a real and
 * dignified choice that removes the cost entirely, and it will read badly if
 * framed as a way to save money. It is therefore last, opens by saying what it
 * is not, and is described as a decision the deceased makes in advance, for
 * their own reasons.
 *
 * ## Sources are named in the text, not collected at the foot
 *
 * Owner decision, 2026-09-16. `/sto-uciniti-prvo` lists its sources in a block
 * at the bottom, which suits a page whose claims all come from the same three
 * documents. Here every section is a *different* scheme run by a *different*
 * body, and the reader's next action is to contact that body — so the link
 * belongs on the institution's name, where someone reading about veterans'
 * entitlements does not have to scroll past four schemes that do not apply to
 * them to find the one that does.
 *
 * `SOURCES` therefore stays as the single place a URL is written down and keeps
 * its `supports` notes, but renders inline rather than as a list. Inline anchors
 * need no class: the global `a` rule in `globals.css` already carries the gold
 * and the underline offset.
 *
 * ## Rules binding any edit here
 *
 * The three inherited from `lib/guidance.ts`:
 *
 * 1. **A sentence that cannot be attributed to a source in `SOURCES` does not
 *    go in.**
 * 2. **Description of what the schemes provide, never legal advice.** Entitlement
 *    is decided by the body administering it, not by this page; where practice
 *    varies, say what usually happens.
 * 3. **Scheme and document names are quoted, not paraphrased.** "Naknada za
 *    pogrebne troškove", "zajamčena minimalna naknada" — a family using the
 *    wrong words at a counter is a real cost.
 *
 * And one specific to this page: **the veterans' caps are quoted exactly, not
 * rounded.** They are statutory limits rather than prices — the figure *is* the
 * entitlement, and rounding it would misstate what the state pays. The owner
 * confirmed their inclusion on 2026-09-15, on the basis that a cap is not a
 * price and nothing here says what a funeral costs.
 *
 * ⚠️ The Croatian is the project owner's own revision of the draft, not
 * reviewed prose in the sense SPEC_frontend.md → Known gaps means. Edits to it
 * go through the owner.
 */

/**
 * Primary sources, keyed so each can be named at the point it is relied on.
 *
 * `supports` is maintenance documentation and is never rendered: it records
 * which claims rest on which document, so an edit can tell whether it has just
 * orphaned a sentence.
 */
const SOURCES = {
  postupak: {
    title: 'gov.hr — Postupak kod smrtnog slučaja',
    url: 'https://gov.hr/hr/postupak-kod-smrtnog-slucaja/760',
    supports: 'registering a death carries no fee; the three-day deadline.',
  },
  naknada: {
    title: 'Ministarstvo rada i socijalne politike — Naknada za pogrebne troškove',
    url: 'https://mrosp.gov.hr/istaknute-teme/obitelj-i-socijalna-politika/socijalna-politika-11977/naknade-i-usluge-u-sustavu-socijalne-skrbi/naknada-za-pogrebne-troskove/12886',
    supports:
      'who the benefit is payable to, the qualifying conditions, what "basic ' +
      'funeral costs" covers, and that the institution reclaims from the estate.',
  },
  branitelji: {
    title: 'gov.hr — Pravo na troškove ukopa (Pravilnik, NN 51/2018)',
    url: 'https://gov.hr/hr/pravo-na-troskove-ukopa/960',
    supports: 'every cap in the veterans list.',
  },
  zagreb: {
    title: 'Grad Zagreb — Podmirenje pogrebnih troškova',
    url: 'https://zagreb.hr/podmirenje-pogrebnih-troskova/106545',
    supports:
      'the city scheme, its conditions, and that the amount is not published.',
  },
  pripomoc: {
    title: 'Posmrtna pripomoć — temeljni pogrebni standard',
    url: 'https://posmrtna.hr/pages/temeljni-pogrebni-standard.aspx',
    supports:
      'the association, the membership contribution, what the standard covers, ' +
      'and the cash refund of any difference.',
  },
  darivanje: {
    title: 'Medicinski fakultet u Zagrebu — Program darivanja tijela',
    url: 'https://darivanje.mef.hr/kako-donirati/',
    supports:
      'registration from age 60, the donor card, the family notification ' +
      'condition, the covered cremation and burial, and the Anatomsko polje.',
  },
} as const;

/**
 * An outbound link to one of `SOURCES`, wrapping the institution's name where
 * it already stands in the sentence.
 *
 * Plain `rel="noopener noreferrer"` — no request leaves the origin until the
 * reader chooses to leave, which is what keeps this inside the one-origin
 * position (SPEC.md → Project Structure).
 */
function Izvor({
  source,
  children,
}: {
  source: { readonly url: string };
  children: ReactNode;
}) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export const metadata: Metadata = {
  title: 'Preuzimanje troškova pogreba',
  description:
    'Kada i pod kojim uvjetima troškove pogreba preuzimaju socijalna skrb, braniteljska prava, gradovi ili Posmrtna pripomoć.',
  alternates: { canonical: '/preuzimanje-troskova-pogreba' },
  openGraph: openGraph({
    title: 'Preuzimanje troškova pogreba',
    description:
      'Kada i pod kojim uvjetima troškove pogreba preuzimaju socijalna skrb, braniteljska prava, gradovi ili Posmrtna pripomoć.',
    path: '/preuzimanje-troskova-pogreba',
  }),
};

export default function CostCoveragePage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Preuzimanje troškova pogreba</h1>
        <p className={styles.lede}>
          Pogrebne troškove u nekim slučajevima u cijelosti ili djelomično pokrivaju institucije i udruge.
          Saznajte tko, kada i kako može zatražiti pokriće troškova pogreba.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.heading}>Prijava smrti se ne naplaćuje</h2>
        <p className={styles.body}>
          Sama prijava smrti u{' '}
          <Izvor source={SOURCES.postupak}>matičnom uredu</Izvor> i dokumenti
          koji se pritom izdaju ne naplaćuju se. Smrt se prijavljuje u roku od
          tri dana. Troškovi nastaju tek s pogrebnom uslugom i grobljem.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Naknada za pogrebne troškove</h2>
        <p className={styles.body}>
          <Izvor source={SOURCES.naknada}>Naknada za pogrebne troškove</Izvor>{' '}
          pravo je koje se ostvaruje iz sustava socijalne skrbi.
          Ostvaruje se u slučaju ako pokojnik nije imao zakonskog ili ugovornog uzdržavatelja i
          ako je u trenutku smrti bio korisnik{' '}
          <em>zajamčene minimalne naknade</em> ili član kućanstva koje je
          primalo. Zahtjev se podnosi nadležnom centru za socijalnu skrb, a naknada se isplaćuje
          osobi koja je pokrila trošak pogreba. Iznos se u načelu ne isplaćuje unaprijed.
        </p>
        <p className={styles.body}>
          Naknada pokriva osnovne pogrebne troškove u mjestu ukopa ili posljednjeg
          prebivališta, uključujući prijevoz do mjesta ukopa ili do državne
          granice. Visina naknade nije određena paušalno, nego se utvrđuje prema stvarnim
          troškovima na tom području.
        </p>
        <p className={styles.note}>
          Ustanova koja je naknadu isplatila naknadno traži povrat iz ostavštine
          pokojnika. Obitelj treba računati s tim da se isplaćena naknada treba vratiti i
          da se taj iznos pojavljuje u ostavinskom postupku.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Branitelji — troškovi ukopa</h2>
        <p className={styles.body}>
          Za hrvatske branitelje postoji pravo na troškove ukopa uz odavanje
          vojnih počasti. To je jedini program s javno propisanim
          iznosima:
        </p>
        <ul className={styles.list}>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Pogrebna oprema — do 300 €</p>
            <p className={styles.itemBody}>Lijes, urna i ostala oprema, s PDV-om.</p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Troškovi ukopa — do 200 €</p>
            <p className={styles.itemBody}>Usluge groblja i ukopa, s PDV-om.</p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Vijenac s grbom — do 110 €</p>
            <p className={styles.itemBody}>Jedan vijenac s državnim grbom.</p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Osmrtnice — do 60 €</p>
            <p className={styles.itemBody}>Tisak i objava, do 30 komada.</p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Prijevoz — do 0,95 € po kilometru</p>
            <p className={styles.itemBody}>
              Unutar Hrvatske. Za prijevoz iz inozemstva pokriva se do 730 €.
            </p>
          </li>
          <li className={styles.item}>
            <p className={styles.itemTitle}>Novo grobno mjesto — do 270 €</p>
            <p className={styles.itemBody}>
              Dio koji snosi država. Jedinica lokalne samouprave u pravilu
              sudjeluje svojim dijelom, a eventualni ostatak snosi obitelj.
            </p>
          </li>
        </ul>
        <p className={styles.note}>
          Iznosi su gornje granice propisane{' '}
          <Izvor source={SOURCES.branitelji}>Pravilnikom (NN 51/2018)</Izvor>, a
          ne cijene usluga. Ako je stvarni trošak manji, pokriva se stvarni trošak.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Grad Zagreb</h2>
        <p className={styles.body}>
          Grad Zagreb podmiruje pogrebne troškove za osobu koja je u Zagrebu
          umrla i u njemu imala prebivalište, nema obveznika uzdržavanja, a
          trošak se ne može pokriti preko centra za socijalnu skrb, braniteljskih
          prava ili police osiguranja. Iznos nije javno objavljen; utvrđuje ga{' '}
          <Izvor source={SOURCES.zagreb}>Gradski ured za socijalnu zaštitu</Izvor>,
          kojemu se zahtjev i podnosi.
        </p>
        <p className={styles.body}>
          Drugi gradovi imaju vlastite odluke o socijalnoj skrbi kojima se određuje
          iznos moguće naknade. Stvarne mogućnosti najbolje je provjeriti
          u gradskom ili općinskom uredu nadležnom za socijalnu skrb.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Posmrtna pripomoć</h2>
        <p className={styles.body}>
          Udruga za uzajamnu pomoć, osnovana 1931. godine, osigurava članovima
          takozvani{' '}
          <em>
            <Izvor source={SOURCES.pripomoc}>temeljni pogrebni standard</Izvor>
          </em>{' '}
          — opremu, prijevoz i ukop. Standard je definiran u cjeniku i vrijedi za sve članove, bez obzira na
          mjesto ukopa. Udruga je neprofitna i ne raspolaže javnim sredstvima.
          Financiranje je osigurano članarinom u iznosu od 5 do 7 € mjesečno.
        </p>
        <p className={styles.body}>
          Ako stvarni pogreb stoji manje od tog standarda, razlika se isplaćuje
          onome tko je pogreb organizirao. Pravo se ostvaruje samo ako
          je u trenutku smrti članstvo već postojalo.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Darivanje tijela za medicinsku nastavu</h2>
        <p className={styles.body}>
          Darivanje tijela medicinskom fakultetu nije način da se uštedi na pogrebu.
          Također to nije odluka koju obitelj donosi nakon smrti.
          Radi se o svjesnoj i osobnoj odluci koju osoba donosi za života.
        </p>
        <p className={styles.body}>
          <Izvor source={SOURCES.darivanje}>Medicinski fakultet u Zagrebu</Izvor>{' '}
          vodi program darivanja tijela za nastavu
          i znanstveni rad. Prijaviti se može osoba starija od 60 godina, koja
          dobiva darovateljsku iskaznicu. Konačnu odluku nakon smrti donosi
          obitelj ili skrbnik, koji su dužni obavijestiti fakultet o smrti registrirane osobe.
        </p>
        <p className={styles.body}>
          Fakultet u cijelosti snosi troškove kremiranja i ukopa. Pokojnici se
          polažu na Anatomskom polju uz krematorij na Mirogoju, uz oproštaj na
          koji je obitelj pozvana. Urna se također može prenijeti i u obiteljsku grobnicu.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Napomena</h2>
        <p className={styles.sourceNote}>
          Podaci su preuzeti iz službenih izvora koji su navedeni u tekstu. Ovo je opis
          postojećih prava i programa, a ne pravni savjet. O konkretnim pravima u
          pojedinačnom slučaju odlučuje tijelo kojemu se zahtjev podnosi.
        </p>
      </section>

      <nav className={styles.footerLinks} aria-label="Povezane stranice">
        <Link href="/koliko-kosta-pogreb" className={styles.footerLink}>
          Koliko košta pogreb →
        </Link>
        <Link href="/sto-uciniti-prvo" className={styles.footerLink}>
          Što učiniti prvo →
        </Link>
      </nav>
    </main>
  );
}
