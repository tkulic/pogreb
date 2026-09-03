import type { Metadata, Viewport } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
