import type { FlowAnswers } from './answers';
import { NACIN_LABEL, POKOJNIK_LABEL, SITUACIJA_LABEL } from './copy';
import { CANONICAL_SERVICE_ORDER, canonicalIndex } from './services';

/**
 * `/lista-pogrebnih-usluga` — what the sheet a family carries actually says.
 *
 * SPEC_frontend.md → The list a family carries is the source of truth; this
 * file implements it and nothing more. Everything here is a **pure function**
 * over the flow's answers and the service list — no database access, no dates,
 * no `window` — which is what makes the sheet's rules testable without
 * rendering it, and what keeps the component to markup.
 *
 * The URL half lives in `lib/answers.ts`, which owns every URL this product
 * builds.
 */

/** Enough of a `services` row for the sheet. Keeps this file free of queries. */
export type SheetService = { slug: string; name: string };

/**
 * Services held behind *prikaži sve*.
 *
 * Real services, and a family that needs one needs it badly — but on a phone
 * each costs a line of scroll to the great majority who do not. The disclosure
 * is the compromise; dropping them would not be.
 */
export const RARE_SERVICES: readonly string[] = [
  'ekshumacija',
  'balzamiranje',
  'fotografiranje-pogreba',
];

/**
 * Ticked before the family touches anything.
 *
 * **Only what their answers already said, plus the two that are true of every
 * funeral.** A default tick on a genuine choice — flowers, music, an osmrtnica
 * — would be us answering for them, on a sheet whose whole purpose is that
 * they answered.
 *
 * Returned in canonical order, so the ticks and the rendered list agree and
 * the URL is stable.
 */
export function defaultTicks(answers: FlowAnswers): string[] {
  const ticks = new Set<string>(['organizacija-pogreba', 'sredivanje-dokumentacije']);

  if (answers.nacin === 'kremiranje') {
    ticks.add('kremiranje');
    ticks.add('urne');
  }
  if (answers.nacin === 'ukop') ticks.add('lijesovi');

  // Anywhere but home still needs collection; abroad is a different service
  // and a different price, and is the one case the list must not blur.
  if (answers.pokojnik === 'inozemstvo') ticks.add('prijevoz-pokojnika-inozemstvo');
  else if (answers.pokojnik) ticks.add('prijevoz-pokojnika');

  return CANONICAL_SERVICE_ORDER.filter((slug) => ticks.has(slug));
}

/**
 * The ticks the sheet renders.
 *
 * `parsed` is what `parseTrebam` returned: `undefined` when `?trebam=` was
 * absent, an array when it was present. The distinction is the contract —
 * absent derives, present is obeyed, including when it is empty.
 */
export function resolveTicks(
  answers: FlowAnswers,
  parsed: readonly string[] | undefined,
): string[] {
  if (parsed === undefined) return defaultTicks(answers);
  return CANONICAL_SERVICE_ORDER.filter((slug) => parsed.includes(slug));
}

/**
 * Which services the sheet offers, split by disclosure.
 *
 * **`ugovaranje-unaprijed` is suppressed unless the reader is planning ahead.**
 * `lib/services.ts` already argues for trailing it; here the stakes are higher
 * than ordering. Handing a family whose father died last night a checkbox for
 * booking their own funeral is not a misordered list.
 *
 * Input order is ignored — both lists come back in canonical order, which is
 * the order a family encounters the decisions.
 */
export function sheetServices(
  answers: FlowAnswers,
  all: readonly SheetService[],
): { common: SheetService[]; rare: SheetService[] } {
  const offered = all
    .filter((s) => CANONICAL_SERVICE_ORDER.includes(s.slug))
    .filter((s) => s.slug !== 'ugovaranje-unaprijed' || answers.situacija === 'planiranje')
    .slice()
    .sort((a, b) => canonicalIndex(a.slug) - canonicalIndex(b.slug));

  return {
    common: offered.filter((s) => !RARE_SERVICES.includes(s.slug)),
    rare: offered.filter((s) => RARE_SERVICES.includes(s.slug)),
  };
}

/**
 * The situation, read back as sentences rather than as labels.
 *
 * A funeral director reads prose; `Preminuo · Kremiranje · Bolnica` is a
 * debug line. Lowercasing the second clause is safe here and only here — these
 * labels are prepositional phrases, not the proper nouns `CATCHMENT` exists to
 * protect.
 *
 * Returns `[]` when nothing was answered, and the caller omits the block
 * rather than printing an empty one.
 */
export function situationLines(answers: FlowAnswers): string[] {
  const lines: string[] = [];
  const { situacija, pokojnik, nacin } = answers;

  // Where the deceased is has no meaning for someone planning ahead, so the
  // two never combine into one sentence for that path.
  const place = situacija !== 'planiranje' && pokojnik ? POKOJNIK_LABEL[pokojnik] : null;

  if (situacija && place) {
    lines.push(`${SITUACIJA_LABEL[situacija]}, trenutno ${place.toLowerCase()}.`);
  } else if (situacija) {
    lines.push(`${SITUACIJA_LABEL[situacija]}.`);
  } else if (place) {
    lines.push(`Pokojnik je trenutno ${place.toLowerCase()}.`);
  }

  if (nacin) lines.push(`Želimo ${NACIN_LABEL[nacin].toLowerCase()}.`);

  return lines;
}

/**
 * The sheet as plain text, for pasting into WhatsApp or Viber.
 *
 * That is how this will actually travel, so it is a first-class rendering
 * rather than a fallback — and it carries the same three things the printed
 * sheet does: what the family needs, where the sheet came from, and a link
 * back to it.
 */
export function briefText(opts: {
  title: string;
  areaLabel: string;
  date: string;
  lines: readonly string[];
  ticked: readonly SheetService[];
  tagline: string;
  url: string;
}): string {
  const parts: string[] = [
    opts.title.toUpperCase(),
    `${opts.areaLabel} · ${opts.date}`,
  ];

  if (opts.lines.length > 0) parts.push('', ...opts.lines);

  parts.push('', 'TREBAMO');
  parts.push(
    opts.ticked.length > 0
      ? opts.ticked.map((s) => `– ${s.name}`).join('\n')
      : '(još nije odabrano)',
  );

  parts.push('', opts.tagline, opts.url);
  return parts.join('\n');
}
