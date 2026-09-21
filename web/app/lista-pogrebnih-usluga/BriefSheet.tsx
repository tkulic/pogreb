'use client';

import { useMemo, useRef, useState } from 'react';
import { Logo } from '@/components/Logo';
import { logCityEvent } from '@/lib/instrumentation';
import type { FlowAnswers } from '@/lib/answers';
import { briefHref } from '@/lib/answers';
import {
  RARE_SERVICES,
  briefText,
  situationLines,
  type SheetService,
} from '@/lib/brief';
import { CANONICAL_SERVICE_ORDER } from '@/lib/services';
import styles from './brief.module.css';

/**
 * The sheet itself — a worksheet on screen, a document on paper.
 *
 * SPEC_frontend.md → The list a family carries is the source of truth. Three
 * rules the markup has to keep:
 *
 * 1. **No text input anywhere.** A name-and-number box would put the family's
 *    own contact details into a URL meant to be shared and into a server log,
 *    reopening the question the no-PII design closes. The printed sheet
 *    carries ruled lines instead, filled in by hand.
 * 2. **The ticks live in the URL**, like every other piece of flow state, so a
 *    sheet survives a refresh and can be sent to a sibling. `?trebam=` present
 *    but empty is a real state and must round-trip.
 * 3. **Nothing here names a provider.** The family may visit two, and a
 *    routed sheet carrying our mark would read as a referral.
 */

const TITLE = 'Lista pogrebnih usluga';

/**
 * The foot of the sheet, and the only thing on it addressed to the funeral
 * director rather than to the family.
 *
 * Owner's wording, 2026-09-21. It answers his first question — *who are these
 * people* — which is what makes the sheet work as a supply-side channel.
 */
const TAGLINE = 'Besplatni agregator pogrebnih usluga u Hrvatskoj.';

/**
 * Not a notes box.
 *
 * This is what a family would otherwise write in one, and it is the better
 * trade: guidance is what this product is good at, and it needs no input. Kept
 * short — five questions a reader will actually ask, not a checklist that
 * makes the sheet two pages.
 */
const QUESTIONS: readonly string[] = [
  'Što je uključeno u cijenu, a što se naplaćuje odvojeno?',
  'Tko preuzima pokojnika i kada?',
  'Koje dokumente trebamo pribaviti, a koje pribavljate vi?',
  'Kada možemo dobiti pisanu ponudu?',
  'Koji su troškovi koji dolaze kasnije, nakon pogreba?',
];

type BriefSheetProps = {
  grad: string;
  /** For `brief_export`. `city_events` keys on the id, never on the slug. */
  cityId: string;
  areaLabel: string;
  answers: FlowAnswers;
  common: readonly SheetService[];
  rare: readonly SheetService[];
  initialTicks: readonly string[];
  date: string;
};

