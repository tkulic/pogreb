import { describe, expect, it } from 'vitest';
import { briefHref, parseTrebam } from './answers';
import {
  RARE_SERVICES,
  defaultTicks,
  resolveTicks,
  sheetServices,
  situationLines,
  type SheetService,
} from './brief';
import { CANONICAL_SERVICE_ORDER } from './services';

/**
 * `/lista-pogrebnih-usluga` — the sheet a family carries.
 *
 * The rules worth a test are the ones that are silent when they break: a
 * default tick that answers a choice for the family, `?trebam=` losing the
 * difference between "untouched" and "emptied", and
 * `ugovaranje-unaprijed` surfacing for someone whose relative has just died.
 */

/** Stands in for the `services` rows; only slug and name are read. */
const ALL: SheetService[] = CANONICAL_SERVICE_ORDER.map((slug) => ({
  slug,
  name: slug,
}));

describe('parseTrebam', () => {
  it('distinguishes absent from empty — the sheet s whole contract', () => {
    expect(parseTrebam(undefined, CANONICAL_SERVICE_ORDER)).toBeUndefined();
    expect(parseTrebam('', CANONICAL_SERVICE_ORDER)).toEqual([]);
  });

  it('drops unknown slugs rather than erroring', () => {
    expect(parseTrebam('urne,nepostojeca-usluga', CANONICAL_SERVICE_ORDER)).toEqual([
      'urne',
    ]);
  });

  it('de-duplicates, so a hand-edited URL cannot double a row', () => {
    expect(parseTrebam('urne,urne', CANONICAL_SERVICE_ORDER)).toEqual(['urne']);
  });

  it('takes the first value when the param repeats', () => {
    expect(parseTrebam(['urne', 'lijesovi'], CANONICAL_SERVICE_ORDER)).toEqual(['urne']);
  });
});

describe('defaultTicks', () => {
  it('ticks only the two universals when nothing was answered', () => {
    expect(defaultTicks({})).toEqual(['organizacija-pogreba', 'sredivanje-dokumentacije']);
  });

  it('ticks what cremation implies', () => {
    const ticks = defaultTicks({ nacin: 'kremiranje' });
    expect(ticks).toContain('kremiranje');
    expect(ticks).toContain('urne');
    expect(ticks).not.toContain('lijesovi');
  });

  it('ticks a coffin for a burial', () => {
    const ticks = defaultTicks({ nacin: 'ukop' });
    expect(ticks).toContain('lijesovi');
    expect(ticks).not.toContain('urne');
  });

  it('never blurs domestic transport into repatriation', () => {
    expect(defaultTicks({ pokojnik: 'bolnica' })).toContain('prijevoz-pokojnika');
    const abroad = defaultTicks({ pokojnik: 'inozemstvo' });
    expect(abroad).toContain('prijevoz-pokojnika-inozemstvo');
    expect(abroad).not.toContain('prijevoz-pokojnika');
  });

  it('answers no genuine choice for the family', () => {
    // The sheet exists because *they* decided. A default tick on any of these
    // would be us deciding, and it would print as their words.
    const ticks = defaultTicks({
      situacija: 'preminuo',
      nacin: 'kremiranje',
      pokojnik: 'bolnica',
    });
    for (const slug of [
      'cvjetni-aranzmani',
      'osmrtnice',
      'glazba-na-pogrebu',
      'nadgrobni-spomenici',
      'uredenje-groba',
      'posredovanje-grobnog-mjesta',
      'uredivanje-pokojnika',
    ]) {
      expect(ticks).not.toContain(slug);
    }
  });

  it('returns canonical order, so the URL is stable', () => {
    const ticks = defaultTicks({ nacin: 'kremiranje', pokojnik: 'bolnica' });
    const indices = ticks.map((s) => CANONICAL_SERVICE_ORDER.indexOf(s));
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });
});

describe('resolveTicks', () => {
  const answers = { nacin: 'kremiranje' } as const;

  it('derives when the param is absent', () => {
    expect(resolveTicks(answers, undefined)).toEqual(defaultTicks(answers));
  });

  it('honours an empty param rather than springing the defaults back', () => {
    // The regression this guards: unticking the last box re-renders the page
    // with every default ticked again, and the family cannot empty the sheet.
    expect(resolveTicks(answers, [])).toEqual([]);
  });

  it('obeys the param over the answers', () => {
    expect(resolveTicks(answers, ['osmrtnice'])).toEqual(['osmrtnice']);
  });

  it('re-sorts into canonical order whatever order the URL held', () => {
    expect(resolveTicks({}, ['urne', 'organizacija-pogreba'])).toEqual([
      'organizacija-pogreba',
      'urne',
    ]);
  });
});

