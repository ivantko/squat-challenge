'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function AuthLoginClient() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => searchParams.get('next') || '/dashboard',
    [searchParams],
  );

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    | { type: 'idle' }
    | { type: 'sending' }
    | { type: 'sent'; email: string }
    | { type: 'error'; message: string }
  >({ type: 'idle' });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ type: 'sending' });

    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const emailRedirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        setStatus({ type: 'error', message: error.message });
        return;
      }

      setStatus({ type: 'sent', email });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus({ type: 'error', message });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            We’ll email you a magic link to sign in.
          </p>
        </div>

        {status.type === 'sent' ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Check your email</div>
              <div className="text-sm text-muted-foreground">
                We sent a sign-in link to{' '}
                <span className="font-medium text-foreground">
                  {status.email}
                </span>
                .
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="you@example.com"
                />
              </label>

              {status.type === 'error' && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={status.type === 'sending'}
                className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.type === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

