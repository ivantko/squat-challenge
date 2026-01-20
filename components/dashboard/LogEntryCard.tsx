'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type LogEntryCardProps = {
  challengeSlug: string;
  currentUserId: string;
  onCreated?: () => void;
  className?: string;
};

export function LogEntryCard({
  challengeSlug,
  currentUserId,
  onCreated,
  className,
}: LogEntryCardProps) {
  const [isWin, setIsWin] = useState(false);
  const [percentile, setPercentile] = useState(50);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    | { type: 'idle' }
    | { type: 'saving' }
    | { type: 'success' }
    | { type: 'error'; message: string }
  >({ type: 'idle' });

  const handleSubmit = async () => {
    setStatus({ type: 'saving' });

    try {
      const supabase = createBrowserSupabaseClient();

      let proofPath: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop() || 'bin';
        const objectPath = `${currentUserId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(objectPath, file, { upsert: false });

        if (uploadError) {
          setStatus({ type: 'error', message: uploadError.message });
          return;
        }
        proofPath = objectPath;
      }

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeSlug,
          isWin,
          percentile,
          proofPath,
          notes: notes.trim() ? notes.trim() : null,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ type: 'error', message: data.error || 'Failed to save entry' });
        return;
      }

      setNotes('');
      setFile(null);
      setIsWin(false);
      setPercentile(50);
      setStatus({ type: 'success' });
      onCreated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus({ type: 'error', message });
    }
  };

  return (
    <div className={cn('rounded-3xl bg-card p-5 shadow-xl', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Log an entry</h3>
        <span className="text-xs text-muted-foreground">{challengeSlug}</span>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={isWin}
            onChange={(e) => setIsWin(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-foreground">Mark as win</span>
        </label>

        <label className="block space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Percentile</span>
            <span className="text-muted-foreground">{percentile}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={percentile}
            onChange={(e) => setPercentile(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            Lower is better (Top 25% means percentile ≤ 25).
          </div>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">Proof (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Anything worth remembering…"
          />
        </label>

        {status.type === 'error' && (
          <div className="text-sm text-red-600 dark:text-red-400">{status.message}</div>
        )}
        {status.type === 'success' && (
          <div className="text-sm text-green-600 dark:text-green-400">Saved.</div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={status.type === 'saving'}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.type === 'saving' ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </div>
  );
}

