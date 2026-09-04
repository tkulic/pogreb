/**
 * Site navigation, in one place because the masthead and the footer must not
 * drift apart — a menu that lists four pages above a footer that lists five
 * is the ordinary way a small site starts to look unmaintained.
 *
 * Nothing here is route-specific or comes from the database, which is what
 * lets the root layout render both the header and the footer on every route,
 * including the statically rendered prose pages, without a query.
 */

export type NavLink = { href: string; label: string };
/**
 * Whether `/za-pogrebnike` is linked anywhere a stranger can reach it.
 *
 * **Now true.** It was false as a compliance gate rather than a soft launch:
 * the page carries the product's only form, that form collects a name, an
 * e-mail address and a phone number, and GDPR art. 13 requires telling the
 * person who the controller is, the legal basis, how long it is kept, what
 * rights they have and how to complain to AZOP. The note under the form covered
 * roughly a third of that and nothing covered the rest.
 *
 * `/privatnost` now covers it, the form's note points at it, and the flag is
 * flipped — which re-links the route in the menu, the footer, the landing page,
 * the sitemap and the two prose pages all at once, and drops its `noindex`.
 *
 * **One part of the gate is still open, by the project owner's decision on
 * 2026-09-04: the controller is not named.** `/privatnost` gives a contact
 * address and states plainly that no legal person stands behind the site, which
 * is honest but is not the identity half of art. 13(1)(a). Naming a controller
 * is a one-line change in that page's `Tko obrađuje podatke` section.
 */
export const PROVIDER_FORM_PUBLIC = true;

/**
 * The masthead menu, and the first footer column.
 *
 * Four items, and deliberately no "coming soon" entries for the adjacent
 * categories `RESEARCH_market.md` § 3 identifies (klesari, cvjećari,
 * glazbenici). Advertising a category that does not exist costs the one thing
 * this product is built on — that everything it states can be checked — and
 * buys an impression of scale we do not need.
 *
 * The last item is **"Za pogrebnike", not "Kontakt"**, and the difference is
 * not cosmetic: there is no user-facing form and no published address, so
 * "Kontakt" would promise a grieving visitor a route that does not exist. The
 * label says who the page is for, which is also how the providers who need it
 * find it.
 */
export const MENU: readonly NavLink[] = [
  { href: '/sto-uciniti-prvo', label: 'Što učiniti prvo' },
  { href: '/kako-rangiramo', label: 'Kako rangiramo' },
  { href: '/nase-obecanje', label: 'Naše obećanje' },
  ...(PROVIDER_FORM_PUBLIC
    ? [{ href: '/za-pogrebnike', label: 'Za pogrebnike' }]
    : []),
];

/**
 * The official sources the guidance text is drawn from, linked in the footer.
 *
 * These are the same three references `lib/guidance.ts` is written against and
 * `/sto-uciniti-prvo` renders (SPEC_frontend.md → Question 3b). Putting them in
 * the footer is not decoration: a family that needs the procedure rather than a
 * provider should reach the primary source from any page, and a directory in
 * this category that cites nothing reads as one more content farm.
 *
 * They are plain outbound links with `rel="noreferrer"` — no third-party
 * request is made until the visitor chooses to leave, so this does not touch
 * the one-origin position (SPEC.md → Project Structure).
 */
export const SOURCES: readonly NavLink[] = [
  {
    href: 'https://gov.hr/hr/postupak-kod-smrtnog-slucaja/760',
    label: 'gov.hr — Postupak kod smrtnog slučaja',
  },
  {
    href: 'https://narodne-novine.nn.hr/clanci/sluzbeni/2011_04_46_1067.html',
    label: 'Pravilnik o načinu pregleda umrlih (NN 46/2011)',
  },
  {
    href: 'https://mvep.gov.hr/konzularne-informacije-99074/maticarstvo-prijava-rodjenja-braka-ili-smrti/prijava-smrti-179979/179979',
    label: 'MVEP — Prijava smrti u inozemstvu',
  },
];
