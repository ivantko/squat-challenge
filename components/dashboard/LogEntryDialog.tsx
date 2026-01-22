'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Checkbox } from '@/components/shared/ui/checkbox';
import { Slider } from '@/components/shared/ui/slider';
import { Textarea } from '@/components/shared/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shared/ui/popover';

type LogEntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeSlug: string;
  currentUserId: string;
  onEntryCreated?: () => void;
};

export function LogEntryDialog({
  open,
  onOpenChange,
  challengeSlug,
  currentUserId,
  onEntryCreated,
}: LogEntryDialogProps) {
  const [occurredAt, setOccurredAt] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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

  const resetForm = () => {
    setIsWin(false);
    setPercentile(50);
    setNotes('');
    setFile(null);
    setOccurredAt(new Date());
    setStatus({ type: 'idle' });
  };

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

      setStatus({ type: 'success' });
      onOpenChange(false);
      resetForm();
      onEntryCreated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus({ type: 'error', message });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
          </div>

          {/* Win checkbox */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isWin"
              checked={isWin}
              onCheckedChange={(checked) => {
                setIsWin(!!checked);
              }}
            />
            <label htmlFor="isWin" className="text-sm text-foreground">
              Mark as win
            </label>
          </div>

          {/* Percentile slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Percentile</span>
              <span className="text-muted-foreground">{percentile}</span>
            </div>
            <Slider
              value={[percentile]}
              onValueChange={(v) => {
                setPercentile(v[0]);
              }}
              max={100}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Lower is better (Top 25% means percentile ≤ 25).
            </p>
          </div>

          {/* Proof upload */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Proof (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
              }}
              placeholder="Anything worth remembering…"
              className="min-h-20"
            />
          </div>

          {/* Error/Success messages */}
          {status.type === 'error' && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {status.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={status.type === 'saving'}
          >
            {status.type === 'saving' ? 'Saving…' : 'Save Entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
