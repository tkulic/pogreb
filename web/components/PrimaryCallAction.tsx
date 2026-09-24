'use client';

import { ActionLink } from './ActionLink';
import { PhoneIcon } from './PhoneIcon';
import { useMounted } from './useMounted';
import { selectDisplayPhone } from '@/lib/hours';
import type { Entity } from '@/lib/database.types';

type PhoneFields = Pick<Entity, 'available_24_7' | 'working_hours' | 'phones'>;

/**
 * Which number the detail page's call button dials, decided in the browser.
 *
 * Same reasoning as `ContactActions`: the rule promotes the dežurni line only
 * when the office is shut *now*, so deciding it during the server render is
 * what forced this page to be `force-dynamic` and left the site uncacheable
 * (`.seo/ANALYSIS_2026-09-24.md` → ROOT CAUSE). Running it after mount makes
 * the page a cacheable artefact and the answer correct for the reader's own
 * moment rather than for whenever the HTML was produced.
 *
 * **Before mount it returns the stored primary number** — which is what
 * `selectDisplayPhone` itself returns whenever it has no grounds to promote
 * the emergency line. So the pre-hydration markup is the rule's own fallback,
 * not a placeholder: the button dials correctly with no JavaScript at all, it
 * simply does not get the after-hours upgrade.
 *
 * **Whether a phone block exists at all is *not* time-dependent** — the rule
 * returns null only when a provider holds no numbers. That test stays on the
 * server, so the page's layout is decided at build time and only the `href`
 * and the note below it move.
 */
function useSelectedPhone(provider: PhoneFields) {
  const mounted = useMounted();
  const phones = provider.phones ?? [];
  return mounted
    ? selectDisplayPhone(provider)
    : phones.length > 0
      ? { phone: phones[0], isAfterHours: false }
      : null;
}

/**
 * The "Nazovite" button. Lives inside the actions row.
 *
 * **Unlike the shortlist card, nothing is hidden here.** Every number is listed
 * in full under `Kontakt` further down, so there is nothing to reveal and no
 * `phone_click` to protect by hiding — `PhoneList` documents that trade-off.
 */
export function PrimaryCallAction({
  provider,
  className,
}: {
  provider: PhoneFields;
  className?: string;
}) {
  const selected = useSelectedPhone(provider);
  if (!selected) return null;

  return (
    <ActionLink variant="primary" className={className} href={`tel:${selected.phone.number}`}>
      <PhoneIcon />
      Nazovite
    </ActionLink>
  );
}

/**
 * "dežurni telefon", under the actions row rather than inside it.
 *
 * A separate export precisely so the markup keeps its shape: the note is a
 * sibling of the actions `<div>`, and folding it into the button component
 * would quietly move it inside and restyle the row.
 *
 * Renders nothing before mount, which is correct rather than incidental — an
 * un-hydrated page has no grounds to claim the office is shut.
 */
export function AfterHoursNote({
  provider,
  className,
}: {
  provider: PhoneFields;
  className?: string;
}) {
  const selected = useSelectedPhone(provider);
  if (!selected?.isAfterHours) return null;

  return <span className={className}>dežurni telefon</span>;
}
