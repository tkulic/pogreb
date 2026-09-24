import type { Nacin } from './listing';

/**
 * What a funeral costs — the figures the estimate is built from.
 *
 * Numbers and provenance only. The estimate is computed in one pure function
 * and rounded for display in another, so the figures, the arithmetic and the
 * presentation can each be checked alone.
 *
 * ## Four rules
 *
 * 1. **Gross only.** Every figure is VAT-inclusive, exactly as its source
 *    publishes it. Croatia charges *two* rates inside one funeral bill — 13% on
 *    coffins and urns, 25% on services — and Zagreb's own price list prints a
 *    `PDV 25%` column header above coffin rows whose arithmetic is plainly 13%.
 *    Computing VAT here would eventually get that wrong. We never compute it.
 *
 * 2. **Exact to the cent here, rounded only for display.** Nothing in this file
 *    is pre-rounded; `formatEstimate` is the single place rounding happens.
 *
 * 3. **`Tariff` and `Modelled` are different types** so they cannot be
 *    confused. A `Tariff` is a published price. A `Modelled` figure is a range
 *    we assembled, and must always render as a range.
 *
 * 4. **Any assumption baked into a number is carried on the number**, in its
 *    `assumption` field, and shown in the itemisation — never in the headline.
 *    An assumption stored anywhere else is one that gets silently invalidated
 *    the next time someone edits the figure it belongs to.
 *
 * ## Why these particular tariffs
 *
 * The tariffed lines are Lovrinac's (Split). **The page does not say so, and
 * should not** — it is a single national estimate, and naming a city would
 * invite a precision we are not offering. Three reasons this is the right
 * anchor rather than a convenient one:
 *
 * - **It is the only complete published bill in the country.** Lovrinac
 *   publishes both halves — the cemetery's work *and* the funeral service's.
 *   Everywhere else at most one half is public: Zagreb's grave digging is
 *   122,76 € against Split's 262,00 €, which looks cheaper but is not, because
 *   the private pogrebnik's fee there is invisible rather than absent.
 * - **It errs high.** The tariffed core is ~614 € here against ~569 € in Rijeka
 *   and ~304 € in Zagreb. For a cost estimate that is the safe direction: a
 *   family braced for more and billed less is fine, the reverse is not.
 * - **Averaging across cities was tried and rejected.** National ranges from
 *   seven published tariffs give roughly 620–1.550 €, and a span that wide is
 *   not information — it is the appearance of information.
 *
 * The disclaimer beside the result does the work the city label would have
 * done, and the CTA sends the family to a real provider for a real offer.
 *
 * **Re-check every January.** Lovrinac reprices on 1 January — the 2026 list
 * was a flat 5.00% uplift on 2024, to the cent, on every line.
 */

/** Euros, VAT included. Never a net figure — see rule 1. */
export type Eur = number;

/** A published price: exact, attributable, checkable against its source. */
export type Tariff = {
  readonly label: string;
  readonly gross: Eur;
  /** Kept for maintenance, not rendered — see "Why these particular tariffs". */
  readonly source: string;
  /** ISO date the source took effect, not the date we read it. */
  readonly asOf: string;
};

/**
 * A figure assembled rather than read off a tariff. Always renders as a range;
 * collapsing it would claim a precision we do not have.
 */
export type Modelled = {
  readonly label: string;
  readonly from: Eur;
  readonly to: Eur;
  /** Why these two numbers. Kept for maintenance. */
  readonly basis: string;
  /** An assumption the reader must be able to see and disagree with. */
  readonly assumption?: string;
};

/**
 * Several tariff lines the reader meets as one thing.
 *
 * The itemisation shows **groups, not tariff rows**. A dozen lines reading
 * "Opremanje kovčega 12,23 €" is a procurement document, not an explanation —
 * it overwhelms exactly the reader who opened the panel hoping to understand
 * the bill. Grouping also keeps every shown figure comfortably above the
 * rounding step, so nothing is distorted by being rounded.
 */
export type TariffGroup = {
  readonly label: string;
  readonly items: readonly Tariff[];
};

const KOM = 'Lovrinac d.o.o. — Cjenik komunalnih usluga';
const PU = 'Lovrinac d.o.o. — Cjenik pogrebnih usluga';
const KOM_FROM = '2026-01-01';
const PU_FROM = '2025-10-01';
const ZG = 'Gradska groblja Zagreb — Cjenik komunalnih usluga';
const ZG_FROM = '2023-01-01';
const ZG_CAT = 'Gradska groblja Zagreb — Cjenik tržišnih usluga';
const ZG_CAT_FROM = '2026-02-18';

