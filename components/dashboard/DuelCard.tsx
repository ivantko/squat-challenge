'use client';

import { useState } from 'react';
import { SwordsIcon, CheckIcon, XIcon, TrophyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared/ui/button';
import type { Duel, DuelStatus } from '@/models/challenge-ranking';

type DuelCardProps = {
  duel: Duel;
  currentUserId: string;
  onStatusChange?: () => void;
};

const statusColors: Record<DuelStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  accepted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  declined: 'bg-red-500/10 text-red-600 dark:text-red-400',
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  cancelled: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const statusLabels: Record<DuelStatus, string> = {
  pending: 'Pending',
  accepted: 'In Progress',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function DuelCard({ duel, currentUserId, onStatusChange }: DuelCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const isChallenger = duel.challengerId === currentUserId;
  const isChallenged = duel.challengedId === currentUserId;
  const opponentName = isChallenger ? duel.challengedName : duel.challengerName;

  const handleAction = async (action: 'accept' | 'decline' | 'cancel') => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/duels/${duel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        onStatusChange?.();
      }
    } catch {
      // Ignore error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async (winnerId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/duels/${duel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          winnerId,
        }),
      });

      if (res.ok) {
        onStatusChange?.();
      }
    } catch {
      // Ignore error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left side - Icon and info */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
            <SwordsIcon className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {isChallenger ? 'You challenged' : 'Challenged by'}{' '}
              <span className="text-primary-500">{opponentName || 'Unknown'}</span>
            </div>
            {duel.notes && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {duel.notes}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  statusColors[duel.status],
                )}
              >
                {statusLabels[duel.status]}
              </span>
              <span className="text-xs text-muted-foreground">
                {duel.scoringType === 'win_loss' ? 'Win/Loss' : 'Score-Based'}
              </span>
            </div>
          </div>
        </div>

        {/* Winner badge if completed */}
        {duel.status === 'completed' && duel.winnerId && (
          <div className="flex items-center gap-1 rounded-full bg-primary-500/10 px-2 py-1">
            <TrophyIcon className="h-3 w-3 text-primary-500" />
            <span className="text-xs font-medium text-primary-500">
              {duel.winnerId === currentUserId ? 'You won!' : 'You lost'}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {duel.status === 'pending' && isChallenged && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAction('accept')}
            disabled={isUpdating}
            className="flex-1"
          >
            <CheckIcon className="mr-1 h-4 w-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('decline')}
            disabled={isUpdating}
            className="flex-1"
          >
            <XIcon className="mr-1 h-4 w-4" />
            Decline
          </Button>
        </div>
      )}

      {duel.status === 'pending' && isChallenger && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('cancel')}
            disabled={isUpdating}
            className="w-full"
          >
            Cancel Challenge
          </Button>
        </div>
      )}

      {duel.status === 'accepted' && duel.scoringType === 'win_loss' && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">Who won?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleComplete(currentUserId)}
              disabled={isUpdating}
              className="flex-1"
            >
              I Won
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleComplete(isChallenger ? duel.challengedId : duel.challengerId)
              }
              disabled={isUpdating}
              className="flex-1"
            >
              They Won
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
