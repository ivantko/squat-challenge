import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') || '/dashboard';

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = '';

  const supabase = await createServerSupabaseClient();

  // Handle PKCE flow (code parameter from Supabase redirect)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[Auth Confirm] PKCE error:', error.message);
      } else {
        return NextResponse.redirect(redirectTo);
      }
    } catch (err) {
      console.error('[Auth Confirm] PKCE exception:', err);
    }
  }

  // Handle legacy OTP flow (token_hash parameter)
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash });

      if (error) {
        console.error('[Auth Confirm] OTP error:', error.message);
      } else {
        return NextResponse.redirect(redirectTo);
      }
    } catch (err) {
      console.error('[Auth Confirm] OTP exception:', err);
    }
  }

  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = '/auth/login';
  errorUrl.searchParams.set('error', 'invalid_link');
  return NextResponse.redirect(errorUrl);
}

