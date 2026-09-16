'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

/**
 * A `<details>` in the masthead that closes itself once the reader has gone
 * somewhere.
 *
 * ## Why this exists
 *
 * The header lives in the root layout, so a client-side navigation never
 * unmounts it. `open` is a DOM property React does not control, so an opened
 * menu stayed open across the navigation that was made from it: the reader
 * clicked *Koliko košta pogreb*, the page changed underneath, and the panel
 * remained over it covering the heading they had just asked for.
 *
 * The mobile menu had carried the same defect since it shipped, so both
 * disclosures in the masthead now use this.
 *
 * ## It is an enhancement, not a requirement
 *
 * **The no-JavaScript baseline is unchanged.** This renders a plain `<details>`
 * on the server; without JavaScript it opens and closes on click exactly as
 * before, which is the whole reason the masthead uses a disclosure rather than
 * a scripted menu. What JavaScript adds is only the closing, and a menu that
 * stays open is the behaviour the reader already had.
 *
 * ## Two triggers, because one does not cover both cases
 *
 * - **The route changed.** Closes on `usePathname`, which catches the back and
 *   forward buttons as well as a link. It deliberately does not watch the query
 *   string: that would pull `useSearchParams` and its Suspense boundary into
 *   the root layout, and no menu link differs from another by query alone.
 * - **A link in the panel was clicked.** Needed because choosing the page you
 *   are already on changes no pathname, so the effect never runs and the panel
 *   would hang open over the page it just pointed at — the one case where the
 *   reader gets no feedback at all that the click registered.
 *
 * The handler closes only for a click that lands on a link. The `<summary>` is
 * not one, so toggling the menu open still works.
 */
export function NavDisclosure({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Assigning the property rather than re-rendering: React does not own
    // `open`, and making it a controlled attribute would mean re-implementing
    // the toggle that <details> already gives us for free.
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  function closeIfLink(event: MouseEvent<HTMLDetailsElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a') && ref.current) ref.current.open = false;
  }

  return (
    <details ref={ref} className={className} onClick={closeIfLink}>
      {children}
    </details>
  );
}