/* ------------------------------------------------------------------ *
 * Unavoidable — happens for any death, whatever the family chooses.
 * ------------------------------------------------------------------ */

/**
 * The handling and ceremony every funeral passes through.
 *
 * The odar and mortuary lines sit here rather than under choices because they
 * are not declinable in practice: local rules generally require a formal
 * farewell through the cemetery's mortuary even when burial is elsewhere.
 */
export const CORE_GROUPS: readonly TariffGroup[] = [
  {
    label: 'Preuzimanje i prijevoz pokojnika',
    items: [
      { label: 'Dolazak pogrebne službe na mjesto smrti', gross: 23.74, source: PU, asOf: PU_FROM },
      { label: 'Odvoz pokojnika na groblje', gross: 29.78, source: PU, asOf: PU_FROM },
    ],
  },
  {
    label: 'Priprema pokojnika i dokumentacija',
    items: [
      { label: 'Korištenje rashladne prostorije', gross: 16.38, source: KOM, asOf: KOM_FROM },
      { label: 'Pripremanje i oblačenje pokojnika', gross: 17.59, source: PU, asOf: PU_FROM },
      { label: 'Opremanje kovčega', gross: 12.23, source: PU, asOf: PU_FROM },
      { label: 'Administrativne usluge', gross: 16.38, source: KOM, asOf: KOM_FROM },
    ],
  },
  {
    label: 'Ispraćaj i sprovod',
    items: [
      { label: 'Korištenje i dekoracija odra', gross: 39.30, source: KOM, asOf: KOM_FROM },
      { label: 'Nosači pokojnika', gross: 74.03, source: KOM, asOf: KOM_FROM },
      { label: 'Ispraćaj i sprovod', gross: 98.25, source: KOM, asOf: KOM_FROM },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Burial — which group applies depends on what the family already has.
 * ------------------------------------------------------------------ */

/**
 * Opening a plain earth grave.
 *
 * This costs **more** than opening an existing tomb (285,88 € against
 * 220,48 €), the opposite of what almost everyone assumes. A tomb is expensive
 * to buy and cheap to open.
 */
export const GRAVE_EARTH: TariffGroup = {
  label: 'Otvaranje groba',
  items: [
    { label: 'Iskop groba', gross: 262.0, source: KOM, asOf: KOM_FROM },
    { label: 'Formiranje grobne humke', gross: 16.38, source: KOM, asOf: KOM_FROM },
    { label: 'Postavljanje nadgrobnog znaka', gross: 7.5, source: KOM, asOf: KOM_FROM },
  ],
};

/** Opening a built tomb the family already holds. */
export const GRAVE_TOMB: TariffGroup = {
  label: 'Otvaranje grobnice',
  items: [
    { label: 'Otvaranje i zatvaranje grobnice', gross: 52.4, source: KOM, asOf: KOM_FROM },
    { label: 'Zidanje police', gross: 98.25, source: KOM, asOf: KOM_FROM },
    { label: 'Dizanje nadgrobne ploče', gross: 69.83, source: PU, asOf: PU_FROM },
  ],
};

/* ------------------------------------------------------------------ *
 * Cremation.
 * ------------------------------------------------------------------ */

/**
 * The cremation fees, plus placing the urn afterwards.
 *
 * The cremation lines are Zagreb's, unavoidably: most Croatian cities have no
 * crematorium, so there is no local price to use. The pre-cremation medical
 * check is not optional.
 */
export const CREMATION_GROUP: TariffGroup = {
  label: 'Kremiranje i polaganje urne',
  items: [
    { label: 'Kremiranje', gross: 146.0, source: ZG, asOf: ZG_FROM },
    { label: 'Kontrolni pregled prije kremacije', gross: 21.43, source: ZG, asOf: ZG_FROM },
    { label: 'Polaganje urne', gross: 26.2, source: KOM, asOf: KOM_FROM },
  ],
};

/**
 * Croatia's crematoria, for the note beside the question.
 *
 * There are very few, and which city you are in decides what cremation costs —
 * so the reader has to be told plainly rather than left to guess whether the
 * question applies to them.
 *
 * **Stored in the locative**, because the only sentence they appear in is
 * *"…postoji samo u Zagrebu i Osijeku."* Holding the nominative and appending a
 * suffix is the exact trap `CATCHMENT` in `lib/copy.ts` documents: it yields
 * *"u Zagreb"*, which is not broken code but is visibly broken Croatian.
 */
export const CREMATORIUM_CITIES_LOCATIVE: readonly string[] = ['Zagrebu', 'Osijeku'];

/**
 * Getting the deceased to a crematorium when there is not one locally.
 *
 * This, not the cremation fee, is what makes cremation expensive nearly
 * everywhere in Croatia — and it is why "kremiranje je deset puta jeftinije",
 * repeated across Croatian media, holds only where a crematorium is close.
 *
 * The range spans the two anchors we can evidence: a published Zagreb run from
 * Istria at 562,50 €, and roughly 1.066 € from Split on that cemetery's own
 * 1,30 €/km over the ~820 km round trip — which independently matches the
 * ≈1.100 € reporting put on an arranged Lovrinac cremation in 2024.
 */
export const CREMATION_TRANSPORT: Modelled = {
  label: 'Prijevoz do krematorija',
  from: 300,
  to: 1100,
  basis: 'Objavljene cijene prijevoza i obračun po prijeđenom kilometru',
  assumption: 'Ovisi o udaljenosti. Niži iznos vrijedi za gradove bliže krematoriju.',
};

/* ------------------------------------------------------------------ *
 * Choices with a price.
 * ------------------------------------------------------------------ */

export type CoffinTier = 'osnovni' | 'standardni' | 'sarkofag';

/**
 * Coffins, from the Zagreb catalogue — the largest published in Croatia, and
 * the only source giving a real floor and ceiling rather than a guess. The
 * bands are cross-checked against Poreč (standard oak 425,11 €) and Zadar
 * reporting (250–400 €, American sarcophagus 973 €).
 */
export const COFFIN: Record<CoffinTier, Modelled> = {
  osnovni: {
    label: 'Osnovni lijes',
    from: 210,
    to: 300,
    basis: 'Jednostavan drveni lijes bez ukrasa',
  },
  standardni: {
    label: 'Standardni lijes',
    from: 290,
    to: 500,
    basis: 'Rezbareni lijes ili polusarkofag, najčešći izbor',
  },
  sarkofag: {
    label: 'Sarkofag',
    from: 700,
    to: 1500,
    basis: 'Masivni sarkofag; vrhunski uvozni modeli idu i znatno iznad ovog raspona',
  },
};

/** Urn, when the family chooses cremation. */
export const URN: Modelled = {
  label: 'Urna',
  from: 10,
  to: 135,
  basis: 'Od jednostavne do ukrasne — razlika je isključivo u izgledu',
};

/* ------------------------------------------------------------------ *
 * Optional — two of them ticked by default, and that is deliberate.
 * ------------------------------------------------------------------ */

export type ExtraKey = 'vijenac' | 'osmrtnica' | 'glazba' | 'karmine';

/**
 * `vijenac` and `osmrtnica` default to **on**.
 *
 * They are optional in principle and near-universal in practice, and an item
 * like that, defaulted off, produces a headline that is systematically too low
 * — roughly 110–190 € too low here, on a bill of about a thousand. That is the
 * one failure this calculator cannot afford, so the defaults follow what
 * families actually pay rather than what is strictly required. They remain
 * untickable, and that they *can* be declined is itself one of the page's
 * points.
 */
export const EXTRAS: Record<ExtraKey, Modelled> = {
  vijenac: {
    label: 'Vijenac',
    from: 80,
    to: 130,
    basis: 'Raspon za kvalitetan vijenac',
  },
  osmrtnica: {
    label: 'Osmrtnica',
    from: 30,
    to: 60,
    basis: 'Objava u novinama i tiskane obavijesti',
    assumption: 'Jedna objava u dnevnim novinama. Veliki oglasi stoje znatno više.',
  },
  glazba: {
    label: 'Glazba',
    from: 65,
    to: 350,
    basis: 'Od solo trube do limene glazbe, zbora ili klape',
  },
  karmine: {
    label: 'Karmine',
    from: 500,
    to: 875,
    basis: 'Od 20 do 35 € po osobi',
    assumption: 'Računato za 25 uzvanika.',
  },
};

/** Ticked when the calculator first renders. See the note on `EXTRAS`. */
export const DEFAULT_EXTRAS: readonly ExtraKey[] = ['vijenac', 'osmrtnica'];

/* ------------------------------------------------------------------ *
 * Later, and recurring — the block that never collapses.
 * ------------------------------------------------------------------ */

/**
 * Costs that arrive after the funeral, and the one that never stops.
 *
 * `annual` is the most under-communicated cost in the whole subject: nobody is
 * told about it at the time, it recurs forever, and a grave whose fee goes
 * unpaid long enough can be reallocated — *tending and visiting it preserves
 * nothing, only paying does*.
 *
 * It is also why the rounding step is 10 € and not 50 €: at 50 € this range
 * renders as "0–100 €", wrong at the bottom, since no grave costs nothing per
 * year.
 */
export const DEFERRED = {
  spomenik: {
    label: 'Nadgrobni spomenik',
    from: 800,
    to: 2500,
    basis: 'Tržišne cijene klesarskih radova',
  } satisfies Modelled,
  annual: {
    label: 'Godišnja grobna naknada',
    from: 10,
    to: 80,
    basis: 'Ovisi o veličini grobnog mjesta i groblju',
  } satisfies Modelled,
} as const;

/** Catalogue provenance, kept for maintenance. Not rendered. */
export const CATALOGUE_SOURCE = { source: ZG_CAT, asOf: ZG_CAT_FROM } as const;

/* ================================================================== *
 * The estimate.
 * ================================================================== */

/** Whether a crematorium is local. The single geographic question we ask. */
export type Krematorij = 'blizu' | 'daleko';

/** What the reader answered. */
export type CostAnswers = {
  readonly nacin: Nacin;
  readonly lijes: CoffinTier;
  readonly extras: readonly ExtraKey[];
  /** Only read when `nacin` is `kremiranje`. */
  readonly krematorij?: Krematorij;
};

/** One row of the expandable itemisation — a group, not a tariff row. */
export type EstimateLine = {
  readonly label: string;
  readonly from: Eur;
  readonly to: Eur;
  readonly block: 'core' | 'choice';
  readonly assumption?: string;
};

export type Estimate = {
  readonly lines: readonly EstimateLine[];
  /** Later and recurring. Never collapsed in the UI. */
  readonly deferred: readonly Modelled[];
};

const groupLine = (g: TariffGroup, block: 'core' | 'choice'): EstimateLine => {
  const total = groupTotal(g);
  return { label: g.label, from: total, to: total, block };
};

const groupTotal = (g: TariffGroup): Eur => g.items.reduce((n, t) => n + t.gross, 0);

/**
 * Opening the grave, without asking what kind it is.
 *
 * The range spans both kinds — opening an earth grave is 285,88 €, opening a
 * built tomb 220,48 €. We do not ask which, and must not pretend to know.
 *
 * **Buying the plot is not in here at all**, for any reader. It is not sold
 * from a price list: it is allocated by order of registration, the wait runs to
 * years in the larger cities, and the figure ranges from a few hundred euros to
 * several thousand. Guessing at it would be the least defensible number on the
 * page, so the page says plainly that it is excluded instead.
 */
const graveLine = (): EstimateLine => ({
  label: 'Otvaranje grobnog mjesta',
  from: Math.min(groupTotal(GRAVE_TOMB), groupTotal(GRAVE_EARTH)),
  to: Math.max(groupTotal(GRAVE_TOMB), groupTotal(GRAVE_EARTH)),
  block: 'core',
});

const rangeLine = (m: Modelled, block: 'core' | 'choice'): EstimateLine => ({
  label: m.label,
  from: m.from,
  to: m.to,
  block,
  ...(m.assumption ? { assumption: m.assumption } : {}),
});

/**
 * Turn the answers into an estimate.
 *
 * Pure: no dates, no randomness, no I/O. It returns **only lines** — the block
 * and headline totals are computed by `formatEstimate` from the rounded lines,
 * so that what the reader can add up is what the page shows. Totalling here as
 * well would create a second set of numbers to disagree with the first.
 *
 * **One modelling assumption worth knowing.** For cremation the farewell is
 * priced exactly as for a burial. An urn farewell is in reality somewhat
 * cheaper than a full burial procession, but no tariff we hold prices the two
 * separately, so this errs high like everything else here.
 */
export function estimate(a: CostAnswers): Estimate {
  const lines: EstimateLine[] = CORE_GROUPS.map((g) => groupLine(g, 'core'));

  if (a.nacin === 'ukop') {
    lines.push(graveLine());
  } else {
    lines.push(groupLine(CREMATION_GROUP, 'core'));
    if (a.krematorij === 'daleko') lines.push(rangeLine(CREMATION_TRANSPORT, 'core'));
  }

  lines.push(rangeLine(COFFIN[a.lijes], 'choice'));
  if (a.nacin === 'kremiranje') lines.push(rangeLine(URN, 'choice'));

  // Iterate the constant rather than the answer, so the itemisation always
  // reads in a stable order however the checkboxes were clicked.
  for (const key of Object.keys(EXTRAS) as ExtraKey[]) {
    if (a.extras.includes(key)) lines.push(rangeLine(EXTRAS[key], 'choice'));
  }

  return {
    lines,
    deferred: [DEFERRED.spomenik, DEFERRED.annual],
  };
}

/* ================================================================== *
 * Presentation — rounding, and nothing else.
 * ================================================================== */

/**
 * The rounding step, in euros.
 *
 * **10, not 50.** 50 reads more like a ballpark, but it forces a carve-out: the
 * recurring annual grave fee is 10–80 €, which at 50 € renders as "0–100 €" —
 * wrong at the bottom, since no grave costs nothing per year. At 10 € that
 * range survives untouched and the rule needs no exception. 10 € also keeps a
 * grouped line honest: 211,58 € shows as 210 € rather than 200 €.
 */
export const ROUNDING_STEP = 10;

export function roundToStep(value: Eur, step: number = ROUNDING_STEP): number {
  return Math.round(value / step) * step;
}

export type DisplayBlock = { readonly from: number; readonly to: number };

export type DisplayLine = {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly block: 'core' | 'choice';
  readonly assumption?: string;
};

export type DisplayEstimate = {
  /** What the reader sees first. Always the sum of the two blocks. */
  readonly headline: DisplayBlock;
  readonly core: DisplayBlock;
  readonly choices: DisplayBlock;
  /** Rounded to the same step as the blocks, so the itemisation adds up. */
  readonly lines: readonly DisplayLine[];
};

function sumLines(lines: readonly DisplayLine[], block: 'core' | 'choice'): DisplayBlock {
  return lines
    .filter((l) => l.block === block)
    .reduce((acc, l) => ({ from: acc.from + l.from, to: acc.to + l.to }), { from: 0, to: 0 });
}

/**
 * Round an estimate for display.
 *
 * **Everything the reader can see is rounded to the same step, and every total
 * is the sum of the rounded parts beneath it.** Lines round first; each block
 * is the sum of its lines; the headline is the sum of the blocks. That is what
 * makes the expandable itemisation reconcile against the summary above it.
 *
 * Rounding each level independently is the trap this avoids. A headline rounded
 * on its own can disagree with the blocks printed under it by a full step, and
 * exact itemisation rows under a rounded total read as an arithmetic error even
 * when both are correct.
 */
export function formatEstimate(e: Estimate): DisplayEstimate {
  const lines: DisplayLine[] = e.lines.map((l) => {
    const from = roundToStep(l.from);
    let to = roundToStep(l.to);
    // Never let a real range collapse into a single number.
    if (to === from && l.to > l.from) to = from + ROUNDING_STEP;
    return { ...l, from, to };
  });

  const core = sumLines(lines, 'core');
  const choices = sumLines(lines, 'choice');

  return {
    lines,
    core,
    choices,
    headline: { from: core.from + choices.from, to: core.to + choices.to },
  };
}

/** Croatian money. `1.010 €` by default, `262,00 €` with `decimals: 2`. */
export function formatEur(value: Eur, opts: { decimals?: 0 | 2 } = {}): string {
  const decimals = opts.decimals ?? 0;
  return new Intl.NumberFormat('hr-HR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** `930 – 1.100 €`. One currency mark, not two. */
export function formatRange(from: Eur, to: Eur, opts: { decimals?: 0 | 2 } = {}): string {
  const decimals = opts.decimals ?? 0;
  const nf = new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return from === to ? formatEur(from, opts) : `${nf.format(from)} – ${formatEur(to, opts)}`;
}
