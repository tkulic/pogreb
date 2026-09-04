/**
 * Environment access, validated once at module load.
 *
 * Only the Supabase URL and the `anon` key are ever read here. The
 * `service_role` key bypasses RLS entirely and must never reach client code
 * (SPEC.md -> Never), so there is deliberately no accessor for it.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to web/.env.local and fill it from ` +
        `the Supabase dashboard (Project Settings -> API).`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_ANON_KEY = required(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * The hostname the app is served from in production. Read by the
 * instrumentation guard only -- absent in local development, which is the
 * point: without a match, nothing is logged.
 */
export const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST ?? '';

/**
 * The site's origin, and the single place the localhost fallback is decided.
 *
 * Three consumers need an absolute base -- `robots.ts` for the sitemap line,
 * `sitemap.ts` for every entry, and `metadataBase` in the root layout, which
 * is what turns each page's relative `alternates.canonical` into an absolute
 * URL. They must agree: a sitemap on one host and a canonical tag on another
 * is a self-contradiction handed to a crawler, and search is this product's
 * entire distribution channel.
 *
 * The fallback is deliberately `localhost` rather than a hardcoded production
 * host. An unset `NEXT_PUBLIC_SITE_HOST` means "not the real site" -- the same
 * reading the instrumentation guard takes -- and a wrong absolute host is
 * worse than an obviously local one.
 */
export const SITE_ORIGIN = SITE_HOST
  ? `https://${SITE_HOST}`
  : 'http://localhost:3000';
