'use client';

import { logEvent } from '@/lib/instrumentation';
import { formatPhone } from '@/lib/hours';
import { PHONE_TYPE_LABEL } from '@/lib/copy';
import type { Phone } from '@/lib/database.types';
import styles from './PhoneList.module.css';

/**
 * Every number a provider has, on the detail page only.
 *
 * **This is a deliberate exception to the "never display the number" rule.**
 * Choosing between a provider's office and dežurni line is core value on this
 * page, and hiding all of them behind clicks would be hostile on the one page
 * a family reaches after they have decided who to call. It also gives the
 * number a no-JavaScript path, which the list page's reveal does not have.
 *
 * The cost is that a number can be dialled here without a `phone_click`. That
 * leak is bounded, it always follows a recorded `detail_view`, and it
 * undercounts rather than overcounts — the safe direction to be wrong.
 */
export function PhoneList({ entityId, phones }: { entityId: string; phones: Phone[] }) {
  if (phones.length === 0) return null;

  return (
    <ul className={styles.list}>
      {phones.map((phone) => (
        <li key={`${phone.type}-${phone.number}`} className={styles.row}>
          <a
            className={styles.number}
            href={`tel:${phone.number}`}
            onClick={(event) => logEvent(entityId, 'phone_click', event.isTrusted)}
          >
            {formatPhone(phone.number)}
          </a>
          <span className={styles.type}>
            {PHONE_TYPE_LABEL[phone.type] ?? phone.type}
          </span>
        </li>
      ))}
    </ul>
  );
}
