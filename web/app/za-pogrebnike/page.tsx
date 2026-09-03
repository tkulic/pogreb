import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionButton } from '@/components/ActionButton';
import styles from './provider.module.css';

/**
 * `/za-pogrebnike` — the one place in the product with a submit button.
 *
 * **It is for funeral directors, not for families**, and the name of the route
 * says so rather than leaving it to the page body. A menu item reading
 * "Kontakt" would promise a grieving visitor a way to reach us that does not
 * exist: there is no user-facing form and no published address, by decision.
 *
 * **The four promises are unchanged, and this page does not weaken them.**
 * "Ne tražimo vaše podatke" is a promise to the person looking for a funeral
 * director — the search asks nothing, stores nothing and has no form in it.
 * A provider choosing to write to us about their own listing is the opposite
 * situation: they are the one initiating, about their own business, and they
 * can see exactly what they are sending. Stating that distinction on the page
 * is what keeps it honest, which is why the note below the form exists and is
 * not optional.
 *
 * It is built to close half of a tracked gap — `/kako-rangiramo` and
 * `/nase-obecanje` both say "javite nam" with nowhere to write — but it does
 * not close it yet. **Nothing links here** while `PROVIDER_FORM_PUBLIC` is
 * false: the form collects personal data and there is no `/privatnost` and no
 * named controller to put in it. The other half of the gap, a route for members
 * of the public who are not funeral directors, is untouched. Both wait on the
 * same `/o-nama` decision.
 *
 * **The form posts to `/__forms.html`**, not to this route. See that file for
 * why, and for the rule that its field names and these must stay identical.
 * It is a plain HTML POST with no JavaScript, like the rest of the product.
 */
export const metadata: Metadata = {
  title: 'Za pogrebnike',
  description:
    'Ispravak podataka, dodavanje na popis i suradnja — za pogrebna poduzeća ' +
    'i obrte. Uvrštenje je besplatno i pozicija se ne plaća.',
  // `noindex` while PROVIDER_FORM_PUBLIC is false. The page is built and still
  // reachable by URL, but it is offered to nobody until `/privatnost` exists —
  // keeping it out of the menu while handing it to a crawler would defeat the
  // point of the gate. Remove this in the same change that flips the flag.
  robots: { index: false, follow: false },
};

const REASONS = [
  { value: 'correction', label: 'Ispravak naših podataka o vama' },
  { value: 'missing', label: 'Niste na popisu, a trebali biste biti' },
  { value: 'partnership', label: 'Suradnja' },
  { value: 'other', label: 'Nešto drugo' },
];

export default function ProviderPage() {
  return (
    <main className={`page ${styles.page}`}>
      <Link href="/" className={styles.back}>
        ← Naslovnica
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Za pogrebnike</h1>
        <p className={styles.lede}>
          Ako vodite pogrebno poduzeće ili obrt, ovo je stranica za vas.
          Ispravljamo netočne podatke, dodajemo one koji nedostaju i otvoreni
          smo za suradnju.
        </p>
      </header>

      {/*
        Stated before the form rather than after it, because these are the
        questions a provider has before deciding whether to write at all — and
        because two of them are the same promises the rest of the site makes to
        families, which a provider has every right to hear directly.
      */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Prije nego pišete</h2>
        <ul className={styles.facts}>
          <li className={styles.fact}>
            <span className={styles.factTitle}>Uvrštenje je besplatno</span>
            <span className={styles.factBody}>
              Ne naplaćujemo uvrštenje, kontakt ni upite, i ne prodajemo ih
              nikome. Ako ste registrirani za pogrebne usluge u području koje
              pokrivamo, već biste trebali biti na popisu.
            </span>
          </li>
          <li className={styles.fact}>
            <span className={styles.factTitle}>Pozicija se ne može kupiti</span>
            <span className={styles.factBody}>
              Redoslijed određuju objavljena pravila — dostupnost, potpunost
              podataka i abeceda. Ne postoji iznos koji ga mijenja.{' '}
              <Link href="/kako-rangiramo">Pravila su ovdje</Link>, i ako
              mislite da su pogrešna, recite nam.
            </span>
          </li>
          <li className={styles.fact}>
            <span className={styles.factTitle}>Podatke unosimo ručno</span>
            <span className={styles.factBody}>
              Iz Sudskog registra i javno dostupnih izvora. Zato i griješimo:
              broj telefona, radno vrijeme ili popis usluga mogu biti zastarjeli.
              Ispravak je najbrži način da to riješimo.
            </span>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Javite nam</h2>

        {/*
          A plain HTML POST — no JavaScript, no client component, no validation
          that can fail silently. `form-name` is what Netlify matches on; the
          honeypot is a field a person never sees and a bot fills in.
        */}
        <form
          className={styles.form}
          name="pogrebnici"
          method="POST"
          action="/__forms.html"
        >
          <input type="hidden" name="form-name" value="pogrebnici" />
          <p className={styles.honeypot} aria-hidden="true">
            <label>
              Ne popunjavajte ovo polje
              <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="company">
              Naziv tvrtke ili obrta
            </label>
            <input
              className={styles.input}
              id="company"
              name="company"
              type="text"
              required
              autoComplete="organization"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="oib">
                OIB <span className={styles.optional}>neobavezno</span>
              </label>
              <input
                className={styles.input}
                id="oib"
                name="oib"
                type="text"
                inputMode="numeric"
                maxLength={11}
              />
              <span className={styles.hint}>
                Pomaže nam da vas sigurno povežemo s registrom.
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="city">
                Grad
              </label>
              <input
                className={styles.input}
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reason">
              O čemu se radi
            </label>
            <select className={styles.select} id="reason" name="reason" defaultValue="correction">
              {REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact_name">
                Vaše ime <span className={styles.optional}>neobavezno</span>
              </label>
              <input
                className={styles.input}
                id="contact_name"
                name="contact_name"
                type="text"
                autoComplete="name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                Telefon <span className={styles.optional}>neobavezno</span>
              </label>
              <input
                className={styles.input}
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              E-mail
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            <span className={styles.hint}>
              Trebamo ga samo da vam odgovorimo.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="message">
              Poruka
            </label>
            <textarea
              className={styles.textarea}
              id="message"
              name="message"
              rows={6}
              required
            />
          </div>

          <ActionButton variant="primary" type="submit" fullWidth>
            Pošaljite
          </ActionButton>

          {/*
            Not a disclaimer bolted on. The site tells families it asks nothing
            of them; a provider is entitled to the same plainness about what
            happens to what they choose to send.
          */}
          <p className={styles.privacy}>
            Ono što ovdje upišete stiže nam e-mailom i koristimo to samo da vam
            odgovorimo i ispravimo podatke. Ne prosljeđujemo to nikome i ne
            koristimo za slanje ponuda. Obrazac postoji samo na ovoj stranici —
            posjetitelji koji traže pogrebnika ne ispunjavaju ništa i od njih ne
            tražimo nikakve podatke.
          </p>
        </form>
      </section>
    </main>
  );
}
