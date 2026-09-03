'use client';

import { useEffect, useRef } from 'react';
import { logEvent } from '@/lib/instrumentation';

/**
 * Logs one `detail_view`, from the client, after mount.
 *
 * **This must never move into the Server Component**, and this page is the
 * highest-risk instance of that rule in the product. The results page links to
 * up to seven detail pages, so Next's `<Link>` prefetch on hover would
 * otherwise log a view for every provider a user merely scrolled past —
 * inflating precisely the providers drawing the most attention, which is the
 * worst possible bias in the one dataset whose value is being trustworthy.
 *
 * A post-mount effect is immune: prefetch fetches the RSC payload without
 * mounting client components. The same effect also excludes non-JS crawlers,
 * link-preview unfurlers and uptime checks.
 *
 * Renders nothing.
 */
export function DetailViewLogger({ entityId }: { entityId: string }) {
  // Guards React StrictMode's double-invoked effects and any re-render.
  // Without it every view is double-counted in development — and, worse, the
  // habit of not guarding would eventually ship.
  const logged = useRef<string | null>(null);

  useEffect(() => {
    if (logged.current === entityId) return;
    logged.current = entityId;
    logEvent(entityId, 'detail_view');
  }, [entityId]);

  return null;
}
