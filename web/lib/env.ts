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
