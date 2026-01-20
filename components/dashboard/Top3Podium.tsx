'use client';

import { CrownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Participant } from '@/models/hams-for-the-maams';

interface Top3PodiumProps {
  participants: Participant[];
  onSelectParticipant?: (participantId: string) => void;
  className?: string;
}

function PodiumSpot({
  participant,
  position,
  onClick,
}: {
  participant: Participant;
  position: 1 | 2 | 3;
  onClick?: () => void;
}) {
  const isFirst = position === 1;
  const avatarSize = isFirst ? 'h-20 w-20' : 'h-14 w-14';
  const nameSize = isFirst ? 'text-base' : 'text-sm';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 transition-transform',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:rounded-2xl',
        isFirst && 'relative -mt-4',
      )}
      aria-label={`View ${participant.name}'s profile, ranked #${position}`}
    >
      {/* Crown for #1 */}
      {isFirst && (
        <CrownIcon className="absolute -top-6 h-6 w-6 text-primary-500" />
      )}

      {/* Avatar with rank badge */}
      <div className="relative">
        <div
          className={cn(
            avatarSize,
            'overflow-hidden rounded-full',
            'bg-gradient-to-br from-muted to-muted/50',
            isFirst && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-background',
          )}
        >
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-lg font-semibold text-primary-700">
              {participant.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Rank badge */}
        <div
          className={cn(
            'absolute -left-1 -top-1',
            'flex h-6 w-6 items-center justify-center rounded-lg',
            'bg-primary-500 text-xs font-bold text-white',
            'shadow-md shadow-primary-500/10',
          )}
        >
          {position}
        </div>
      </div>

      {/* Name */}
      <span
        className={cn(
          nameSize,
          'font-medium text-foreground',
          'max-w-20 truncate text-center',
        )}
      >
        {participant.name.split(' ')[0]}
      </span>

      {/* Wins */}
      <span className="text-xs text-muted-foreground">
        {participant.wins} wins
      </span>
    </button>
  );
}

export function Top3Podium({
  participants,
  onSelectParticipant,
  className,
}: Top3PodiumProps) {
  // Ensure we have exactly 3 participants
  const top3 = participants.slice(0, 3);
  if (top3.length < 3) return null;

  // Reorder: [2nd, 1st, 3rd] for visual layout
  const [first, second, third] = top3;
  const podiumOrder = [second, first, third];

  return (
    <div className={cn('rounded-3xl bg-accent shadow-xl', className)}>
      <div className="flex items-end justify-center gap-6 px-5 py-5">
        {podiumOrder.map((participant, index) => {
          const position = index === 1 ? 1 : index === 0 ? 2 : 3;
          return (
            <PodiumSpot
              key={participant.id}
              participant={participant}
              position={position as 1 | 2 | 3}
              onClick={() => onSelectParticipant?.(participant.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Top3Podium;
