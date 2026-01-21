'use client';

import { useCallback, useEffect, useState } from 'react';
import { SwordsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DuelCard } from './DuelCard';
import type { Duel } from '@/models/challenge-ranking';

type DuelListProps = {
  currentUserId: string;
  className?: string;
  refreshTrigger?: number;
};

export function DuelList({ currentUserId, className, refreshTrigger }: DuelListProps) {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDuels = useCallback(async () => {
    try {
      const res = await fetch('/api/duels');
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { duels: Duel[] };
      setDuels(data.duels || []);
    } catch {
      // Ignore error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDuels();
  }, [fetchDuels, refreshTrigger]);

  if (isLoading) {
    return (
      <div className={cn('rounded-3xl bg-card p-5 shadow-xl', className)}>
        <div className="text-sm text-muted-foreground">Loading duels...</div>
      </div>
    );
  }

  if (duels.length === 0) {
    return (
      <div className={cn('rounded-3xl bg-card p-5 shadow-xl', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <SwordsIcon className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 text-sm font-medium text-foreground">No duels yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Challenge a participant to your first duel!
          </p>
        </div>
      </div>
    );
  }

  // Separate active and completed duels
  const activeDuels = duels.filter(
    (d) => d.status === 'pending' || d.status === 'accepted',
  );
  const completedDuels = duels.filter(
    (d) => d.status === 'completed' || d.status === 'declined' || d.status === 'cancelled',
  );

  return (
    <div className={cn('rounded-3xl bg-card p-5 shadow-xl', className)}>
      <h3 className="mb-4 text-base font-semibold text-foreground">Your Duels</h3>

      {activeDuels.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Active
          </h4>
          {activeDuels.map((duel) => (
            <DuelCard
              key={duel.id}
              duel={duel}
              currentUserId={currentUserId}
              onStatusChange={fetchDuels}
            />
          ))}
        </div>
      )}

      {completedDuels.length > 0 && (
        <div className={cn('space-y-3', activeDuels.length > 0 && 'mt-6')}>
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            History
          </h4>
          {completedDuels.slice(0, 5).map((duel) => (
            <DuelCard
              key={duel.id}
              duel={duel}
              currentUserId={currentUserId}
              onStatusChange={fetchDuels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
