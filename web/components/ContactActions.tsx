'use client';

import { useState } from 'react';
import { ActionLink } from './ActionLink';
import { PhoneIcon } from './PhoneIcon';
import { logEvent } from '@/lib/instrumentation';
import { formatPhone } from '@/lib/hours';
import styles from './ContactActions.module.css';

type ContactActionsProps = {
  entityId: string;
  /** E.164, already chosen by the phone-selection rule. Null = no number held. */
  phoneNumber: string | null;
  /** True when we are handing over the dežurni line because the office is shut. */
  isAfterHours: boolean;
  /** Rendered only when non-null — no disabled control, no reserved space. */
  email: string | null;
  /** Our own detail page for this provider, with the flow's answers preserved. */
  detailHref: string;
};

/**
 * The three contact actions on a shortlist card, on one line.
 *
 * **The number is revealed by the click that logs it.** A visible phone number
 * can be dialled by hand, producing the conversion without producing the
 * `phone_click` that is this product's only evidence it happened. Hiding it is
 * a small usability tax paid to protect the one metric the pitch rests on —
 * and any leak *undercounts*, which is the safe direction to be wrong.
 *
 * One piece of markup is correct on both platforms: on mobile the browser
 * dials natively and the revealed number is there if the handoff fails; on
 * desktop, where `tel:` usually does nothing visible, **the reveal is the
 * outcome**.
 *
 * Labels are **vi-form imperatives** — "Nazovite", not "Nazovi". The ti-form
 * is familiar address, and addressing a stranger organising a funeral that way
 * is the wrong register in Croatian.
 */
export function ContactActions({
  entityId,
  phoneNumber,
  isAfterHours,
  email,
  detailHref,
}: ContactActionsProps) {
  const [revealed, setRevealed] = useState(false);

  /**
   * Reveal synchronously, log fire-and-forget, in that order.
   *
   * The order is a requirement, not a style choice: a failed or slow log must
   * never delay the `tel:` handoff. The contact is the point; the metric is
   * not.
   */
  const handlePhoneClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setRevealed(true);
    logEvent(entityId, 'phone_click', event.isTrusted);
  };

  // The detail link always exists, so the row is never empty.
  const count = [phoneNumber, email, detailHref].filter(Boolean).length;
  const width = count === 1 ? styles.one : count === 2 ? styles.two : '';

  return (
    <div className={`${styles.actions} ${width}`}>
      {phoneNumber && (
        <ActionLink
          variant="primary"
          className={styles.action}
          href={`tel:${phoneNumber}`}
          onClick={handlePhoneClick}
        >
          <PhoneIcon />
          Nazovite
        </ActionLink>
      )}

      {/*
        Subject prefilled, body never: a prefilled body would put words in a
        grieving person's mouth. The label says what actually happens — not
        "Pošaljite upit", which would imply an in-product form this product
        deliberately does not have.
      */}
      {email && (
        <ActionLink
          variant="secondary"
          className={styles.action}
          href={`mailto:${email}?subject=${encodeURIComponent('Upit o pogrebnim uslugama')}`}
          onClick={(event) => logEvent(entityId, 'email_click', event.isTrusted)}
        >
          Pošaljite e-mail
        </ActionLink>
      )}

      {/*
        The third action goes to **our** detail page, not to the provider's
        website. Two reasons, and the second is the one that matters:

        1. The detail page is where this provider is actually presented — every
           number with its type, opening hours, the full service list. A visitor
           sent straight to the provider's own site leaves the product at the
           moment they were still deciding.
        2. It keeps the outbound click on a page where a `detail_view` has
           already been recorded, so nothing is dialled or followed off an
           untracked surface. This is the same reasoning the others block
           already uses, applied to the shortlist.

        It logs nothing itself: the destination fires `detail_view` on mount,
        and logging here as well would count one navigation twice.
      */}
      <ActionLink variant="secondary" className={styles.action} href={detailHref}>
        Saznajte više
      </ActionLink>

      {/*
        Once revealed it stays revealed for this page view. Clicking the
        revealed number logs again — that is a real second call attempt, and
        the hourly cap inside log_event bounds any abuse.
      */}
      {phoneNumber && revealed && (
        <div className={styles.revealedRow}>
          <a className={styles.revealed} href={`tel:${phoneNumber}`} onClick={handlePhoneClick}>
            {formatPhone(phoneNumber)}
            {isAfterHours && <span className={styles.afterHours}>dežurni telefon</span>}
          </a>
        </div>
      )}
    </div>
  );
}
