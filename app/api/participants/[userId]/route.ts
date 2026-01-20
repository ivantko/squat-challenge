import { NextResponse, type NextRequest } from 'next/server';
import { format } from 'date-fns';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RankingPoint = { month: string; position: number };
type HistoryItem = { rank: number; challengeName: string; date: string };

type ParticipantDetailDto = {
  userId: string;
  name: string;
  avatarPath: string | null;
  rank: number;
  wins: number;
  winRate: number;
  top25: number;
  top50: number;
  rankingHistory: RankingPoint[];
  challengeHistory: HistoryItem[];
};

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

function monthLabel(date: Date) {
  return format(date, 'MMM');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const url = new URL(request.url);
  const challengeSlug = url.searchParams.get('challenge') || 'all';
  const { userId: requestedUserId } = await params;

  const supabase = await createServerSupabaseClient();
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_path')
    .eq('id', requestedUserId)
    .single();

  const name = (profile?.display_name as string | null) ?? 'Participant';

  const { data: stats } = await supabase
    .from('leaderboard_view')
    .select('rank,wins,win_rate,top25,top50')
    .eq('challenge_id', challenge.id)
    .eq('user_id', requestedUserId)
    .single();

  const rank = (stats?.rank as number | null) ?? 0;
  const wins = (stats?.wins as number | null) ?? 0;
  const winRate = (stats?.win_rate as number | null) ?? 0;
  const top25 = (stats?.top25 as number | null) ?? 0;
  const top50 = (stats?.top50 as number | null) ?? 0;

  // Ranking history (last 5 months) computed from entries in-memory (MVP).
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - 4);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const months: Date[] = [];
  for (let i = 0; i < 5; i += 1) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    months.push(d);
  }

  const { data: recentEntries } = await supabase
    .from('entries')
    .select('user_id,occurred_at,is_win,percentile')
    .eq('challenge_id', challenge.id)
    .gte('occurred_at', start.toISOString());

  const byMonth = new Map<string, Map<string, { wins: number; total: number; top25: number }>>();
  (recentEntries || []).forEach((e) => {
    const occurredAt = new Date(e.occurred_at as string);
    const mk = monthKey(occurredAt);
    const userId = e.user_id as string;
    const monthStats = byMonth.get(mk) ?? new Map();
    const current = monthStats.get(userId) ?? { wins: 0, total: 0, top25: 0 };

    current.total += 1;
    if (e.is_win as boolean) current.wins += 1;
    if ((e.percentile as number) <= 25) current.top25 += 1;

    monthStats.set(userId, current);
    byMonth.set(mk, monthStats);
  });

  const rankingHistory: RankingPoint[] = months.map((m) => {
    const mk = monthKey(m);
    const monthStats = byMonth.get(mk) ?? new Map();

    const entries = [...monthStats.entries()].map(([userId, s]) => ({
      userId,
      wins: s.wins,
      winRate: s.total > 0 ? s.wins / s.total : 0,
      top25Rate: s.total > 0 ? s.top25 / s.total : 0,
    }));

    entries.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.top25Rate > a.top25Rate ? 1 : b.top25Rate < a.top25Rate ? -1 : 0;
    });

    let position = rank || 0;
    const index = entries.findIndex((x) => x.userId === requestedUserId);
    if (index >= 0) {
      // dense rank
      let currentRank = 0;
      let lastKey = '';
      for (let i = 0; i < entries.length; i += 1) {
        const r = entries[i];
        const key = `${r.wins}:${r.winRate.toFixed(4)}:${r.top25Rate.toFixed(4)}`;
        if (key !== lastKey) {
          currentRank += 1;
          lastKey = key;
        }
        if (r.userId === requestedUserId) {
          position = currentRank;
          break;
        }
      }
    }

    return { month: monthLabel(m), position };
  });

  // Challenge history (for challenges the current user can see via RLS)
  const { data: visibleChallengeIds } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .eq('user_id', user.id);

  const challengeIds = (visibleChallengeIds || []).map((r) => r.challenge_id as string);
  const { data: ranksForUser } = challengeIds.length
    ? await supabase
        .from('leaderboard_view')
        .select('challenge_id,rank')
        .eq('user_id', requestedUserId)
        .in('challenge_id', challengeIds)
    : { data: [] as { challenge_id: string; rank: number }[] };

  const { data: challenges } = challengeIds.length
    ? await supabase
        .from('challenges')
        .select('id,name,ends_at')
        .in('id', challengeIds)
    : { data: [] as { id: string; name: string; ends_at: string | null }[] };

  const challengeById = new Map(
    (challenges || []).map((c) => [
      c.id,
      { name: c.name as string, endsAt: (c.ends_at as string | null) ?? null },
    ]),
  );

  const history: HistoryItem[] = (ranksForUser || [])
    .map((r) => {
      const c = challengeById.get(r.challenge_id as string);
      if (!c) return null;
      return {
        rank: r.rank as number,
        challengeName: c.name,
        date: c.endsAt ? format(new Date(c.endsAt), 'MMM d, yyyy') : '',
      };
    })
    .filter((x): x is HistoryItem => Boolean(x))
    .slice(0, 5);

  const payload: ParticipantDetailDto = {
    userId: requestedUserId,
    name,
    avatarPath: (profile?.avatar_path as string | null) ?? null,
    rank,
    wins,
    winRate,
    top25,
    top50,
    rankingHistory,
    challengeHistory: history,
  };

  return NextResponse.json(payload);
}

