'use client';

import { logEvent } from '@/lib/instrumentation';
import type { EventType } from '@/lib/database.types';

/**
 * A secondary text link that logs when it is followed — the website and email
 * links on the detail page.
 *
 * `rel="noopener noreferrer"` on the outbound case, and not only for the
 * window-opener hole: `noreferrer` stops the visitor's path through this site
 * being disclosed to the provider's server, which is the same posture that
 * keeps `events` free of a referrer column.
 */
export function ExternalLink({
  entityId,
  eventType,
  href,
  className,
  children,
}: {
  entityId: string;
  eventType: EventType;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isMailto = href.startsWith('mailto:');

  return (
    <a
      className={className}
      href={href}
      // mailto: hands off to a mail client; only a real URL opens a tab.
      target={isMailto ? undefined : '_blank'}
      rel={isMailto ? undefined : 'noopener noreferrer'}
      onClick={(event) => logEvent(entityId, eventType, event.isTrusted)}
    >
      {children}
    </a>
  );
}
