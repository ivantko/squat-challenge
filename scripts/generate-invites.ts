/**
 * Generate invite links for the 5 buddies
 *
 * Usage:
 *   npx tsx scripts/generate-invites.ts <site-url>
 *
 * Local development:
 *   npm run supabase:start
 *   npx tsx scripts/generate-invites.ts http://localhost:6006
 *
 * Production:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/generate-invites.ts https://your-app.vercel.app
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const BUDDIES = ['Austin', 'Justin', 'Ivan', 'Jesse', 'Jeff'] as const;

type BuddyName = (typeof BUDDIES)[number];

type InviteResult = {
  name: BuddyName;
  token: string;
  url: string;
  status: 'created' | 'exists' | 'error';
  message?: string;
};

function generateSecureToken(): string {
  // Generate a URL-safe base64 token (32 bytes = 256 bits of entropy)
  return randomBytes(32).toString('base64url');
}

async function generateInvites(): Promise<void> {
  // Get site URL from command line argument or env var
  const siteUrl = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error('Error: Site URL is required.\n');
    console.error('Usage: npx tsx scripts/generate-invites.ts <site-url>\n');
    console.error('Examples:');
    console.error('  npx tsx scripts/generate-invites.ts https://myapp.vercel.app');
    console.error('  npx tsx scripts/generate-invites.ts http://localhost:6006');
    process.exit(1);
  }

  // Validate URL format
  try {
    new URL(siteUrl);
  } catch {
    console.error(`Error: Invalid URL format: ${siteUrl}`);
    process.exit(1);
  }

  // Use local Supabase by default, or override with env vars
  const supabaseUrl =
    process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  console.log(`Connecting to Supabase at ${supabaseUrl}...`);
  console.log(`Generating invite links for ${siteUrl}\n`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results: InviteResult[] = [];

  for (const name of BUDDIES) {
    try {
      // Check if an active invite already exists for this buddy
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('token, status, expires_at')
        .eq('display_name', name)
        .in('status', ['pending', 'claimed'])
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingInvite) {
        const url = `${siteUrl}/invite/${existingInvite.token}`;
        console.log(`${name}:`);
        console.log(`  ${url}`);
        console.log(`  Status: ${existingInvite.status} (existing)`);
        console.log('');
        results.push({
          name,
          token: existingInvite.token,
          url,
          status: 'exists',
        });
        continue;
      }

      // Generate new invite
      const token = generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

      const { error: insertError } = await supabase
        .from('invites')
        .insert({
          token,
          display_name: name,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error(`${name}: Failed to create invite - ${insertError.message}`);
        results.push({
          name,
          token: '',
          url: '',
          status: 'error',
          message: insertError.message,
        });
        continue;
      }

      const url = `${siteUrl}/invite/${token}`;
      console.log(`${name}:`);
      console.log(`  ${url}`);
      console.log('');
      results.push({
        name,
        token,
        url,
        status: 'created',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`${name}: Error - ${message}`);
      results.push({
        name,
        token: '',
        url: '',
        status: 'error',
        message,
      });
    }
  }

  // Summary
  console.log('--- Summary ---');
  const created = results.filter((r) => r.status === 'created').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`New invites created: ${created}`);
  console.log(`Existing active invites: ${exists}`);
  console.log(`Errors: ${errors}`);

  if (created > 0 || exists > 0) {
    console.log('\nShare these links with your buddies!');
    console.log('They click the link → enter their email → confirm via magic link → they\'re in!');
  }
}

generateInvites()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Generate invites failed:', error);
    process.exit(1);
  });
