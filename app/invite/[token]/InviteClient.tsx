'use client';

import { useEffect, useState } from 'react';

type InviteData = {
  displayName: string;
  status: 'pending' | 'claimed';
};

type Status =
  | { type: 'loading' }
  | { type: 'loaded'; invite: InviteData }
  | { type: 'submitting' }
  | { type: 'sent'; email: string }
  | { type: 'error'; message: string };

type Props = {
  token: string;
};

export function InviteClient({ token }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ type: 'loading' });

  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/invites/${token}`);

        if (!response.ok) {
          const data = await response.json();
          setStatus({ type: 'error', message: data.error || 'Invite not found' });
          return;
        }

        const data = await response.json();
        setStatus({ type: 'loaded', invite: data });
      } catch {
        setStatus({ type: 'error', message: 'Failed to load invite' });
      }
    }

    fetchInvite();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (status.type !== 'loaded') return;

    setStatus({ type: 'submitting' });

    try {
      const response = await fetch(`/api/invites/${token}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: 'error', message: data.error || 'Failed to claim invite' });
        return;
      }

      setStatus({ type: 'sent', email: data.email });
    } catch {
      setStatus({ type: 'error', message: 'Failed to send magic link' });
    }
  };

  if (status.type === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
          <div className="text-sm text-muted-foreground">Loading invite...</div>
        </div>
      </div>
    );
  }

  if (status.type === 'error') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Invalid Invite</h1>
            <p className="text-sm text-muted-foreground">{status.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status.type === 'sent') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Check your email</div>
              <div className="text-sm text-muted-foreground">
                We sent a sign-in link to{' '}
                <span className="font-medium text-foreground">{status.email}</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const invite = status.type === 'loaded' ? status.invite : null;
  const isSubmitting = status.type === 'submitting';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">
            Welcome, {invite?.displayName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            You've been invited to join the challenge. Enter your email to get started.
          </p>
        </div>

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
                disabled={isSubmitting}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="you@example.com"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Join Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
