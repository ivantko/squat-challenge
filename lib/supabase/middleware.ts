import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from './env-helpers';

function isPublicPath({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/_next')) {
    return true;
  }
  if (pathname.startsWith('/api')) {
    // Keep API public for now; individual routes will enforce auth.
    return true;
  }
  if (pathname.startsWith('/auth')) {
    return true;
  }
  if (pathname === '/favicon.ico') {
    return true;
  }

  // Marketing/content pages are public by default. We'll protect `/dashboard`.
  return pathname !== '/dashboard' && !pathname.startsWith('/dashboard/');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  // If Supabase isn't configured, don't block the app. This keeps local dev usable.
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: avoid any logic between createServerClient and auth.getUser()/getClaims.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath({ pathname: request.nextUrl.pathname })) {
    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = '/auth/login';
    redirectTo.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectTo);
  }

  return supabaseResponse;
}

