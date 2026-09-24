'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProviderRow } from './ProviderRow';
import { ListingFilters } from './ListingFilters';
import { FilterToggle } from './FilterToggle';
import { BackHome } from './BackHome';
import { useMounted } from './useMounted';
import {
  answersToQuery,
  briefHref,
  filtriToQuery,
  parseAnswers,
  parseFiltri,
  parsePoredak,
  type FlowAnswers,
} from '@/lib/answers';
import {
  applyFilters,
  filterCounts,
  orderProviders,
  type Filter,
} from '@/lib/listing';
import { guidanceFor } from '@/lib/guidance';
import type { Provider } from '@/lib/queries';
import styles from './CityListing.module.css';

/**
 * The body of a city page: the filter panel, the list, the sheet, the guidance.
 *
 * ## Why this is a client component, and why it does not use `useSearchParams`
 *
 * The city pages are statically rendered, so nothing that depends on the URL
 * can run on the server (SPEC_frontend.md → Rendering). The established way to
 * read it in the browser is `useSearchParams` behind a `Suspense` boundary, as
 * `FlowBackLink` does — **and it is the wrong tool here.** During static
 * rendering `useSearchParams` makes its subtree bail out to client-side
 * rendering, so what lands in the HTML is the Suspense *fallback*. On a link
 * that is a link. On this component it would be a city page whose served HTML
 * contains no providers at all — on a site with 88 URLs waiting to be indexed,
 * the worst possible trade.
 *
 * So: render the complete, unfiltered, alphabetical list — the same thing a
 * crawler and a reader with no JavaScript get — and let `useMounted` narrow it
 * once we are in the browser and can see the URL. **The unfiltered list is the
 * truth; the filters are a convenience laid over it**, which is exactly the
 * relationship the removal of ranking was meant to establish.
 *
 * The URL is kept in step with `history.replaceState` rather than the router:
 * nothing here reads router state, every link is built from our own values, and
 * a router navigation would re-run the route for a purely local change.
 */

