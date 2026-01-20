'use client';

import { SwordsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ParticipantDetail as ParticipantDetailType } from '@/models/hams-for-the-maams';

interface ParticipantDetailProps {
  participant: ParticipantDetailType;
  className?: string;
}

function ProgressBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RankingChart({
  data,
}: {
  data: { month: string; position: number }[];
}) {
  if (data.length === 0) return null;

  // Calculate chart dimensions
  const chartHeight = 120;
  const chartWidth = 280;
  const paddingX = 30;
  const paddingY = 20;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Find min/max positions for scaling (lower position = better rank)
  const positions = data.map((d) => d.position);
  const minPos = Math.min(...positions);
  const maxPos = Math.max(...positions);
  const range = maxPos - minPos || 1;

  // Generate path points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * innerWidth;
    // Invert Y so lower rank numbers appear higher
    const y = paddingY + ((d.position - minPos) / range) * innerHeight;
    return { x, y, ...d };
  });

  // Create smooth path
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">
        Ranking position
      </h3>
      <div className="rounded-2xl bg-muted/50 p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-auto w-full"
        aria-label="Ranking position chart"
      >
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1={paddingX}
            y1={paddingY + ratio * innerHeight}
            x2={chartWidth - paddingX}
            y2={paddingY + ratio * innerHeight}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Line path */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-primary-500"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              className="fill-primary-500"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              className="fill-primary-500/20"
            />
          </g>
        ))}

        {/* Month labels */}
        {points.map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={chartHeight - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {point.month}
          </text>
        ))}
      </svg>
      </div>

      {/* Pagination dots (visual only) */}
      <div className="flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      </div>
    </div>
  );
}

function ChallengeHistory({
  history,
}: {
  history: { rank: number; challengeName: string; date: string }[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">
        Challenge history
      </h3>
      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            key={index}
            className={cn(
              'grid grid-cols-12 items-center gap-3 rounded-xl bg-muted/50 p-3',
              'transition-colors hover:bg-muted/70',
            )}
          >
            {/* Rank badge */}
            <div
              className={cn(
                'col-span-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                'bg-primary-500 text-white shadow-md shadow-primary-500/10',
              )}
            >
              <span className="text-xs font-bold">#{item.rank}</span>
            </div>

            {/* Challenge info */}
            <div className="col-span-7 min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {item.challengeName}
              </div>
            </div>

            {/* Date */}
            <div className="col-span-3 text-right text-xs text-muted-foreground">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ParticipantDetail({
  participant,
  className,
}: ParticipantDetailProps) {
  const totalEvents = 20;
  const top25Count = Math.round((participant.top25 / 100) * totalEvents);
  const top50Count = Math.round((participant.top50 / 100) * totalEvents);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header with drag handle for mobile sheet */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {/* Drag handle (visible on mobile) */}
        <div className="h-1 w-12 rounded-full bg-muted md:hidden" />

        {/* Name */}
        <h2 className="text-xl font-semibold text-foreground">
          {participant.name}
        </h2>
      </div>

      {/* Stats Card */}
      <div className="rounded-3xl bg-card p-5 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Avatar + rank */}
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-muted ring-1 ring-border">
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-xl font-semibold text-primary-700">
                  {participant.name.charAt(0)}
                </div>
              )}
            </div>
            <div
              className={cn(
                'absolute -left-1 -top-1',
                'flex h-6 w-6 items-center justify-center rounded-lg',
                'bg-primary-500 text-xs font-bold text-white',
                'shadow-md shadow-primary-500/10',
              )}
            >
              {participant.rank}
            </div>
          </div>

          {/* Stats center */}
          <div className="min-w-0 flex-1 space-y-3">
            <ProgressBar label="Won" value={participant.wins} maxValue={totalEvents} />
            <ProgressBar label="Top 25%" value={top25Count} maxValue={totalEvents} />
            <ProgressBar label="Top 50%" value={top50Count} maxValue={totalEvents} />
          </div>

          {/* Primary action (square + label underneath) */}
          <div className="flex flex-col items-center gap-2">
            <button
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl',
                'border border-primary-500 bg-transparent text-foreground',
                'transition-colors hover:bg-primary-500/10',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
              )}
              aria-label="Duel"
              type="button"
            >
              <SwordsIcon className="h-5 w-5" />
            </button>
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              DUEL
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Chart */}
      <RankingChart data={participant.rankingHistory} />

      {/* Challenge History */}
      <ChallengeHistory history={participant.challengeHistory} />
    </div>
  );
}

export default ParticipantDetail;
