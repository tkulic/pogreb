import type { Metadata, Viewport } from 'next';
import { SiteRail } from '@/components/SiteRail';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pogrebne usluge',
    template: '%s · Pogrebne usluge',
  },
  description:
    'Popis registriranih pogrebnika u Splitu i okolici. Besplatno, bez ' +
    'prijave i bez posrednika.',
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
          The shell is a plain wrapper on a phone and a two-column grid on a
          desktop viewport — rail beside content, both centred as one block.

          It lives in the root layout rather than in each page because the rail
          is identical on every route and carries nothing route-specific: no
          city, no count, no back link. That is what keeps this free of a
          database query, which matters because a fetch here would land on
          every page in the product, including the statically rendered prose
          pages.
        */}
        <div className="shell">
          <SiteRail />
          {children}
        </div>
      </body>
    </html>
  );
}
