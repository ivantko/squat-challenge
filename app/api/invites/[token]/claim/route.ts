import { NextResponse, type NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service-client';

type RouteParams = {
  params: Promise<{ token: string }>;
};

type ClaimBody = {
  email: string;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { token } = await context.params;

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  let body: ClaimBody;
  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  // Fetch the invite
  const { data: invite, error: fetchError } = await supabase
    .from('invites')
    .select('id, display_name, status, expires_at')
    .eq('token', token)
    .single();

  if (fetchError || !invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
  }

  // Check if already completed
  if (invite.status === 'completed') {
    return NextResponse.json({ error: 'Invite has already been used' }, { status: 410 });
  }

  // Update invite to claimed status with email
  const { error: updateError } = await supabase
    .from('invites')
    .update({
      email,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    })
    .eq('id', invite.id);

  if (updateError) {
    console.error('[Invite Claim] Update error:', updateError.message);
    return NextResponse.json({ error: 'Failed to claim invite' }, { status: 500 });
  }

  // Send magic link with redirect to invite completion page
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const redirectTo = `${siteUrl}/auth/confirm?next=${encodeURIComponent(`/invite/${token}/complete`)}`;

  const { error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        display_name: invite.display_name,
        invite_token: token,
      },
    },
  });

  if (authError) {
    console.error('[Invite Claim] Auth error:', authError.message);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}
