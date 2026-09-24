'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMounted } from './useMounted';
import { logEvent } from '@/lib/instrumentation';
import { formatPhone, selectDisplayPhone } from '@/lib/hours';
import type { Provider } from '@/lib/queries';
import styles from './RowActions.module.css';

/**
 * The three actions on a listing row, as icons.
 *
 * Replaced `ContactActions` on the listing pages on 2026-09-24, when the card
 * became a row. Three full-width labelled buttons were ~48px and the single
 * largest block of a card; three icons are 42px and sit beside the services
 * disclosure on a line that already exists. `ContactActions` stays as it is on
 * the provider detail page, where the labels have room and belong.
 *
 * ## The third action is *our* detail page, not the provider's website
 *
 * This is deliberate and it is the opposite of what a directory usually does.
 * `detail_view` is by some distance the most logged action in the product —
 * 16 of 21 events — so people are genuinely using the site to compare, and the
 * row should make that easy rather than push them off it. The provider's own
 * website appears on the detail page, one step further on, where the reader
 * has seen the hours and the full service list first.
 *
 * It logs nothing itself: the destination fires `detail_view` on mount, and
 * logging here too would count one navigation twice.
 *
 * ## Icons carry `aria-label`, and two of the three are unambiguous
 *
 * A tooltip is a hover affordance and 73% of this product's traffic is mobile,
 * where there is no hover — so an icon-only control has to be legible on its
 * own. A handset and an envelope are; that is why the two actions that survived
 * as bare glyphs are those two, and why the third is an arrow meaning "open
 * this", the one list convention a reader does not have to learn.
 */
export function RowActions({
  provider,
  detailHref,
}: {
  provider: Provider;
  detailHref: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const mounted = useMounted();

  // Before mount: the stored primary, never after-hours — which is what
  // `selectDisplayPhone` itself returns when it has no grounds to promote the
  // dežurni line. The pre-hydration render makes no claim it cannot keep, and
  // it is what lets these pages be statically cached at all.
  const phones = provider.phones ?? [];
  const selected = mounted
    ? selectDisplayPhone(provider)
    : phones.length > 0
      ? { phone: phones[0], isAfterHours: false }
      : null;

  const phoneNumber = selected?.phone.number ?? null;
  const isAfterHours = selected?.isAfterHours ?? false;

  /**
   * Reveal synchronously, log fire-and-forget, in that order — a slow or
   * failed log must never delay the `tel:` handoff.
   *
   * **The reveal is a desktop concern.** On mobile the tap dials and the click
   * is counted in the same gesture; on desktop `tel:` usually does nothing
   * visible, so showing the number *is* the outcome. Either way the number is
   * only obtainable through the click that logs it, which is what keeps
   * `phone_click` a complete count rather than a sample.
   */
  const handlePhoneClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setRevealed(true);
    logEvent(provider.id, 'phone_click', event.isTrusted);
  };

  return (
    <span className={styles.wrap}>
      <span className={styles.actions}>
        {phoneNumber && (
          <a
            className={styles.call}
            href={`tel:${phoneNumber}`}
            aria-label="Nazovite"
            onClick={handlePhoneClick}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M8.4 4H5.2C4.5 4 4 4.6 4 5.3 4 13.9 10.1 20 18.7 20c.7 0 1.3-.5 1.3-1.2v-3.2c0-.6-.4-1.1-1-1.2l-3-.6c-.5-.1-1 .1-1.2.6l-.9 1.7c-2.5-1.1-4.5-3.1-5.6-5.6l1.7-.9c.5-.2.7-.7.6-1.2l-.6-3c-.1-.6-.6-1-1.2-1Z" />
            </svg>
          </a>
        )}

        {/*
          Subject prefilled, body never — a prefilled body would put words in a
          grieving person's mouth.
        */}
        {provider.email && (
          <a
            className={styles.quiet}
            href={`mailto:${provider.email}?subject=${encodeURIComponent('Upit o pogrebnim uslugama')}`}
            aria-label="Pošaljite e-mail"
            onClick={(event) => logEvent(provider.id, 'email_click', event.isTrusted)}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
              <path d="m3.6 6.8 8.4 5.9 8.4-5.9" />
            </svg>
          </a>
        )}

        <Link
          className={styles.quiet}
          href={detailHref}
          aria-label={`Saznajte više — ${provider.name}`}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4.5 12h14" />
            <path d="m12.5 6 6 6-6 6" />
          </svg>
        </Link>
      </span>

      {/*
        Once revealed it stays revealed for this page view. Clicking the
        revealed number logs again — that is a real second call attempt, and
        the hourly cap inside `log_event` bounds any abuse.
      */}
      {phoneNumber && revealed && (
        <a className={styles.revealed} href={`tel:${phoneNumber}`} onClick={handlePhoneClick}>
          {formatPhone(phoneNumber)}
          {isAfterHours && <span className={styles.afterHours}>dežurni</span>}
        </a>
      )}
    </span>
  );
}
