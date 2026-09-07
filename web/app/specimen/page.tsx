import type { Metadata } from 'next';
import { ActionLink } from '@/components/ActionLink';
import { AvailabilityMark } from '@/components/AvailabilityMark';
import { PhoneIcon } from '@/components/PhoneIcon';
import { SectionHeading } from '@/components/SectionHeading';
import styles from './specimen.module.css';

/**
 * A visual specimen of the Kamen system — every colour token with its measured
 * contrast ratio, the full type scale, the diacritic test string in both
 * faces, and the shared primitives.
 *
 * The primitives below are the **real components**, imported, not restyled
 * copies. That is the point: a specimen that duplicated their CSS would drift
 * from them and quietly stop being a check. Only the type scale is transcribed
 * here, because those roles live in the components that use them.
 *
 * Not part of the product: noindex, and excluded from the sitemap.
 */
export const metadata: Metadata = {
  title: 'Kamen — specimen',
  robots: { index: false, follow: false },
};

const DIACRITICS = 'Čč Ćć Žž Šš Đđ';
const TEST_LINE = 'Pogrebne usluge Čagalj · Žrnovnica · Đakovo · Šibenik';

const COLOURS: { token: string; ratio: string; use: string }[] = [
  { token: '--ink', ratio: '13.64:1', use: 'names, headings, call-button fill' },
  { token: '--ink-quiet', ratio: '9.53:1', use: 'names in the others block' },
  { token: '--ink-body', ratio: '8.31:1', use: 'service lists, body copy' },
  { token: '--text-secondary', ratio: '4.52:1', use: 'addresses, footer' },
  { token: '--text-label', ratio: '4.52:1', use: 'uppercase tracked labels' },
  { token: '--text-muted', ratio: '4.52:1', use: 'helper lines' },
  { token: '--gold', ratio: '4.79:1', use: 'rules, reason line, 24-hour mark' },
  { token: '--gold-link', ratio: '4.79:1', use: 'links' },
];

const SCALE: { role: string; className: keyof typeof styles }[] = [
  { role: 'page title · Spectral SC 600 · 22px · .08em', className: 'pageTitle' },
  { role: 'city line · Spectral SC 400 · 14.5px · .13em', className: 'cityLine' },
  { role: 'card name · Spectral SC 600 · 17px · .05em', className: 'cardName' },
  { role: 'card name, others · Spectral SC 400 · 14px · .05em', className: 'cardNameQuiet' },
  { role: 'reason line · Spectral SC 400 · 13px · .04em', className: 'reasonLine' },
  { role: 'uppercase label · Archivo 400 · 10.5px · .17em', className: 'label' },
  { role: 'context value · Archivo 400 · 14.5px', className: 'contextValue' },
  { role: 'address · Archivo 400 · 13px', className: 'address' },
  { role: 'service list · Archivo 400 · 12.5px · lh 1.75', className: 'serviceList' },
  { role: 'footer · Archivo 400 · 12px · lh 1.8', className: 'footer' },
];

export default function SpecimenPage() {
  return (
    <main className={`page ${styles.root}`}>
      <h1 className={styles.h1}>Kamen — specimen</h1>
      <p className={styles.intro}>
        Not part of the product. Renders every token and shared primitive so a
        regression is visible at a glance. The primitives are the real
        components; only the type scale is transcribed.
      </p>

      <section className={styles.section}>
        <h2 className={styles.h2}>Diacritics</h2>
        <p className={styles.note}>
          Both faces are self-hosted and vendored. Check <code>Đ</code> and{' '}
          <code>đ</code> here by eye after any font change: they must carry a
          stroke through the stem, not a macron above it. That is what Cinzel
          got wrong, and it is why the display face is Spectral SC.
        </p>
        <p className={styles.specimenDisplay}>{DIACRITICS}</p>
        <p className={styles.specimenDisplay600}>{DIACRITICS}</p>
        <p className={styles.specimenText}>{TEST_LINE}</p>
        <p className={styles.specimenText500}>{TEST_LINE}</p>
        <p className={styles.specimenText600}>{TEST_LINE}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Colour on --stone</h2>
        <ul className={styles.swatches}>
          {COLOURS.map((c) => (
            <li key={c.token + c.use} className={styles.swatch}>
              <span
                className={styles.swatchText}
                style={{ color: `var(${c.token})` }}
              >
                {c.token}
              </span>
              <span className={styles.swatchMeta}>
                {c.ratio} · {c.use}
              </span>
            </li>
          ))}
        </ul>
        <div className={`stoneTexture ${styles.band}`} />
        <p className={styles.note}>
          Above: <code>--stone-inset</code> with the stone texture, closed by a
          gold rule. Decorative only — no text token reaches AA on it, so it is
          never a ground for type.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Type scale</h2>
        <ul className={styles.scale}>
          {SCALE.map((s) => (
            <li key={String(s.className)} className={styles.scaleRow}>
              <span className={styles.scaleMeta}>{s.role}</span>
              <span className={styles[s.className]}>{TEST_LINE}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Section headings</h2>
        <SectionHeading count={4}>Najbolje odgovara</SectionHeading>
        <SectionHeading count={3} quiet>
          Ostali pogrebnici
        </SectionHeading>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>24-hour mark</h2>
        <p className={styles.note}>
          Never colour-only — both variants carry the words. Filled uses{' '}
          <code>--stone</code> on <code>--gold</code> (4.79:1);{' '}
          <code>--gold-on-ink</code> would measure 3.55 here and fail.
        </p>
        <div className={styles.row}>
          <AvailabilityMark variant="filled" />
          <AvailabilityMark variant="outlined" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Buttons</h2>
        <p className={styles.note}>
          Exactly two styles exist and a third may not be added. Both render an{' '}
          <code>&lt;a&gt;</code>, never a <code>&lt;button&gt;</code>. Neither
          displays the address it acts on — the number is revealed by the click
          that logs it.
        </p>
        <div className={styles.row}>
          <ActionLink variant="primary" href="#specimen">
            <PhoneIcon />
            Nazovite
          </ActionLink>
          <ActionLink variant="secondary" href="#specimen">
            Pošaljite e-mail
          </ActionLink>
        </div>
        <p className={styles.note}>Urgent path — phone full width:</p>
        <ActionLink variant="primary" href="#specimen" fullWidth>
          <PhoneIcon />
          Nazovite
        </ActionLink>
        <p className={styles.note}>
          A revealed number is not a third button style — it is a{' '}
          <code>--gold-link</code> text link at 14px with tabular figures:
        </p>
        <a className={styles.revealed} href="#specimen">
          +385 21 389 890
        </a>
      </section>
    </main>
  );
}
