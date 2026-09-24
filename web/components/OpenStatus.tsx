'use client';

import { useMounted } from './useMounted';
import { openState, openStateLabel } from '@/lib/hours';
import type { Entity } from '@/lib/database.types';

/**
 * "Otvoreno" / "Zatvoreno" / "Po dogovoru" / "Dostupni 0–24", on the detail
 * page.
 *
 * **Rendered in the browser so the detail page can be cached.** The label is a
 * pure function of the current time, so a server render freezes it: a page
 * built at 14:00 and served from a cache would still claim *otvoreno* at
 * midnight. Computing it after mount makes it true for the reader's own
 * moment, which is stricter than what it replaces, not looser.
 *
 * **It renders nothing before mount, and nothing when the state is unknown.**
 * Those are the same output on purpose. `openState` returns `null` when we
 * hold no hours for today, and `SPEC_frontend.md` requires that to say nothing
 * at all rather than "zatvoreno" — wrongly telling a family a provider is shut
 * is the worst failure this page can produce. An un-hydrated render is exactly
 * that case: we have no information *yet*, so we make no claim.
 *
 * The class comes from the page rather than a module of its own: this is the
 * detail page's status line, styled by `detail.module.css`, and moving where
 * it is computed should not move where it is styled.
 */
export function OpenStatus({
  provider,
  className,
}: {
  provider: Pick<Entity, 'available_24_7' | 'working_hours'>;
  className?: string;
}) {
  const mounted = useMounted();
  if (!mounted) return null;

  const label = openStateLabel(openState(provider));
  if (!label) return null;

  return <p className={className}>{label}</p>;
}
