/**
 * Seed script to create the 5 buddies for FiveGuysLudus
 *
 * Run with: npx tsx scripts/seed-buddies.ts
 *
 * Prerequisites:
 * - Local Supabase running: `npm run supabase:start`
 * - Or set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for hosted instance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUDDIES = ['Austin', 'Ivan', 'Justin', 'Jesse', 'Jeff'] as const;

type BuddyName = (typeof BUDDIES)[number];

type BuddyConfig = {
  name: BuddyName;
  winRate: number;
  entriesPerChallenge: number;
};

/**
 * Configuration for each buddy's performance characteristics
 * - winRate: probability of each entry being a win (0-1)
 * - entriesPerChallenge: how many entries to create per challenge
 */
const BUDDY_CONFIGS: BuddyConfig[] = [
  { name: 'Austin', winRate: 0.70, entriesPerChallenge: 12 },
  { name: 'Ivan', winRate: 0.60, entriesPerChallenge: 10 },
  { name: 'Justin', winRate: 0.45, entriesPerChallenge: 8 },
  { name: 'Jesse', winRate: 0.35, entriesPerChallenge: 6 },
  { name: 'Jeff', winRate: 0.25, entriesPerChallenge: 5 },
];

type SeedResult = {
  name: BuddyName;
  email: string;
  userId: string | null;
  status: 'created' | 'exists' | 'error';
  message?: string;
};

type Challenge = {
  id: string;
  slug: string;
  name: string;
};

type Entry = {
  user_id: string;
  challenge_id: string;
  occurred_at: string;
  is_win: boolean;
  percentile: number;
  notes: null;
  proof_path: null;
};

/**
 * Creates sample entries for a buddy in a challenge
 */
async function createEntriesForBuddy(
  supabase: SupabaseClient,
  userId: string,
  challenge: Challenge,
  config: BuddyConfig,
): Promise<number> {
  const entries: Entry[] = [];
  const now = new Date();

  for (let i = 0; i < config.entriesPerChallenge; i++) {
    // Spread entries over past 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const occurredAt = new Date(now);
    occurredAt.setDate(occurredAt.getDate() - daysAgo);

    const isWin = Math.random() < config.winRate;
    const percentile = Math.floor(Math.random() * 90) + 5; // 5-95

    entries.push({
      user_id: userId,
      challenge_id: challenge.id,
      occurred_at: occurredAt.toISOString(),
      is_win: isWin,
      percentile,
      notes: null,
      proof_path: null,
    });
  }

  const { error } = await supabase.from('entries').insert(entries);
  if (error) {
    console.warn(`    Warning: Failed to create entries for ${config.name} in ${challenge.name}:`, error.message);
    return 0;
  }
  return entries.length;
}

async function seedBuddies(): Promise<void> {
  // Use local Supabase by default, or override with env vars
  const supabaseUrl =
    process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  console.log(`Connecting to Supabase at ${supabaseUrl}...`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results: SeedResult[] = [];

  // Fetch all challenges to join users to them
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('id, slug, name') as { data: Challenge[] | null; error: Error | null };

  if (challengesError) {
    console.error('Failed to fetch challenges:', challengesError.message);
    console.log('Continuing without challenge enrollment...');
  } else {
    console.log(`Found ${challenges?.length || 0} challenges to enroll buddies in.`);
  }

  // Track total entries created
  let totalEntriesCreated = 0;

  for (const name of BUDDIES) {
    const email = `${name.toLowerCase()}@fiveguysludus.local`;

    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const users = existingUsers?.users as Array<{ id: string; email?: string }> | undefined;
      const existingUser = users?.find((u) => u.email === email);

      if (existingUser) {
        console.log(`✓ ${name} already exists (${email})`);
        results.push({
          name,
          email,
          userId: existingUser.id,
          status: 'exists',
        });

        // Still update their display name and join challenges
        await supabase
          .from('profiles')
          .update({ display_name: name })
          .eq('id', existingUser.id);

        // Get buddy config for entry creation
        const config = BUDDY_CONFIGS.find((c) => c.name === name);

        // Join all challenges and create entries
        if (challenges && config) {
          let entriesForBuddy = 0;
          for (const challenge of challenges) {
            await supabase.from('challenge_participants').upsert(
              { user_id: existingUser.id, challenge_id: challenge.id },
              { onConflict: 'user_id,challenge_id' },
            );

            // Check if entries already exist for this buddy/challenge
            const { count } = await supabase
              .from('entries')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', existingUser.id)
              .eq('challenge_id', challenge.id);

            if (!count || count === 0) {
              const created = await createEntriesForBuddy(supabase, existingUser.id, challenge, config);
              entriesForBuddy += created;
            }
          }
          if (entriesForBuddy > 0) {
            console.log(`  → Created ${entriesForBuddy} entries for ${name}`);
            totalEntriesCreated += entriesForBuddy;
          }
        }

        continue;
      }

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password: 'demo123456',
          email_confirm: true,
        });

      if (authError) {
        console.error(`✗ Failed to create ${name}:`, authError.message);
        results.push({
          name,
          email,
          userId: null,
          status: 'error',
          message: authError.message,
        });
        continue;
      }

      if (authData?.user) {
        // Update profile display name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ display_name: name })
          .eq('id', authData.user.id);

        if (profileError) {
          console.warn(`  Warning: Could not update profile for ${name}:`, profileError.message);
        }

        // Get buddy config for entry creation
        const config = BUDDY_CONFIGS.find((c) => c.name === name);

        // Join all challenges and create entries
        if (challenges && config) {
          let entriesForBuddy = 0;
          for (const challenge of challenges) {
            await supabase.from('challenge_participants').upsert(
              { user_id: authData.user.id, challenge_id: challenge.id },
              { onConflict: 'user_id,challenge_id' },
            );

            const created = await createEntriesForBuddy(supabase, authData.user.id, challenge, config);
            entriesForBuddy += created;
          }
          console.log(`  → Enrolled ${name} in ${challenges.length} challenges`);
          console.log(`  → Created ${entriesForBuddy} entries for ${name}`);
          totalEntriesCreated += entriesForBuddy;
        }

        console.log(`✓ Created ${name} (${email})`);
        results.push({
          name,
          email,
          userId: authData.user.id,
          status: 'created',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`✗ Error with ${name}:`, message);
      results.push({
        name,
        email,
        userId: null,
        status: 'error',
        message,
      });
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  const created = results.filter((r) => r.status === 'created').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`Users created: ${created}`);
  console.log(`Users already existed: ${exists}`);
  console.log(`User errors: ${errors}`);
  console.log(`Total entries created: ${totalEntriesCreated}`);

  if (created > 0 || exists > 0) {
    console.log('\nBuddies can log in with:');
    console.log('  Email: {name}@fiveguysludus.local');
    console.log('  Password: demo123456');
  }
}

seedBuddies()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
