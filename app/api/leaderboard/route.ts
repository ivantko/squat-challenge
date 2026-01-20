import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { kvGetJson, kvSetJson } from '@/lib/kv';

type LeaderboardRow = {
  userId: string;
  displayName: string | null;
  avatarPath: string | null;
  rank: number;
  wins: number;
  winRate: number;
  top25: number;
  top50: number;
};

type LeaderboardResponse = {
  challenge: { slug: string; name: string };
  rows: LeaderboardRow[];
};

const LEADERBOARD_CACHE_TTL_SECONDS = 30;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const challengeSlug = url.searchParams.get('challenge') || 'all';

  const cacheKey = `leaderboard:${challengeSlug}`;
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch (error) {
    void error;
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('id, slug, name')
    .eq('slug', challengeSlug)
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  // Ensure the requester is a participant before returning cached or computed results.
  const { data: membership, error: membershipError } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .eq('challenge_id', challenge.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json({ error: 'Failed to verify membership' }, { status: 500 });
  }

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cached = await kvGetJson<LeaderboardResponse>({ key: cacheKey });
  if (cached) {
    return NextResponse.json(cached);
  }

  const { data: stats, error: statsError } = await supabase
    .from('leaderboard_view')
    .select('user_id,wins,win_rate,top25,top50,rank')
    .eq('challenge_id', challenge.id)
    .order('rank', { ascending: true });

  if (statsError) {
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }

  const userIds = (stats || []).map((row) => row.user_id as string);
  const { data: profiles } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id,display_name,avatar_path')
        .in('id', userIds)
    : { data: [] as { id: string; display_name: string | null; avatar_path: string | null }[] };

  const profileById = new Map(
    (profiles || []).map((p) => [
      p.id,
      { displayName: p.display_name, avatarPath: p.avatar_path },
    ]),
  );

  const payload: LeaderboardResponse = {
    challenge: { slug: challenge.slug, name: challenge.name },
    rows: (stats || []).map((row) => {
      const userId = row.user_id as string;
      const profile = profileById.get(userId);
      return {
        userId,
        displayName: profile?.displayName ?? null,
        avatarPath: profile?.avatarPath ?? null,
        rank: row.rank as number,
        wins: row.wins as number,
        winRate: row.win_rate as number,
        top25: row.top25 as number,
        top50: row.top50 as number,
      };
    }),
  };

  await kvSetJson({
    key: cacheKey,
    value: payload,
    ttlSeconds: LEADERBOARD_CACHE_TTL_SECONDS,
  });

  return NextResponse.json(payload);
}

