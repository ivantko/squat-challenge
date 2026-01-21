'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shared/ui/popover';
import { Button } from '@/components/shared/ui/button';

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
  const [occurredAt, setOccurredAt] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
          occurredAt: occurredAt.toISOString(),
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
      setOccurredAt(new Date());
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
        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date</label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !occurredAt && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {occurredAt ? format(occurredAt, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DayPicker
                mode="single"
                selected={occurredAt}
                onSelect={(date) => {
                  if (date) {
                    setOccurredAt(date);
                  }
                  setIsCalendarOpen(false);
                }}
                disabled={{ after: new Date() }}
                defaultMonth={occurredAt}
                classNames={{
                  root: 'p-3',
                  months: 'flex flex-col sm:flex-row gap-2',
                  month: 'flex flex-col gap-4',
                  month_caption: 'flex justify-center items-center h-7',
                  caption_label: 'text-sm font-medium',
                  nav: 'flex items-center gap-1',
                  button_previous:
                    'absolute left-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center',
                  button_next:
                    'absolute right-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center',
                  weekdays: 'flex',
                  weekday: 'text-muted-foreground w-9 font-normal text-[0.8rem]',
                  week: 'flex w-full mt-2',
                  day: 'h-9 w-9 p-0 text-center text-sm aria-selected:opacity-100',
                  day_button:
                    'h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-md focus:bg-accent focus:text-accent-foreground',
                  selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
                  today: 'bg-accent text-accent-foreground rounded-md',
                  outside: 'text-muted-foreground opacity-50',
                  disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
                  hidden: 'invisible',
                }}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Select when this entry occurred (defaults to today)
          </p>
        </div>

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
