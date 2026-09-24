import { supabase } from './supabase';
import { SITE_HOST } from './env';
import type { CityEventType, EventType } from './database.types';

/**
 * Anonymous usage logging.
 *
 * `events` is written exclusively by the `log_event` Postgres function — a
 * `security definer` RPC. The client asserts *which provider*, *which event*
 * and, since 2026-09-24, *the entry referrer*; `occurred_at`, `device` and the
 * `source` bucket itself are decided server-side, and `anon` holds no table
 * privileges at all (SPEC_database.md → Usage logging).
 *
 * Every rule in this file closes a pollution source that **no amount of
 * server-side filtering can recover from**. They are requirements, not
 * preferences.
 */

/**
 * Where this visitor entered the site from.
 *
 * **The server cannot work this out for itself, which is why it is passed.**
 * `log_event` used to read the `referer` header of its own RPC call — but that
 * call is made by JavaScript on a pogreb.net page, so the header is always
 * `https://pogreb.net/` and every row ever written said `internal`, including
 * visits that came from Google.
 *
 * `document.referrer` is the referrer of the *document*, so it answers "how did
 * this session reach the site". It deliberately does not change across Next's
 * client-side navigations, which is the behaviour we want: a family that lands
 * from Google and then browses to a provider is still a Google arrival.
 *
 * **Only the origin is sent, never the full URL.** The server buckets it to a
 * 4-byte enum and stores nothing else, but there is no reason to put a path on
 * the wire in the first place.
 *
 * The empty string is meaningful and is passed through as-is: it is the
 * browser saying *there is no referrer* — typed, bookmarked, or stripped by a
 * privacy setting — which the server buckets as `direct`. Returning null
 * instead would be read as "an old client that said nothing".
 */
function entryReferrer(): string {
  if (typeof document === 'undefined') return '';
  const ref = document.referrer;
  if (!ref) return '';
  try {
    return new URL(ref).origin;
  } catch {
    // Unparseable: hand it over and let the server bucket it `unknown` rather
    // than silently claiming it was direct.
    return ref;
  }
}

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
    .rpc('log_event', {
      p_entity_id: entityId,
      p_event_type: eventType,
      p_referrer: entryReferrer(),
    })
    .then(
      () => undefined,
      () => undefined, // swallowed: the contact is the point, the metric is not
    );
}

/**
 * Log one city-level event. Fire and forget, on the same terms as `logEvent`.
 *
 * Written to `city_events` via `log_city_event`, a separate table and a
 * separate function because `events.entity_id` is not null and three
 * mechanisms depend on it (SPEC_database.md -> City-level logging). The
 * environment guard is shared rather than reimplemented: there is exactly one
 * answer to "is this real traffic", and two copies of it would drift.
 */
export function logCityEvent(
  cityId: string,
  eventType: CityEventType,
  isTrusted = true,
): void {
  if (!isTrusted) return;
  if (!shouldLog()) return;

  void supabase
    .rpc('log_city_event', {
      p_city_id: cityId,
      p_event_type: eventType,
      p_referrer: entryReferrer(),
    })
    .then(
      () => undefined,
      () => undefined, // swallowed: the share is the point, the metric is not
    );
}