describe('sheetServices', () => {
  it('hides pre-arrangement from a family whose relative has died', () => {
    for (const situacija of ['preminuo', 'posljednji-dani'] as const) {
      const { common, rare } = sheetServices({ situacija }, ALL);
      const slugs = [...common, ...rare].map((s) => s.slug);
      expect(slugs).not.toContain('ugovaranje-unaprijed');
    }
  });

  it('hides it when nothing was answered, which is the safe default', () => {
    const { common, rare } = sheetServices({}, ALL);
    expect([...common, ...rare].map((s) => s.slug)).not.toContain('ugovaranje-unaprijed');
  });

  it('offers it on the planning path, where it is the point', () => {
    const { common } = sheetServices({ situacija: 'planiranje' }, ALL);
    expect(common.map((s) => s.slug)).toContain('ugovaranje-unaprijed');
  });

  it('puts exactly the rare services behind the disclosure', () => {
    const { common, rare } = sheetServices({}, ALL);
    expect(rare.map((s) => s.slug)).toEqual([...RARE_SERVICES].sort(
      (a, b) => CANONICAL_SERVICE_ORDER.indexOf(a) - CANONICAL_SERVICE_ORDER.indexOf(b),
    ));
    for (const slug of RARE_SERVICES) {
      expect(common.map((s) => s.slug)).not.toContain(slug);
    }
  });

  it('renders in canonical order regardless of the order rows arrive in', () => {
    const shuffled = [...ALL].reverse();
    const { common } = sheetServices({}, shuffled);
    expect(common[0].slug).toBe('organizacija-pogreba');
    const indices = common.map((s) => CANONICAL_SERVICE_ORDER.indexOf(s.slug));
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
  });

  it('ignores a service row that is not in the canonical order', () => {
    // A row added to the database and not to CANONICAL_SERVICE_ORDER would
    // otherwise sort last and render with no considered position.
    const { common, rare } = sheetServices({}, [...ALL, { slug: 'novo', name: 'Novo' }]);
    expect([...common, ...rare].map((s) => s.slug)).not.toContain('novo');
  });
});

describe('situationLines', () => {
  it('reads back as sentences, not as labels', () => {
    expect(
      situationLines({ situacija: 'preminuo', pokojnik: 'bolnica', nacin: 'kremiranje' }),
    ).toEqual(['Osoba je preminula, trenutno u bolnici.', 'Želimo kremiranje.']);
  });

  it('never tells someone planning ahead where the deceased is', () => {
    expect(situationLines({ situacija: 'planiranje', pokojnik: 'bolnica' })).toEqual([
      'Planiram unaprijed.',
    ]);
  });

  it('says nothing when nothing was answered', () => {
    expect(situationLines({})).toEqual([]);
  });

  it('stands alone on either half', () => {
    expect(situationLines({ nacin: 'ukop' })).toEqual(['Želimo ukop.']);
    expect(situationLines({ pokojnik: 'kuca' })).toEqual([
      'Pokojnik je trenutno kod kuće.',
    ]);
  });
});

describe('briefHref', () => {
  it('keeps a fixed parameter order, so the same state is the same URL', () => {
    expect(
      briefHref({
        grad: 'rijeka',
        answers: { situacija: 'preminuo', nacin: 'kremiranje', pokojnik: 'bolnica' },
        ticks: ['organizacija-pogreba', 'urne'],
      }),
    ).toBe(
      '/lista-pogrebnih-usluga?grad=rijeka&situacija=preminuo&nacin=kremiranje' +
        '&pokojnik=bolnica&trebam=organizacija-pogreba%2Curne',
    );
  });

  it('omits trebam entirely when the caller passes none', () => {
    expect(briefHref({ grad: 'split', answers: {} })).toBe(
      '/lista-pogrebnih-usluga?grad=split',
    );
  });

  it('round-trips an emptied sheet', () => {
    const href = briefHref({ grad: 'split', answers: {}, ticks: [] });
    expect(href).toBe('/lista-pogrebnih-usluga?grad=split&trebam=');
    const value = new URL(href, 'https://pogreb.net').searchParams.get('trebam');
    expect(parseTrebam(value ?? undefined, CANONICAL_SERVICE_ORDER)).toEqual([]);
  });
});
