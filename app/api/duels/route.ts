import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DuelScoringType, Duel } from '@/models/challenge-ranking';

type CreateDuelBody = {
  challengeId?: string;
  challengedId: string;
  scoringType: DuelScoringType;
  notes?: string;
};

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: duels, error } = await supabase
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
    .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedDuels: Duel[] = (duels || []).map((d) => ({
    id: d.id,
    challengeId: d.challenge_id ?? undefined,
    challengerId: d.challenger_id,
    challengedId: d.challenged_id,
    challengerName:
      (d.challenger as { display_name?: string } | null)?.display_name ?? undefined,
    challengedName:
      (d.challenged as { display_name?: string } | null)?.display_name ?? undefined,
    scoringType: d.scoring_type as DuelScoringType,
    status: d.status,
    winnerId: d.winner_id ?? undefined,
    challengerScore: d.challenger_score ?? undefined,
    challengedScore: d.challenged_score ?? undefined,
    notes: d.notes ?? undefined,
    createdAt: d.created_at,
    completedAt: d.completed_at ?? undefined,
  }));

  return NextResponse.json({ duels: mappedDuels });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateDuelBody;
  try {
    body = (await request.json()) as CreateDuelBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.challengedId) {
    return NextResponse.json({ error: 'challengedId is required' }, { status: 400 });
  }

  if (body.challengedId === user.id) {
    return NextResponse.json({ error: 'Cannot duel yourself' }, { status: 400 });
  }

  if (body.scoringType && !['win_loss', 'score_based'].includes(body.scoringType)) {
    return NextResponse.json({ error: 'Invalid scoring type' }, { status: 400 });
  }

  const { data: duel, error: insertError } = await supabase
    .from('duels')
    .insert({
      challenge_id: body.challengeId ?? null,
      challenger_id: user.id,
      challenged_id: body.challengedId,
      scoring_type: body.scoringType || 'win_loss',
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ duel });
}
