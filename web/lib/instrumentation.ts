import { supabase } from './supabase';
import { SITE_HOST } from './env';
import type { EventType } from './database.types';

/**
 * Anonymous usage logging.
 *
 * `events` is written exclusively by the `log_event` Postgres function — a
 * `security definer` RPC. The client can assert only *which provider* and
 * *which event*; `occurred_at`, `source` and `device` are all decided
 * server-side, and `anon` holds no table privileges at all
 * (SPEC_database.md → Usage logging).
 *
 * Every rule in this file closes a pollution source that **no amount of
 * server-side filtering can recover from**. They are requirements, not
 * preferences.
 */

/**
 * Rule 2 — the environment guard.
 *
 * `npm run dev` points at the production database. There is no local database
 * and no staging environment, so without this guard the developer's own page
 * refreshes would be the single largest contributor to the table in month one,
 * and the numbers it exists to produce would stop being quotable.
 *
 * Both halves are required: a production build served from `localhost` is
 * still not the real site, and `NEXT_PUBLIC_SITE_HOST` being unset means
 * nothing is logged rather than everything.
 */
export function shouldLog(): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  if (typeof window === 'undefined') return false;
  if (!SITE_HOST) return false;

  const host = window.location.hostname;
  return host === SITE_HOST || host.endsWith(`.${SITE_HOST}`);
}

/**
 * Log one event. Fire and forget, always.
 *
 * - **Never awaited in the user's path**, and errors are swallowed. A failed
 *   log must never delay or break a `tel:` handoff.
 * - **`sendBeacon` is unnecessary**: `tel:` hands off to the dialer without
 *   unloading the page, and external links open in a new tab.
 * - **Gated on `event.isTrusted`**, which is `false` for a scripted
 *   `element.click()` — a free filter against naive automation. Callers that
 *   have no originating event (a mount effect) pass `true` explicitly, since
 *   there is no gesture to distrust.
 */
export function logEvent(
  entityId: string,
  eventType: EventType,
  isTrusted = true,
): void {
  if (!isTrusted) return;
  if (!shouldLog()) return;

  void supabase
    .rpc('log_event', { p_entity_id: entityId, p_event_type: eventType })
    .then(
      () => undefined,
      () => undefined, // swallowed: the contact is the point, the metric is not
    );
}
