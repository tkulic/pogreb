'use client';

import { useState } from 'react';
import { ActionLink } from './ActionLink';
import { PhoneIcon } from './PhoneIcon';
import { useMounted } from './useMounted';
import { logEvent } from '@/lib/instrumentation';
import { formatPhone, selectDisplayPhone } from '@/lib/hours';
import type { Entity } from '@/lib/database.types';
import styles from './ContactActions.module.css';

type ContactActionsProps = {
  entityId: string;
  /**
   * The raw fields the phone rule reads — **not** a pre-selected number.
   * See the note on timing below for why the choice is made here.
   */
  provider: Pick<Entity, 'available_24_7' | 'working_hours' | 'phones'>;
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
 *
 * ## Why the number is chosen here rather than handed in
 *
 * `selectDisplayPhone` used to run in the server component that rendered this
 * card, and the result arrived as a prop. That was **already wrong on the
 * service listing pages**, which are statically prerendered: the choice froze
 * at build time, so those pages would hand a family the office line at 3am —
 * precisely the failure the rule exists to prevent. It also forced the results
 * and detail pages to be `force-dynamic`, which is what made the site
 * uncacheable and stalled crawling (`.seo/ANALYSIS_2026-09-24.md` → ROOT
 * CAUSE).
 *
 * Running it here fixes both. Until mount we render the **stored primary
 * number** — which is `selectDisplayPhone`'s own answer whenever it has no
 * reason to promote the dežurni line, so the fallback is the rule's own
 * behaviour rather than an invention. The swap is invisible in practice
 * because the number is not shown until the reader clicks.
 */
export function ContactActions({
  entityId,
  provider,
  email,
  detailHref,
}: ContactActionsProps) {
  const [revealed, setRevealed] = useState(false);
  const mounted = useMounted();

  // Before mount: the stored primary, never after-hours. See the note above --
  // this is what the rule itself returns when it has no grounds to promote the
  // emergency line, so the pre-hydration render makes no claim it cannot keep.
  const phones = provider.phones ?? [];
  const selected = mounted
    ? selectDisplayPhone(provider)
    : phones.length > 0
      ? { phone: phones[0], isAfterHours: false }
      : null;

  const phoneNumber = selected?.phone.number ?? null;
  const isAfterHours = selected?.isAfterHours ?? false;

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
