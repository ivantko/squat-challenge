'use client';

import { useState } from 'react';
import { SwordsIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { cn } from '@/lib/utils';
import type { DuelScoringType } from '@/models/challenge-ranking';

type DuelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opponentId: string;
  opponentName: string;
  challengeId?: string;
  onDuelCreated?: () => void;
};

export function DuelDialog({
  open,
  onOpenChange,
  opponentId,
  opponentName,
  challengeId,
  onDuelCreated,
}: DuelDialogProps) {
  const [scoringType, setScoringType] = useState<DuelScoringType>('win_loss');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengedId: opponentId,
          challengeId: challengeId !== 'all' ? challengeId : undefined,
          scoringType,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMessage(data.error || 'Failed to create duel');
        setStatus('error');
        return;
      }

      setStatus('success');
      setNotes('');
      setScoringType('win_loss');
      onDuelCreated?.();

      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
        setStatus('idle');
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SwordsIcon className="h-5 w-5 text-primary-500" />
            Challenge to Duel
          </DialogTitle>
          <DialogDescription>
            Challenge <span className="font-medium text-foreground">{opponentName}</span> to a 1v1 duel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Scoring Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Scoring Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScoringType('win_loss')}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  scoringType === 'win_loss'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-border hover:bg-muted/50',
                )}
              >
                <div className="text-sm font-medium">Win/Loss</div>
                <div className="text-xs text-muted-foreground">
                  Simple winner takes all
                </div>
              </button>
              <button
                type="button"
                onClick={() => setScoringType('score_based')}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors',
                  scoringType === 'score_based'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-border hover:bg-muted/50',
                )}
              >
                <div className="text-sm font-medium">Score-Based</div>
                <div className="text-xs text-muted-foreground">
                  Compare points/scores
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's the challenge about?"
              className="min-h-20 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          {status === 'error' && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Duel challenge sent!
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={status === 'submitting'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={status === 'submitting' || status === 'success'}
          >
            {status === 'submitting' ? 'Sending...' : 'Send Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
