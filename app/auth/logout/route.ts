import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/route-handler-client';

export async function POST(request: NextRequest) {
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = '/';
  redirectTo.search = '';

  try {
    const { supabase, withResponse } = createRouteHandlerSupabaseClient({ request });
    await supabase.auth.signOut();
    return withResponse(NextResponse.redirect(redirectTo));
  } catch (error) {
    void error;
    return NextResponse.redirect(redirectTo);
  }
}