export function BriefSheet({
  grad,
  cityId,
  areaLabel,
  answers,
  common,
  rare,
  initialTicks,
  date,
}: BriefSheetProps) {
  const [ticks, setTicks] = useState<readonly string[]>(initialTicks);
  // Opens on load when something inside it is already ticked — otherwise a
  // shared sheet would hide a service the sender had chosen.
  const [showRare, setShowRare] = useState(
    () => initialTicks.some((slug) => RARE_SERVICES.includes(slug)),
  );
  const [note, setNote] = useState<string | null>(null);

  const lines = useMemo(() => situationLines(answers), [answers]);
  const all = useMemo(() => [...common, ...rare], [common, rare]);
  const ticked = useMemo(
    () =>
      CANONICAL_SERVICE_ORDER.map((slug) => all.find((s) => s.slug === slug)).filter(
        (s): s is SheetService => s !== undefined && ticks.includes(s.slug),
      ),
    [all, ticks],
  );

  /**
   * Toggle, and rewrite the URL to match.
   *
   * `history.replaceState` rather than `router.replace`: this page is
   * `force-dynamic`, so a router navigation would round-trip to the server on
   * every tick to re-render a list the client already holds. The URL is what
   * has to stay correct — it is the thing that gets shared.
   */
  const toggle = (slug: string) => {
    const next = ticks.includes(slug)
      ? ticks.filter((s) => s !== slug)
      : CANONICAL_SERVICE_ORDER.filter((s) => s === slug || ticks.includes(s));
    setTicks(next);
    setNote(null);
    window.history.replaceState(null, '', briefHref({ grad, answers, ticks: next }));
  };

  /**
   * `brief_export`, logged once per mount on the first export gesture.
   *
   * **Not on mount**, because arriving at the sheet is not carrying it away —
   * that would count every refresh and every shared link opened to look, and
   * turn the one number meant to show the feature works into a page view.
   *
   * **Once, not per button**, for the same reason `detail_view` is guarded
   * against StrictMode: a family that shares the sheet and then prints it
   * carried out one export, and counting two would inflate precisely the
   * engaged reader. A ref rather than state, so recording it never re-renders.
   */
  const exported = useRef(false);
  const logExport = () => {
    if (exported.current) return;
    exported.current = true;
    logCityEvent(cityId, 'brief_export');
  };

  const asText = () =>
    briefText({
      title: TITLE,
      areaLabel,
      date,
      lines,
      ticked,
      tagline: TAGLINE,
      url: window.location.href,
    });

  /**
   * Fire and forget, like every other outbound gesture in this product: a
   * rejected share (the user dismissed the sheet) is not an error, and nothing
   * about it should reach the reader.
   */
  const share = async () => {
    const url = window.location.href;
    // Before the await, never after it: the log must not depend on whether
    // the reader completes the share sheet, and it must never delay it.
    logExport();
    try {
      if (navigator.share) {
        /**
         * **`url` and `title` only — never `text` alongside them.**
         *
         * A share containing both is handled inconsistently: WhatsApp, Viber
         * and Messenger concatenate the two and send the address as a run of
         * characters in a sentence, which is what stops the recipient getting
         * a tappable link and a preview card. Sharing a bare URL is what makes
         * the target treat it as a link, and the card the root layout's
         * OpenGraph tags already describe is what then renders.
         *
         * The sheet as prose is a separate gesture, and it is the button
         * beside this one.
         */
        await navigator.share({ title: TITLE, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNote('Poveznica je kopirana.');
    } catch {
      /* dismissed, or no clipboard permission — nothing to say */
    }
  };

  const copy = async () => {
    logExport();
    try {
      await navigator.clipboard.writeText(asText());
      setNote('Lista je kopirana.');
    } catch {
      setNote('Kopiranje nije uspjelo. Označite tekst i kopirajte ručno.');
    }
  };

  return (
    <div className={styles.wrap}>
      <article className={styles.sheet}>
        <header className={styles.head}>
          {/*
            The mark, on the one page in this product that leaves the browser.
            It is what makes the sheet recognisable as a thing from somewhere
            when it is sitting on a funeral director's desk — which is the
            whole reason the sheet is branded at all.

            An `<img>` rather than a background, so it survives the browser's
            "no background graphics" print default.
          */}
          <p className={styles.brand}>
            <Logo className={styles.mark} />
            <span>pogreb.net</span>
          </p>
          <h1 className={styles.title}>{TITLE}</h1>
          <p className={styles.meta}>
            {areaLabel} · {date}
          </p>
        </header>

        {lines.length > 0 && (
          <section className={styles.situation}>
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
        )}

        <section className={styles.block}>
          <h2 className={styles.blockHeading}>Trebamo</h2>

          <ul className={styles.services}>
            {common.map((s) => (
              <ServiceRow
                key={s.slug}
                service={s}
                checked={ticks.includes(s.slug)}
                onToggle={toggle}
              />
            ))}
          </ul>

          {rare.length > 0 && (
            <>
              <button
                type="button"
                className={styles.disclose}
                aria-expanded={showRare}
                onClick={() => setShowRare((v) => !v)}
              >
                {showRare ? 'Sakrij ostale usluge' : 'Prikaži sve usluge'}
              </button>
              {showRare && (
                <ul className={styles.services}>
                  {rare.map((s) => (
                    <ServiceRow
                      key={s.slug}
                      service={s}
                      checked={ticks.includes(s.slug)}
                      onToggle={toggle}
                    />
                  ))}
                </ul>
              )}
            </>
          )}

          {/*
            Printed only. The sheet on screen is a worksheet and the family can
            tick another box; on paper it is a statement, and the director will
            want somewhere to add what they discuss.
          */}
          <div className={styles.printOnly} aria-hidden="true">
            <p className={styles.ruleLabel}>Ostalo</p>
            <span className={styles.ruledLine} />
            <span className={styles.ruledLine} />
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockHeading}>Pitanja koja vrijedi postaviti</h2>
          <ul className={styles.questions}>
            {QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>

        {/*
          Printed only, and the reason there is no input on screen: the family
          writes this in by hand, so we never hold it.
        */}
        <section className={`${styles.block} ${styles.printOnly}`} aria-hidden="true">
          <h2 className={styles.blockHeading}>Kontakt obitelji</h2>
          <p className={styles.ruleLabel}>Ime i prezime</p>
          <span className={styles.ruledLine} />
          <p className={styles.ruleLabel}>Telefon</p>
          <span className={styles.ruledLine} />
        </section>

        <footer className={styles.foot}>
          <p className={styles.tagline}>{TAGLINE}</p>
          <p className={styles.url}>pogreb.net</p>
        </footer>
      </article>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={share}>
          Podijelite listu
        </button>
        <button type="button" className={styles.secondary} onClick={copy}>
          Kopirajte kao tekst
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => {
            logExport();
            window.print();
          }}
        >
          Ispišite
        </button>
        {/* Polite, not assertive: a confirmation must not interrupt a reader
            who has already moved on to the next control. */}
        <p className={styles.note} role="status" aria-live="polite">
          {note}
        </p>
      </div>

      <p className={styles.help}>
        Označite što vam treba, pa pokažite ili pošaljite ovu listu pogrebniku.
        Ništa od ovoga ne šaljemo nikome — lista ostaje kod vas.
      </p>
    </div>
  );
}

/** One checkbox. A real `<input>`, so it works with a keyboard and a reader. */
function ServiceRow({
  service,
  checked,
  onToggle,
}: {
  service: SheetService;
  checked: boolean;
  onToggle: (slug: string) => void;
}) {
  return (
    <li className={checked ? `${styles.row} ${styles.rowOn}` : styles.row}>
      <label className={styles.option}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(service.slug)}
        />
        <span>{service.name}</span>
      </label>
    </li>
  );
}
