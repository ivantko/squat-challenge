'use client';

import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Challenge } from '@/models/hams-for-the-maams';

interface ChallengeSelectChipProps {
  challenges: Challenge[];
  selectedChallengeId: string;
  onSelectChallenge: (challengeId: string) => void;
  className?: string;
}

export function ChallengeSelectChip({
  challenges,
  selectedChallengeId,
  onSelectChallenge,
  className,
}: ChallengeSelectChipProps) {
  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId);

  return (
    <div className={cn('flex justify-center', className)}>
      <div className="relative">
        <select
          value={selectedChallengeId}
          onChange={(e) => onSelectChallenge(e.target.value)}
          className={cn(
            'h-9 appearance-none rounded-xl px-4 pr-8',
            'bg-muted text-sm font-medium text-foreground',
            'border-none outline-none',
            'cursor-pointer transition-colors',
            'hover:bg-muted/80',
            'focus:ring-2 focus:ring-primary-500/50',
          )}
          aria-label="Select challenge"
        >
          {challenges.map((challenge) => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className={cn(
            'pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2',
            'text-muted-foreground',
          )}
        />
      </div>
    </div>
  );
}

export default ChallengeSelectChip;
