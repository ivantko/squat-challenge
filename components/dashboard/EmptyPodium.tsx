'use client';

import { TrophyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared/ui/button';

type EmptyPodiumProps = {
  onLogEntry?: () => void;
  className?: string;
};

function EmptySpot({
  position,
  isFirst,
}: {
  position: number;
  isFirst?: boolean;
}) {
  const size = isFirst ? 'h-20 w-20' : 'h-14 w-14';
  return (
    <div className={cn('flex flex-col items-center gap-2', isFirst && '-mt-4')}>
      <div className="relative">
        <div
          className={cn(
            size,
            'rounded-full border-2 border-dashed border-muted-foreground/30',
            'bg-muted/20',
          )}
        />
        <div
          className={cn(
            'absolute -left-1 -top-1',
            'flex h-6 w-6 items-center justify-center rounded-lg',
            'bg-muted-foreground/30 text-xs font-bold text-muted-foreground',
          )}
        >
          {position}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">---</span>
    </div>
  );
}

export function EmptyPodium({ onLogEntry, className }: EmptyPodiumProps) {
  return (
    <div className={cn('rounded-3xl bg-accent p-6 shadow-xl', className)}>
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        {/* Placeholder podium spots */}
        <div className="flex items-end justify-center gap-6">
          <EmptySpot position={2} />
          <EmptySpot position={1} isFirst />
          <EmptySpot position={3} />
        </div>

        <TrophyIcon className="h-8 w-8 text-muted-foreground/50" />
        <h3 className="text-sm font-medium text-foreground">
          Waiting for competitors...
        </h3>
        <p className="text-xs text-muted-foreground">
          Log your first entry to claim the #1 spot!
        </p>

        {onLogEntry && (
          <Button onClick={onLogEntry} variant="primary" size="sm">
            Log Your First Entry
          </Button>
        )}
      </div>
    </div>
  );
}
