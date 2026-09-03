import { supabase } from './supabase';
import { canonicalIndex } from './services';
import type { City, Entity, Service } from './database.types';

/** A service as it hangs off a provider, with that pair's pricing. */
export type ProviderService = Pick<Service, 'id' | 'name' | 'slug'> & {
  price_from: number | null;
  price_to: number | null;
  note: string | null;
};

/** A provider with its services resolved, in canonical order. */
export type Provider = Entity & {
  services: ProviderService[];
};

/**
 * Shape PostgREST returns for the embedded join. `services` comes back as a
 * nested object per `entity_services` row (or null if the FK were ever
 * dangling, which the schema's `on delete restrict` prevents).
 */
type EntityServiceRow = {
  price_from: number | null;
  price_to: number | null;
  note: string | null;
  services: Pick<Service, 'id' | 'name' | 'slug'> | null;
};

type EntityWithServicesRow = Entity & {
  entity_services: EntityServiceRow[] | null;
};

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load city "${slug}": ${error.message}`);
  return (data as City | null) ?? null;
}

/**
 * Every provider in a city, with every service each one offers.
 *
 * **One query for the whole page**, deliberately. Ranking, the block
 * partition and the reason lines are all pure functions over this array
 * (see `ranking.ts`) rather than SQL, which keeps the rules in one readable,
 * unit-testable place. At seven rows the performance argument does not exist,
 * so readability wins outright.
 *
 * Services are sorted into canonical order here, once, so that no caller has
 * to remember to — the database has no ordering column to do it for us.
 */
export async function getCityProviders(cityId: string): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('entities')
    .select(
      '*, entity_services(price_from, price_to, note, services(id, name, slug))',
    )
    .eq('city_id', cityId);

  if (error) {
    throw new Error(`Failed to load providers for city ${cityId}: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as EntityWithServicesRow[];

  return rows.map((row) => {
    const { entity_services, ...entity } = row;

    const services: ProviderService[] = (entity_services ?? [])
      .flatMap((link) =>
        link.services
          ? [
              {
                ...link.services,
                price_from: link.price_from,
                price_to: link.price_to,
                note: link.note,
              },
            ]
          : [],
      )
      .sort((a, b) => canonicalIndex(a.slug) - canonicalIndex(b.slug));

    return { ...entity, services };
  });
}

/**
 * Every pilot city, for screen 2 and the landing page's coverage list.
 *
 * Ordered by name so the list is stable rather than dependent on insertion
 * order — and by `name` rather than by provider count, deliberately: ordering
 * cities by how many providers we found would rank Zagreb first and read as a
 * ranking of the cities themselves, which is not a claim we hold.
 *
 * **`cities[0]` is not "the pilot city" and must never be used as one.** It was
 * a safe shorthand while one row existed; with seven it silently resolves to
 * Dubrovnik, and that is exactly how the landing page and `/sto-uciniti-prvo`
 * came to present Dubrovnik as the whole product after the city expansion.
 */
export async function getCities(): Promise<City[]> {
  const { data, error } = await supabase.from('cities').select('*').order('name');
  if (error) throw new Error(`Failed to load cities: ${error.message}`);
  return (data ?? []) as City[];
}

/**
 * Every provider in every city, with services — for the pages that describe
 * the product as a whole rather than one city.
 *
 * `/sto-uciniti-prvo` is the only caller. It counts how many providers are
 * reachable after hours, handle documents and repatriate from abroad, and
 * those sentences are about the listing as such, so they have to count the
 * listing as such. Before the city expansion it counted `cities[0]`, which was
 * correct while one city existed and became a claim about Dubrovnik the moment
 * six more landed.
 *
 * One query for the lot, same shape as `getCityProviders` minus the filter.
 */
export async function getAllProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('entities')
    .select(
      '*, entity_services(price_from, price_to, note, services(id, name, slug))',
    );

  if (error) throw new Error(`Failed to load providers: ${error.message}`);

  return ((data ?? []) as unknown as EntityWithServicesRow[]).map((row) => {
    const { entity_services, ...entity } = row;
    const services: ProviderService[] = (entity_services ?? [])
      .flatMap((link) =>
        link.services
          ? [
              {
                ...link.services,
                price_from: link.price_from,
                price_to: link.price_to,
                note: link.note,
              },
            ]
          : [],
      )
      .sort((a, b) => canonicalIndex(a.slug) - canonicalIndex(b.slug));
    return { ...entity, services };
  });
}

