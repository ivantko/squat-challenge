import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

export function getSupabaseAdminClient() {
  const env = getSupabaseEnv();
  const url = env?.url;
  const serviceRoleKey = env?.serviceRoleKey;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing env for E2E: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.',
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

