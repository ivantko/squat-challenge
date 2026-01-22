'use client';

import { UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Participant } from '@/models/challenge-ranking';

interface LeaderboardTableProps {
  participants: Participant[];
  currentUserId?: string;
  selectedParticipantId?: string | null;
  onSelectParticipant: (participantId: string) => void;
  className?: string;
}

export function LeaderboardTable({
  participants,
  currentUserId,
  selectedParticipantId,
  onSelectParticipant,
  className,
}: LeaderboardTableProps) {
  // Skip top 3 as they're shown in the podium
  const tableParticipants = participants.slice(3);

  // Empty state when no participants at all
  if (participants.length === 0) {
    return (
      <div className={cn('flex flex-col', className)}>
        {/* Header */}
        <div
          className={cn(
            'grid grid-cols-12 gap-2 px-4 py-3',
            'text-xs font-medium text-muted-foreground',
            'border-b border-border/50',
          )}
        >
          <div className="col-span-5">Participant</div>
          <div className="col-span-2 text-right">Win(%)</div>
          <div className="col-span-3 text-right">Top 25%</div>
          <div className="col-span-2 text-right">Wins</div>
        </div>

        {/* Empty state following DuelList pattern */}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UsersIcon className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 text-sm font-medium text-foreground">
            No rankings yet
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Log your first entry to appear on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div
        className={cn(
          'grid grid-cols-12 gap-2 px-4 py-3',
          'text-xs font-medium text-muted-foreground',
          'border-b border-border/50',
        )}
      >
        <div className="col-span-5">Participant</div>
        <div className="col-span-2 text-right">Win(%)</div>
        <div className="col-span-3 text-right">Top 25%</div>
        <div className="col-span-2 text-right">Wins</div>
      </div>

      {/* Scrollable rows */}
      <div className="flex-1 overflow-y-auto">
        {tableParticipants.map((participant) => {
          const isCurrentUser = participant.id === currentUserId;
          const isSelected = participant.id === selectedParticipantId;

          return (
            <button
              key={participant.id}
              onClick={() => onSelectParticipant(participant.id)}
              className={cn(
                'grid w-full grid-cols-12 gap-2 px-4 py-3',
                'text-sm transition-colors',
                'hover:bg-muted/50',
                'focus:outline-none focus:bg-muted/70',
                isSelected && 'bg-muted/60',
                isCurrentUser && 'border-l-2 border-l-primary-500 bg-muted/20',
              )}
              aria-label={`View ${participant.name}'s profile`}
              aria-selected={isSelected}
            >
              {/* Participant info */}
              <div className="col-span-5 flex items-center gap-3">
                {/* Rank */}
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white',
                    'bg-primary-500 shadow-md shadow-primary-500/10',
                  )}
                >
                  {participant.rank}
                </span>

                {/* Avatar */}
                <div className="h-8 w-8 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-xs font-semibold text-primary-700">
                      {participant.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <span
                  className={cn(
                    'truncate font-medium text-foreground',
                    isCurrentUser && 'text-primary-500',
                  )}
                >
                  {participant.name}
                </span>
              </div>

              {/* Win rate */}
              <div className="col-span-2 flex items-center justify-end">
                <span className="text-foreground">{participant.winRate}%</span>
              </div>

              {/* Top 25% */}
              <div className="col-span-3 flex items-center justify-end">
                <span className="text-foreground">{participant.top25}%</span>
              </div>

              {/* Wins */}
              <div className="col-span-2 flex items-center justify-end">
                <span className="font-medium text-foreground">
                  {participant.wins}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LeaderboardTable;