/** A city with the number of providers listed in it. */
export type CityCoverage = City & { providers: number };

/**
 * Every city with its provider count — the landing page's coverage list.
 *
 * **One query, counted in JavaScript**, rather than a grouped aggregate or a
 * view. PostgREST can return a group-by only through an RPC or a view, and
 * neither is worth a migration to count 45 rows; the column list is narrowed
 * to `city_id` so the payload stays a few hundred bytes however many providers
 * are listed. Revisit if this ever reaches thousands, which is several
 * countries away.
 *
 * **The count is a fact, not a boast**, which is what makes it allowed under
 * the coverage rule (SPEC_frontend.md → Landing page). It says how many
 * providers we hold *for that city*, next to that city's name, where a reader
 * can click through and count them.
 *
 * A city with zero providers is returned, not filtered. The caller decides
 * what to do with it, and hiding it here would make an empty city page
 * reachable from the sitemap but not from the site — the two must agree.
 */
export async function getCityCoverage(): Promise<CityCoverage[]> {
  const cities = await getCities();

  const { data, error } = await supabase.from('entities').select('city_id');
  if (error) throw new Error(`Failed to count providers: ${error.message}`);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { city_id: string }[]) {
    counts.set(row.city_id, (counts.get(row.city_id) ?? 0) + 1);
  }

  return cities.map((city) => ({ ...city, providers: counts.get(city.id) ?? 0 }));
}

/**
 * One provider, by its stored slug within a city.
 *
 * Looks up on `(city_id, slug)` — exactly the composite unique constraint, so
 * this is an index seek. The slug is **stored, never re-derived at query
 * time**: renaming a business must not silently break inbound links.
 *
 * Returns null rather than throwing on a miss, so the page can render a 404
 * rather than a redirect to something plausible.
 */
export async function getProviderBySlug(
  cityId: string,
  slug: string,
): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('entities')
    .select(
      '*, entity_services(price_from, price_to, note, services(id, name, slug))',
    )
    .eq('city_id', cityId)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load provider "${slug}": ${error.message}`);
  if (!data) return null;

  const { entity_services, ...entity } = data as unknown as EntityWithServicesRow;
  const services: ProviderService[] = (entity_services ?? [])
    .flatMap((link) =>
      link.services
        ? [{ ...link.services, price_from: link.price_from, price_to: link.price_to, note: link.note }]
        : [],
    )
    .sort((a, b) => canonicalIndex(a.slug) - canonicalIndex(b.slug));

  return { ...entity, services };
}

/**
 * Which `/usluga/{slug}` pages should exist, evaluated from the data.
 *
 * A service page is generated only when the service, in that city, has **≥3
 * providers and fewer than all of them**. Both halves matter: below three the
 * page is thin content, and at all-of-them it is a duplicate of the city page
 * under a different URL.
 *
 * **The rule is evaluated here, never hardcoded as a list.** The route exists
 * before most of its pages do, and the qualifying set changes as data lands —
 * a hardcoded list would drift into generating thin pages or missing good
 * ones, silently.
 *
 * The qualifying set changed shape entirely with the 2026-09-03 city
 * expansion, which is the argument for evaluating it rather than listing it:
 * Zagreb now generates eleven pages, Split six, Rijeka three, and the three
 * smallest cities none at all — Pula and Dubrovnik have two providers each, so
 * nothing can clear the ≥ 3 threshold, and that is the rule working rather
 * than failing.
 */
export async function getServicePageParams(): Promise<
  { grad: string; usluga: string }[]
> {
  const cities = await getCities();
  const params: { grad: string; usluga: string }[] = [];

  for (const city of cities) {
    const providers = await getCityProviders(city.id);
    const total = providers.length;
    if (total === 0) continue;

    const counts = new Map<string, number>();
    for (const p of providers) {
      for (const s of p.services) counts.set(s.slug, (counts.get(s.slug) ?? 0) + 1);
    }

    for (const [slug, count] of counts) {
      if (count >= 3 && count < total) params.push({ grad: city.slug, usluga: slug });
    }
  }

  return params;
}

/** One service by slug, for the service listing page's heading and copy. */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load service "${slug}": ${error.message}`);
  return (data as Service | null) ?? null;
}