function search(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function CityListing({
  providers,
  citySlug,
  areaLabel,
  areaLocative,
  filtersAvailable,
}: {
  providers: Provider[];
  citySlug: string;
  areaLabel: string;
  areaLocative: string;
  /**
   * Whether this city is large enough to offer filters at all
   * (`FILTERS_MIN_PROVIDERS`). Decided on the server so the funnel is absent
   * from the served HTML rather than appearing after hydration.
   */
  filtersAvailable: boolean;
}) {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  /** The reader's own changes. `undefined` means the URL still speaks for them. */
  const [picked, setPicked] = useState<Filter[] | undefined>(undefined);
  const [order, setOrder] = useState<boolean | undefined>(undefined);

  const params = mounted ? search() : new URLSearchParams();
  const answers: FlowAnswers = parseAnswers(Object.fromEntries(params.entries()));

  const active =
    picked ?? parseFiltri(params.get('filtri') ?? undefined, filtersAvailable);
  const availabilityFirst = order ?? parsePoredak(params.get('poredak') ?? undefined);

  const counts = filterCounts(providers, active);
  const matching = applyFilters(providers, active);
  const shown = orderProviders(matching, availabilityFirst);

  const query = answersToQuery(answers);
  const guidance = guidanceFor(answers);

  /** Mirror state into the address bar so the view stays shareable. */
  function sync(nextFilters: Filter[], nextOrder: boolean) {
    const next = search();
    const filtri = filtriToQuery(nextFilters);
    if (filtri) next.set('filtri', filtri);
    else next.delete('filtri');
    if (nextOrder) next.set('poredak', 'dostupnost');
    else next.delete('poredak');
    const qs = next.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }

  function toggleFilter(filter: Filter) {
    const next = active.includes(filter)
      ? active.filter((f) => f !== filter)
      : [...active, filter];
    setPicked(next);
    sync(next, availabilityFirst);
  }

  function toggleOrder() {
    const next = !availabilityFirst;
    setOrder(next);
    sync([...active], next);
  }

  const filtered = shown.length !== providers.length;

  return (
    <>
      {/*
        The header lives here rather than in the server component because two
        of its three parts are client state: the count reads `5 od 17` once a
        filter is on, and the funnel is the control that put it there. The
        `<h1>` is still in the served HTML -- a client component is rendered on
        the server for the initial markup -- so the heading-carries-the-city
        rule (SPEC_frontend.md -> Search) is untouched.
      */}
      <header className={styles.header}>
        {/*
          Inside the header, not a sibling of it: as a child of `.page` it
          would take the shell's 26px gap on top of its own height. It replaced
          the `← Pitanja` back link, which cost 74px before the `<h1>` — see
          `BackHome` for why home is the better destination.
        */}
        <BackHome />
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            <span className={styles.titleLine}>
              <span className={styles.titleName}>Pogrebnici</span>
              {/*
                A bare figure beside a heading, which is the position the
                no-counts-in-prose rule explicitly does not cover: it counts the
                rows below it rather than the market, and it is the number the
                funnel changes. `providerCountLabel` is not used here for the
                same reason — "Pogrebnici · 17 pogrebnika" says the noun twice.
              */}
              <span className={styles.count}>
                · {filtered ? `${shown.length} od ${providers.length}` : providers.length}
              </span>
            </span>
            <span className={styles.city}>{areaLabel}</span>
          </h1>
          {filtersAvailable && (
            <FilterToggle
              open={open}
              activeCount={active.length + (availabilityFirst ? 1 : 0)}
              onToggle={() => setOpen((v) => !v)}
            />
          )}
        </div>
      </header>

      {filtersAvailable && open && (
        <ListingFilters
          active={active}
          counts={counts}
          availabilityFirst={availabilityFirst}
          onToggleFilter={toggleFilter}
          onToggleOrder={toggleOrder}
        />
      )}

      {/*
        **Unreachable through the panel, and kept anyway.** The size threshold
        means only Zagreb and Split offer filters, and neither returns an empty
        result for any of the eight combinations — but the state can still
        arrive by URL, from a link shared in a messenger or a bookmark taken
        before the data changed. A page that renders nothing with no
        explanation is the one outcome a family must never meet.
      */}
      {shown.length === 0 ? (
        <p className={styles.empty}>
          Nijedan pogrebnik u {areaLocative} ne odgovara odabranom. Poništite
          nešto od odabranog ili{' '}
          <Link className={styles.change} href={`/pogrebne-usluge/${citySlug}`}>
            pogledajte sve pogrebnike
          </Link>
          .
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              citySlug={citySlug}
              query={query}
            />
          ))}
        </ul>
      )}

      {/*
        The sheet a family carries to the funeral director
        (SPEC_frontend.md → The list a family carries).

        **After the list**, which is the moment in the journey rather than the
        loudest position: the reader has scanned, nobody has been called yet,
        and a list of what to ask for is the next thought. An icon in the
        masthead was the alternative and was rejected — no glyph says
        "checklist of funeral services", which is the same reason the
        provider's website lost its icon on the row.

        **Outlined, never filled.** `RowActions.module.css` holds the page to
        exactly one solid dark mass per row, and it is the call. A filled
        button here would be a second, competing with every phone action on the
        page at once — which is also why this is not a floating bar.
      */}
      <section className={styles.brief}>
        <p className={styles.briefText}>Ponesite popis usluga pogrebniku</p>
        {/*
          No `trebam`. This page has no business deciding what the family
          needs; the sheet derives its first ticks from the answers and hands
          the rest to them.
        */}
        <Link className={styles.briefAction} href={briefHref({ grad: citySlug, answers })}>
          Pripremite
        </Link>
      </section>

      {/*
        Guidance sits below the providers, not above them. It is useful and
        honestly sourced, but a family that arrived to find someone to call
        should meet the providers first; here it catches the reader who did not
        find what they needed in the list.
      */}
      {guidance && (
        <section className={styles.guidance} aria-label="Što učiniti prvo">
          <h2 className={styles.guidanceHeading}>Što učiniti prvo</h2>
          {guidance.lines.map((line) => (
            <p key={line} className={styles.guidanceText}>
              {line}
            </p>
          ))}
          <Link className={styles.footerLink} href="/sto-uciniti-prvo">
            Cijeli postupak
          </Link>
        </section>
      )}
    </>
  );
}
