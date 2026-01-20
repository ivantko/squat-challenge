import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { kvDel } from '@/lib/kv';

type CreateEntryBody = {
  challengeSlug: string;
  occurredAt?: string;
  isWin: boolean;
  percentile: number;
  proofPath?: string | null;
  notes?: string | null;
};

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateEntryBody;
  try {
    body = (await request.json()) as CreateEntryBody;
  } catch (error) {
    void error;
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.challengeSlug) {
    return NextResponse.json({ error: 'challengeSlug is required' }, { status: 400 });
  }

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('id, slug')
    .eq('slug', body.challengeSlug)
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  const occurredAt = body.occurredAt ? new Date(body.occurredAt).toISOString() : undefined;

  const { error: insertError } = await supabase.from('entries').insert({
    challenge_id: challenge.id,
    user_id: user.id,
    occurred_at: occurredAt,
    is_win: body.isWin,
    percentile: body.percentile,
    proof_path: body.proofPath ?? null,
    notes: body.notes ?? null,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  await kvDel({ key: `leaderboard:${challenge.slug}` });

  return NextResponse.json({ ok: true });
}

