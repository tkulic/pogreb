'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  COFFIN,
  CREMATORIUM_CITIES_LOCATIVE,
  DEFAULT_EXTRAS,
  EXTRAS,
  estimate,
  formatEstimate,
  formatRange,
  type CoffinTier,
  type ExtraKey,
  type Krematorij,
} from '@/lib/costs';
import type { Nacin } from '@/lib/listing';
import { flowHref } from '@/lib/answers';
import styles from './CostCalculator.module.css';

/**
 * The cost estimator.
 *
 * **One screen, four questions, recomputing live.** It deliberately does *not*
 * follow the three-screen flow pattern: the flow is triage and its answers must
 * live in the URL so a result set can be shared, whereas this is a lookup
 * nobody shares. Forcing the wizard shape onto it would add steps whose only
 * purpose is consistency.
 *
 * That is also why state is local rather than in the query string. A URL that
 * encoded a coffin tier would be a link a grieving family could send to a
 * relative by accident, and the estimate is not a thing to send anyone.
 *
 * Three rules the markup has to keep:
 *
 * 1. **Every figure on screen is rounded to the same step**, and each total is
 *    the sum of the parts printed beneath it — `formatEstimate` guarantees it.
 *    Exact cents in the itemisation under a rounded total reads as an error.
 * 2. **"Poslije" never collapses.** The recurring grave fee is the one cost
 *    nobody is told about and the only one that never stops.
 * 3. **Assumptions live in the itemisation, never in the headline.**
 */
export function CostCalculator() {
  const [nacin, setNacin] = useState<Nacin>('ukop');
  const [krematorij, setKrematorij] = useState<Krematorij>('blizu');
  const [lijes, setLijes] = useState<CoffinTier>('standardni');
  const [extras, setExtras] = useState<readonly ExtraKey[]>(DEFAULT_EXTRAS);
  const [open, setOpen] = useState(false);

  const result = useMemo(
    () => estimate({ nacin, lijes, extras, krematorij }),
    [nacin, lijes, extras, krematorij],
  );
  const shown = useMemo(() => formatEstimate(result), [result]);

  const toggle = (key: ExtraKey) =>
    setExtras((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className={styles.calculator}>
      <form className={styles.questions} aria-label="Procjena troška pogreba">
        <Radio
          legend="Ukop ili kremiranje?"
          name="nacin"
          value={nacin}
          onChange={setNacin}
          options={[
            ['ukop', 'Ukop'],
            ['kremiranje', 'Kremiranje'],
          ]}
        />

        {/* The single geographic question, asked only where it changes the
            answer. Transport to a crematorium is a several-hundred-euro swing
            and the largest single thing we would get wrong by assuming — and
            the reader cannot answer it without being told where the crematoria
            actually are, because there are only two. */}
        {nacin === 'kremiranje' && (
          <Radio
            legend="Postoji li krematorij u vašem gradu?"
            name="krematorij"
            value={krematorij}
            onChange={setKrematorij}
            hint={`U Hrvatskoj krematorij postoji samo u ${CREMATORIUM_CITIES_LOCATIVE.join(' i ')}. Iz svih ostalih gradova pokojnika treba prevesti.`}
            options={[
              ['blizu', 'Da'],
              ['daleko', 'Ne'],
            ]}
          />
        )}


        <Radio
          legend="Lijes"
          name="lijes"
          value={lijes}
          onChange={setLijes}
          options={(Object.keys(COFFIN) as CoffinTier[]).map((k) => [k, COFFIN[k].label])}
        />

        <fieldset className={styles.field}>
          <legend className={styles.legend}>Dodatno</legend>
          <div className={styles.options}>
            {(Object.keys(EXTRAS) as ExtraKey[]).map((key) => (
              <label key={key} className={styles.option}>
                <input
                  type="checkbox"
                  name="dodatno"
                  checked={extras.includes(key)}
                  onChange={() => toggle(key)}
                />
                <span>{EXTRAS[key].label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <output className={styles.result}>
        <p className={styles.headlineLabel}>Okvirni trošak</p>
        <p className={styles.headline}>
          {formatRange(shown.headline.from, shown.headline.to)}
        </p>

        <dl className={styles.blocks}>
          <div className={styles.block}>
            <dt>Obavezne usluge</dt>
            <dd>{formatRange(shown.core.from, shown.core.to)}</dd>
          </div>
          <div className={styles.block}>
            <dt>Dodatne usluge</dt>
            <dd>{formatRange(shown.choices.from, shown.choices.to)}</dd>
          </div>
          {/* Never collapsed — see rule 2 above. */}
          <div className={styles.block}>
            <dt>Naknadni troškovi</dt>
            <dd>
              {result.deferred.map((d) => (
                <span key={d.label} className={styles.deferredItem}>
                  {d.label} {formatRange(d.from, d.to)}
                  {d.label.startsWith('Godišnja') ? ' godišnje, trajno' : ''}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        {/* Always shown, never conditional. The estimate covers opening a
            grave but never buying one, and that is true for every reader — so
            it is stated once, plainly, rather than sprung on the subset who
            answer a question we no longer ask. */}
        <p className={styles.unpriced}>
          <strong>Procjena uključuje otvaranje grobnog mjesta, ali ne i njegovu
          kupnju.</strong> Grobno mjesto se ne kupuje po cjeniku nego se
          dodjeljuje redoslijedom upisa, čekanje u većim gradovima traje
          godinama, a cijena ovisi o gradu i vrsti — od nekoliko stotina do više
          tisuća eura.
        </p>

        <button
          type="button"
          className={styles.disclose}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Sakrij izračun' : 'Prikaži izračun'}
        </button>

        {open && (
          <div className={styles.items}>
            <table className={styles.table}>
              <tbody>
                {shown.lines.map((l) => (
                  <tr key={`${l.block}-${l.label}`}>
                    <th scope="row">
                      {l.label}
                      {l.assumption && (
                        <span className={styles.assumption}>{l.assumption}</span>
                      )}
                    </th>
                    <td>{formatRange(l.from, l.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* The disclaimer is not fine print: it sits with the number, at
            readable size, because it is what makes the number honest. */}
        <p className={styles.disclaimer}>
          Ovo je procjena, a ne ponuda. Stvarni trošak ovisi o gradu, o
          pogrebniku kojeg odaberete i o odlukama koje donesete — cijene se
          razlikuju i među susjednim mjestima. Za točan iznos zatražite ponudu.
        </p>

        <Link
          href={flowHref({ answers: { nacin }, korak: 'mjesto' })}
          className={styles.cta}
        >
          Pronađite pogrebnika i zatražite ponudu
        </Link>
      </output>
    </div>
  );
}

/** A question. Radios rather than tiles: this is a form, not a navigation. */
function Radio<T extends string>({
  legend,
  name,
  value,
  onChange,
  options,
  hint,
}: {
  legend: string;
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
  /** Shown above the options, for a question the label alone cannot carry. */
  hint?: string;
}) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.options}>
        {options.map(([key, label]) => (
          <label key={key} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
