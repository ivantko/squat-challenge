import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') || '/dashboard';

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = '';

  if (token_hash && type) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.verifyOtp({ type, token_hash });

      if (!error) {
        return NextResponse.redirect(redirectTo);
      }
    } catch (error) {
      void error;
    }
  }

  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = '/auth/login';
  errorUrl.searchParams.set('error', 'invalid_link');
  return NextResponse.redirect(errorUrl);
}

