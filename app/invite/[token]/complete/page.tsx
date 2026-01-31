import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service-client';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InviteCompletePage({ params }: PageProps) {
  const { token } = await params;

  // Get the authenticated user
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, redirect to invite page to try again
    redirect(`/invite/${token}`);
  }

  // Use service role to update the invite
  const serviceClient = createServiceSupabaseClient();

  // Fetch and update the invite atomically
  const { data: invite, error: fetchError } = await serviceClient
    .from('invites')
    .select('id, status, user_id')
    .eq('token', token)
    .single();

  if (fetchError || !invite) {
    // Invalid invite, redirect to dashboard anyway since user is authenticated
    redirect('/dashboard');
  }

  // Only complete if not already completed
  if (invite.status !== 'completed') {
    const { error: updateError } = await serviceClient
      .from('invites')
      .update({
        user_id: user.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', invite.id);

    if (updateError) {
      console.error('[Invite Complete] Update error:', updateError.message);
      // Still redirect to dashboard - user is authenticated
    }
  }

  // Redirect to dashboard
  redirect('/dashboard');
}
