import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RouteParams = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: NextRequest, context: RouteParams) {
  const { token } = await context.params;

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data: invite, error } = await supabase
    .from('invites')
    .select('display_name, status, expires_at')
    .eq('token', token)
    .single();

  if (error || !invite) {
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

  return NextResponse.json({
    displayName: invite.display_name,
    status: invite.status,
  });
}
