import { execSync } from 'node:child_process';

type SupabaseEnv = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
};

let cachedSupabaseEnv: SupabaseEnv | null | undefined;

function tryLoadSupabaseEnvFromCli(): SupabaseEnv | null {
  try {
    const raw = execSync('supabase status --output json', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    const data = JSON.parse(raw) as Record<string, unknown>;

    const url =
      (data['api_url'] as string | undefined) ||
      (data['API_URL'] as string | undefined) ||
      (data['apiUrl'] as string | undefined) ||
      (data['API URL'] as string | undefined);

    const anonKey =
      (data['anon_key'] as string | undefined) ||
      (data['ANON_KEY'] as string | undefined) ||
      (data['anonKey'] as string | undefined) ||
      (data['anon key'] as string | undefined);

    const serviceRoleKey =
      (data['service_role_key'] as string | undefined) ||
      (data['SERVICE_ROLE_KEY'] as string | undefined) ||
      (data['serviceRoleKey'] as string | undefined) ||
      (data['service_role key'] as string | undefined);

    if (!url || !anonKey || !serviceRoleKey) {
      return null;
    }

    return { url, anonKey, serviceRoleKey };
  } catch (error) {
    void error;
    return null;
  }
}

export function getSupabaseEnv(): SupabaseEnv | null {
  if (cachedSupabaseEnv !== undefined) {
    return cachedSupabaseEnv;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && anonKey && serviceRoleKey) {
    cachedSupabaseEnv = { url, anonKey, serviceRoleKey };
    return cachedSupabaseEnv;
  }

  cachedSupabaseEnv = tryLoadSupabaseEnvFromCli();
  return cachedSupabaseEnv;
}

export function hasSupabaseEnv() {
  return Boolean(getSupabaseEnv());
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:6006';
}

