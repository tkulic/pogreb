import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';
import type { Database } from './database.types';

/**
 * The one Supabase client in the app.
 *
 * There is exactly one because there is only one key: `anon`. It carries no
 * privileges beyond the public SELECT policies and `execute` on `log_event`
 * (SPEC_database.md -> RLS), and it is meant to ship in the browser -- so the
 * same client is correct in a Server Component and in a Client Component, and
 * no server-only variant is needed or wanted.
 *
 * The `service_role` key is never read anywhere in this app. Routing the only
 * public write through a `security definer` function is what makes that a
 * structural fact rather than a rule to remember (SPEC.md -> Never).
 *
 * `persistSession` is off: Phase 1 has no login, and leaving it on would write
 * a Supabase auth entry to `localStorage` on every visit -- a stored
 * identifier, which is the thing the no-cookie-banner position rests on not
 * having (SPEC.md -> Boundaries).
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
