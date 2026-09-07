'use client';

import { ActionLink } from './ActionLink';
import { logEvent } from '@/lib/instrumentation';

/**
 * The e-mail action as a button, for the detail page's pair of CTAs.
 *
 * It exists because the detail page is a server component and the click has to
 * be logged, which needs a client boundary — and because the only other place
 * that renders this action, `ContactActions`, carries the shortlist card's
 * reveal behaviour with it. That reveal is deliberately absent here: the detail
 * page shows every number in full, so there is nothing to reveal.
 *
 * Subject prefilled, body never. A prefilled body would put words in a
 * grieving person's mouth, and the label says what actually happens rather
 * than implying an in-product form this product does not have.
 */
export function EmailAction({
  entityId,
  email,
  className,
}: {
  entityId: string;
  email: string;
  className?: string;
}) {
  return (
    <ActionLink
      variant="secondary"
      className={className}
      href={`mailto:${email}?subject=${encodeURIComponent('Upit o pogrebnim uslugama')}`}
      onClick={(event) => logEvent(entityId, 'email_click', event.isTrusted)}
    >
      Pošaljite e-mail
    </ActionLink>
  );
}
