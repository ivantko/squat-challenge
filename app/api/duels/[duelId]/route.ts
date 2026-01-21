import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DuelStatus } from '@/models/challenge-ranking';

type UpdateDuelBody = {
  action: 'accept' | 'decline' | 'cancel' | 'complete';
  winnerId?: string;
  challengerScore?: number;
  challengedScore?: number;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ duelId: string }> },
) {
  const { duelId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: duel, error } = await supabase
    .from('duels')
    .select(
      `
      id,
      challenge_id,
      challenger_id,
      challenged_id,
      scoring_type,
      status,
      winner_id,
      challenger_score,
      challenged_score,
      notes,
      created_at,
      completed_at,
      challenger:profiles!duels_challenger_id_fkey(display_name),
      challenged:profiles!duels_challenged_id_fkey(display_name)
    `,
    )
    .eq('id', duelId)
    .single();

  if (error || !duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
  }

  // Check if user is involved in the duel
  if (duel.challenger_id !== user.id && duel.challenged_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json({ duel });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ duelId: string }> },
) {
  const { duelId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: UpdateDuelBody;
  try {
    body = (await request.json()) as UpdateDuelBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Fetch the duel first
  const { data: duel, error: fetchError } = await supabase
    .from('duels')
    .select('*')
    .eq('id', duelId)
    .single();

  if (fetchError || !duel) {
    return NextResponse.json({ error: 'Duel not found' }, { status: 404 });
  }

  // Check if user is involved
  const isChallenger = duel.challenger_id === user.id;
  const isChallenged = duel.challenged_id === user.id;

  if (!isChallenger && !isChallenged) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  let newStatus: DuelStatus;
  const updateData: Record<string, unknown> = {};

  switch (body.action) {
    case 'accept':
      // Only challenged user can accept
      if (!isChallenged) {
        return NextResponse.json(
          { error: 'Only the challenged user can accept' },
          { status: 403 },
        );
      }
      if (duel.status !== 'pending') {
        return NextResponse.json({ error: 'Duel is not pending' }, { status: 400 });
      }
      newStatus = 'accepted';
      break;

    case 'decline':
      // Only challenged user can decline
      if (!isChallenged) {
        return NextResponse.json(
          { error: 'Only the challenged user can decline' },
          { status: 403 },
        );
      }
      if (duel.status !== 'pending') {
        return NextResponse.json({ error: 'Duel is not pending' }, { status: 400 });
      }
      newStatus = 'declined';
      break;

    case 'cancel':
      // Only challenger can cancel, and only if pending
      if (!isChallenger) {
        return NextResponse.json(
          { error: 'Only the challenger can cancel' },
          { status: 403 },
        );
      }
      if (duel.status !== 'pending') {
        return NextResponse.json({ error: 'Duel is not pending' }, { status: 400 });
      }
      newStatus = 'cancelled';
      break;

    case 'complete':
      // Either party can complete if accepted
      if (duel.status !== 'accepted') {
        return NextResponse.json({ error: 'Duel must be accepted first' }, { status: 400 });
      }

      // For win_loss, need winnerId
      if (duel.scoring_type === 'win_loss') {
        if (!body.winnerId) {
          return NextResponse.json(
            { error: 'winnerId is required for win_loss duels' },
            { status: 400 },
          );
        }
        if (body.winnerId !== duel.challenger_id && body.winnerId !== duel.challenged_id) {
          return NextResponse.json(
            { error: 'winnerId must be challenger or challenged' },
            { status: 400 },
          );
        }
        updateData.winner_id = body.winnerId;
      } else {
        // For score_based, need scores
        if (body.challengerScore === undefined || body.challengedScore === undefined) {
          return NextResponse.json(
            { error: 'Both scores are required for score_based duels' },
            { status: 400 },
          );
        }
        updateData.challenger_score = body.challengerScore;
        updateData.challenged_score = body.challengedScore;
        // Determine winner by score
        if (body.challengerScore > body.challengedScore) {
          updateData.winner_id = duel.challenger_id;
        } else if (body.challengedScore > body.challengerScore) {
          updateData.winner_id = duel.challenged_id;
        }
        // If tied, no winner
      }

      newStatus = 'completed';
      updateData.completed_at = new Date().toISOString();
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  updateData.status = newStatus;

  const { error: updateError } = await supabase
    .from('duels')
    .update(updateData)
    .eq('id', duelId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
