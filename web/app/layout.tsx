import type { Metadata, Viewport } from 'next';
import { SITE_ORIGIN } from '@/lib/env';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  /**
   * What every page's relative `alternates.canonical` is resolved against.
   *
   * Without it Next emits the canonical exactly as written -- `/kako-rangiramo`
   * rather than an absolute URL. A relative canonical is legal and self-refers,
   * which is survivable, but it also means every host that can serve this app
   * declares itself canonical: the `.netlify.app` deploy domain, `www`, and the
   * apex each vouch for their own copy. Netlify's redirect to the primary
   * domain is what keeps that from mattering in practice; this is what keeps it
   * from mattering in principle, and it costs one line.
   */
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: 'Pogrebne usluge',
    template: '%s · Pogrebne usluge',
  },
  /**
   * The fallback description, shown for any page that does not set its own.
   *
   * It says "Popis", not "Svi": the completeness promise belongs to
   * `coverageClaim` in lib/copy.ts, on the city pages where a reader can
   * actually check it. Naming the country here is a statement of what the
   * product is, not a claim to hold every provider in it -- which is also why
   * this line does not need editing each time a city is added.
   */
  description:
    'Popis registriranih pogrebnika u Hrvatskoj. Besplatno, bez prijave ' +
    'i bez posrednika.',
  /**
   * The site-wide half of the link preview.
   *
   * This exists because of something the product already assumes people do:
   * a family member sends the link to a sibling (see Navigation and state
   * rules -- shareability is why the flow's state lives in the URL at all).
   * Those links are opened in WhatsApp and Viber, which render a card from
   * these tags and a bare grey rectangle without them.
   *
   * Only the parts that are true of every page are here. `title`, `description`
   * and `url` are set per route, because `openGraph.title` does not inherit
   * from `title` -- a page that sets one and not the other gets the site
   * default in its card. `og:image` comes from `app/opengraph-image.tsx`,
   * which Next wires up for every route beneath this layout.
   *
   * No `twitter:` block: it falls back to the OpenGraph tags on every consumer
   * that matters here, and the product has no presence there to name.
   */
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    siteName: 'Pogrebne usluge',
    url: '/',
    title: 'Pogrebne usluge',
    description:
      'Popis registriranih pogrebnika u Hrvatskoj. Besplatno, bez prijave ' +
      'i bez posrednika.',
  },
};

export const viewport: Viewport = {
  // Painted explicitly: Kamen is single-theme, so the browser chrome should
  // not be left to guess from a system setting.
  themeColor: '#e9e5db',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hr">
      <head>
        {/*
          Preloaded: the two faces the first screenful needs — Spectral SC
          600 for headings and names, Archivo 400/500/600 for everything else.
          Spectral SC 400 and both `latin-ext` files are left to load on
          demand; `latin-ext` is fetched only by a page that actually renders
          a Croatian diacritic, which the unicode-range split handles on its
          own. Self-hosted, so these are same-origin requests and no third
          party sees the visitor's IP.
        */}
        <link
          rel="preload"
          href="/fonts/spectral-sc-600-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/archivo-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/*
          Masthead, page, footer — the shape every visitor already knows, and
          the replacement for the sticky desktop rail this layout used to hold.

          Both frames live here rather than in each page because both are
          identical on every route and carry nothing route-specific: no city,
          no count, no back link. That is what keeps this free of a database
          query, which matters because a fetch here would land on every page in
          the product, including the statically rendered prose pages.

          The contextual back link that used to sit in the header is now
          `PageBack`, rendered by the pages that have somewhere to go back to.
        */}
        <div className="shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
