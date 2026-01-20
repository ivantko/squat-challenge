import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { kvGetJson, kvSetJson } from '@/lib/kv';

type ChallengeDto = {
  slug: string;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
};

const CHALLENGES_CACHE_KEY = 'challenges:active';
const CHALLENGES_CACHE_TTL_SECONDS = 300;

export async function GET() {
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

  const cached = await kvGetJson<ChallengeDto[]>({ key: CHALLENGES_CACHE_KEY });
  if (cached) {
    return NextResponse.json({ challenges: cached });
  }

  const { data, error } = await supabase
    .from('challenges')
    .select('slug,name,starts_at,ends_at')
    .eq('status', 'active')
    .order('starts_at', { ascending: false, nullsFirst: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to load challenges' }, { status: 500 });
  }

  const challenges: ChallengeDto[] = (data || []).map((c) => ({
    slug: c.slug as string,
    name: c.name as string,
    startsAt: (c.starts_at as string | null) ?? null,
    endsAt: (c.ends_at as string | null) ?? null,
  }));

  await kvSetJson({
    key: CHALLENGES_CACHE_KEY,
    value: challenges,
    ttlSeconds: CHALLENGES_CACHE_TTL_SECONDS,
  });

  return NextResponse.json({ challenges });
}

