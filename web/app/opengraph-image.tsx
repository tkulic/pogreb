import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * The link-preview image, drawn rather than shipped as a binary.
 *
 * Next renders this once at build time and serves it as a static asset, and
 * every route beneath the root layout inherits it as `og:image`. Drawing it
 * here keeps the Kamen palette in one language instead of forking it into an
 * image file nobody can diff, and it adds no third-party request -- the font
 * is the one bundled with `next/og`, not a Google fetch (SPEC.md -> the app
 * ships from a single origin).
 *
 * **Every string here is deliberately free of Croatian diacritics.** The
 * bundled fallback face is not one this project has put through the diacritic
 * gate (SPEC_frontend.md -> The diacritic constraint), and a preview card
 * rendering `Dakovo` for `Đakovo` would be the most visible possible version
 * of exactly the failure that gate exists to prevent. Keeping the copy to
 * plain Latin sidesteps the question rather than betting on the answer. If
 * this image ever needs a diacritic, vendor a face into `fonts` first and
 * check it by eye.
 */

export const alt = 'Pogrebne usluge — popis registriranih pogrebnika u Hrvatskoj';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Kamen, from SPEC_frontend.md -> Colour tokens. Restated as literals because
// this renders outside the browser, where the CSS custom properties do not
// exist.
const STONE = '#E9E5DB';
const INK = '#1E1B16';
const INK_BODY = '#443F35';
const GOLD = '#7A5F22';

/**
 * The mark, inlined as a data URI.
 *
 * Satori resolves `<img src>` from a URL or a data URI and nothing else, and a
 * URL here would mean this build step fetching over the network to draw a file
 * that is already on disk. So it is read at build time and base64'd into the
 * card; the cost lands entirely in the build, and what ships is the flattened
 * PNG this route returns.
 *
 * It reads the *master* in `web/assets/` rather than the 189px mark in
 * `public/`, because the card draws it at 124px on a 1200x630 canvas that
 * viewers routinely see scaled up — and the master is not a shipped asset, so
 * using the large one costs a visitor nothing. `process.cwd()` is `web/`
 * during `next build`, which is the same anchor Next's own docs use for
 * loading fonts into an `ImageResponse`.
 */
const MARK = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), 'assets', 'logo-master.png'))
  .toString('base64')}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: STONE,
          /* Tightened from 96px when the mark was added: the card's vertical
             budget is fixed at 630px and the mark spends 136 of it. */
          padding: '78px 110px',
        }}
      >
        {/*
          The mark, above the rule and the name it belongs to.

          A preview card is the one surface where the product is seen before it
          is read — in a WhatsApp thread, under a link a sibling sent — and
          until now this card carried the palette but no identity. The mark is
          the fastest thing on it to recognise a second time.

          Aspect ratio is the master's, 1012x600, held exactly: Satori does not
          apply `object-fit`, so a mismatch here silently stretches the artwork.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK} alt="" width={169} height={100} style={{ marginBottom: 36 }} />

        {/* Gold is a cut line, never a surface — the one rule Kamen will not bend. */}
        <div style={{ width: 132, height: 3, background: GOLD, marginBottom: 54 }} />

        <div
          style={{
            fontSize: 92,
            letterSpacing: '-0.01em',
            color: INK,
            lineHeight: 1.1,
          }}
        >
          Pogrebne usluge
        </div>

        <div style={{ fontSize: 40, color: INK_BODY, marginTop: 28, lineHeight: 1.35 }}>
          Svi registrirani pogrebnici u Hrvatskoj.
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            justifyContent: 'space-between',
            fontSize: 27,
            color: GOLD,
            letterSpacing: '0.14em',
          }}
        >
          <span>POGREB.NET</span>
          <span>BESPLATNO · BEZ POSREDNIKA</span>
        </div>
      </div>
    ),
    size,
  );
}
