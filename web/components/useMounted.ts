'use client';

import { useSyncExternalStore } from 'react';

/**
 * Has this component hydrated in the browser yet?
 *
 * **This is the hinge that lets a time-dependent page be cached.** Everything
 * in `lib/hours.ts` — the open/closed badge, the dežurni-phone rule — is a
 * pure function of the current time. Computing it during the server render
 * bakes one instant into the HTML, which is correct only for a page rendered
 * per request. That is what `force-dynamic` bought, and what it cost: every
 * crawl and every visit re-rendered on the origin and hit the database, so
 * Googlebot measured the site as slow under concurrency and rescheduled the
 * crawl (`.seo/ANALYSIS_2026-09-24.md` → ROOT CAUSE).
 *
 * Deferring the time-dependent part to the client inverts that. The page
 * becomes a cacheable artefact, and the answer gets *more* accurate rather than
 * less: a cached render is right for the moment it was built, while a client
 * computation is right for the moment the reader is looking.
 *
 * **Before hydration it must return the time-independent fallback**, never a
 * guess. Server HTML and first client render have to agree or React discards
 * the tree, so each caller pairs this with the value `lib/hours.ts` already
 * produces when it has no information — the stored primary phone, and no
 * open/closed claim.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: it is the hook
 * built for "the server and the client disagree about this value", it gets the
 * two snapshots from React directly instead of triggering a second render pass,
 * and it does not trip `react-hooks/set-state-in-effect`.
 */

/** Never fires: whether we have hydrated changes exactly once, and React drives that. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
