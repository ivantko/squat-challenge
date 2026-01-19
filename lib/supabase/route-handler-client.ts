import type { SerializeOptions } from 'cookie';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from './env-helpers';

type StoredCookie = {
  name: string;
  value: string;
  options?: SerializeOptions;
};

export function createRouteHandlerSupabaseClient({
  request,
}: {
  request: NextRequest;
}) {
  let response = NextResponse.next();
  const cookiesToSync: StoredCookie[] = [];

  const reapplyCookies = () => {
    cookiesToSync.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
  };

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookiesToSync.push({ name, value, options });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const withResponse = (nextResponse: NextResponse) => {
    response = nextResponse;
    reapplyCookies();
    return response;
  };

  return { supabase, withResponse };
}

