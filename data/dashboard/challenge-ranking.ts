import type {
  Challenge,
  Participant,
  ParticipantDetail,
} from '@/models/challenge-ranking';

export const challenges: Challenge[] = [
  { id: 'all', name: 'All Time' },
  { id: 'spring-2024', name: 'Spring Shred 2024' },
  { id: 'summer-2024', name: 'Summer Sweat 2024' },
  { id: 'fall-2024', name: 'Fall Fitness 2024' },
  { id: 'winter-2025', name: 'Winter Warrior 2025' },
];

export const currentUserId = 'user-4';

const baseParticipants: Omit<Participant, 'rank'>[] = [
  {
    id: 'user-1',
    name: 'Sarah Chen',
    wins: 12,
    winRate: 85,
    top25: 92,
    top50: 100,
  },
  {
    id: 'user-2',
    name: 'Mike Rodriguez',
    wins: 10,
    winRate: 78,
    top25: 88,
    top50: 96,
  },
  {
    id: 'user-3',
    name: 'Emma Johnson',
    wins: 9,
    winRate: 72,
    top25: 84,
    top50: 94,
  },
  {
    id: 'user-4',
    name: 'Alex Kim',
    wins: 8,
    winRate: 68,
    top25: 80,
    top50: 92,
  },
  {
    id: 'user-5',
    name: 'Jordan Taylor',
    wins: 7,
    winRate: 62,
    top25: 76,
    top50: 88,
  },
  {
    id: 'user-6',
    name: 'Casey Morgan',
    wins: 6,
    winRate: 58,
    top25: 72,
    top50: 86,
  },
  {
    id: 'user-7',
    name: 'Riley Brooks',
    wins: 5,
    winRate: 52,
    top25: 68,
    top50: 82,
  },
  {
    id: 'user-8',
    name: 'Quinn Davis',
    wins: 4,
    winRate: 48,
    top25: 64,
    top50: 78,
  },
  {
    id: 'user-9',
    name: 'Avery Wilson',
    wins: 3,
    winRate: 42,
    top25: 58,
    top50: 74,
  },
  {
    id: 'user-10',
    name: 'Morgan Lee',
    wins: 2,
    winRate: 36,
    top25: 52,
    top50: 68,
  },
  {
    id: 'user-11',
    name: 'Drew Martinez',
    wins: 2,
    winRate: 32,
    top25: 48,
    top50: 64,
  },
  {
    id: 'user-12',
    name: 'Jamie Parker',
    wins: 1,
    winRate: 28,
    top25: 44,
    top50: 60,
  },
];

function scoreParticipantForChallenge({
  participantId,
  challengeId,
}: {
  participantId: string;
  challengeId: string;
}): number {
  if (challengeId === 'all') {
    return 0;
  }

  const str = `${challengeId}:${participantId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function buildRankedParticipants({
  challengeId,
}: {
  challengeId: string;
}): Participant[] {
  const ranked = [...baseParticipants].sort((a, b) => {
    // default: keep the base ordering stable
    if (challengeId === 'all') {
      return b.wins - a.wins;
    }

    return (
      scoreParticipantForChallenge({ participantId: b.id, challengeId }) -
      scoreParticipantForChallenge({ participantId: a.id, challengeId })
    );
  });

  return ranked.map((p, index) => ({ ...p, rank: index + 1 }));
}

export function getParticipantsByChallenge(challengeId: string): Participant[] {
  return buildRankedParticipants({ challengeId });
}

export const participants: Participant[] = getParticipantsByChallenge('all');

const baseParticipantDetails: Record<
  string,
  Omit<ParticipantDetail, 'rank'> & { id: string }
> = {
  'user-1': {
    ...baseParticipants[0],
    rankingHistory: [
      { month: 'Sep', position: 3 },
      { month: 'Oct', position: 2 },
      { month: 'Nov', position: 2 },
      { month: 'Dec', position: 1 },
      { month: 'Jan', position: 1 },
    ],
    challengeHistory: [
      { rank: 1, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 1, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
      { rank: 2, challengeName: 'Summer Sweat 2024', date: 'Aug 31, 2024' },
      { rank: 3, challengeName: 'Spring Shred 2024', date: 'May 31, 2024' },
    ],
  },
  'user-2': {
    ...baseParticipants[1],
    rankingHistory: [
      { month: 'Sep', position: 4 },
      { month: 'Oct', position: 3 },
      { month: 'Nov', position: 3 },
      { month: 'Dec', position: 2 },
      { month: 'Jan', position: 2 },
    ],
    challengeHistory: [
      { rank: 2, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 3, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
      { rank: 1, challengeName: 'Summer Sweat 2024', date: 'Aug 31, 2024' },
      { rank: 4, challengeName: 'Spring Shred 2024', date: 'May 31, 2024' },
    ],
  },
  'user-3': {
    ...baseParticipants[2],
    rankingHistory: [
      { month: 'Sep', position: 2 },
      { month: 'Oct', position: 4 },
      { month: 'Nov', position: 4 },
      { month: 'Dec', position: 3 },
      { month: 'Jan', position: 3 },
    ],
    challengeHistory: [
      { rank: 3, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 4, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
      { rank: 3, challengeName: 'Summer Sweat 2024', date: 'Aug 31, 2024' },
      { rank: 1, challengeName: 'Spring Shred 2024', date: 'May 31, 2024' },
    ],
  },
  'user-4': {
    ...baseParticipants[3],
    rankingHistory: [
      { month: 'Sep', position: 6 },
      { month: 'Oct', position: 5 },
      { month: 'Nov', position: 5 },
      { month: 'Dec', position: 4 },
      { month: 'Jan', position: 4 },
    ],
    challengeHistory: [
      { rank: 4, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 5, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
      { rank: 4, challengeName: 'Summer Sweat 2024', date: 'Aug 31, 2024' },
      { rank: 6, challengeName: 'Spring Shred 2024', date: 'May 31, 2024' },
    ],
  },
  'user-5': {
    ...baseParticipants[4],
    rankingHistory: [
      { month: 'Sep', position: 5 },
      { month: 'Oct', position: 6 },
      { month: 'Nov', position: 6 },
      { month: 'Dec', position: 5 },
      { month: 'Jan', position: 5 },
    ],
    challengeHistory: [
      { rank: 5, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 6, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
      { rank: 5, challengeName: 'Summer Sweat 2024', date: 'Aug 31, 2024' },
      { rank: 5, challengeName: 'Spring Shred 2024', date: 'May 31, 2024' },
    ],
  },
  'user-6': {
    ...baseParticipants[5],
    rankingHistory: [
      { month: 'Sep', position: 7 },
      { month: 'Oct', position: 7 },
      { month: 'Nov', position: 7 },
      { month: 'Dec', position: 6 },
      { month: 'Jan', position: 6 },
    ],
    challengeHistory: [
      { rank: 6, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 7, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
    ],
  },
  'user-7': {
    ...baseParticipants[6],
    rankingHistory: [
      { month: 'Sep', position: 8 },
      { month: 'Oct', position: 8 },
      { month: 'Nov', position: 8 },
      { month: 'Dec', position: 7 },
      { month: 'Jan', position: 7 },
    ],
    challengeHistory: [
      { rank: 7, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
      { rank: 8, challengeName: 'Fall Fitness 2024', date: 'Nov 30, 2024' },
    ],
  },
  'user-8': {
    ...baseParticipants[7],
    rankingHistory: [
      { month: 'Sep', position: 9 },
      { month: 'Oct', position: 9 },
      { month: 'Nov', position: 9 },
      { month: 'Dec', position: 8 },
      { month: 'Jan', position: 8 },
    ],
    challengeHistory: [
      { rank: 8, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
    ],
  },
  'user-9': {
    ...baseParticipants[8],
    rankingHistory: [
      { month: 'Sep', position: 10 },
      { month: 'Oct', position: 10 },
      { month: 'Nov', position: 10 },
      { month: 'Dec', position: 9 },
      { month: 'Jan', position: 9 },
    ],
    challengeHistory: [
      { rank: 9, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
    ],
  },
  'user-10': {
    ...baseParticipants[9],
    rankingHistory: [
      { month: 'Sep', position: 11 },
      { month: 'Oct', position: 11 },
      { month: 'Nov', position: 11 },
      { month: 'Dec', position: 10 },
      { month: 'Jan', position: 10 },
    ],
    challengeHistory: [
      { rank: 10, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
    ],
  },
  'user-11': {
    ...baseParticipants[10],
    rankingHistory: [
      { month: 'Sep', position: 12 },
      { month: 'Oct', position: 12 },
      { month: 'Nov', position: 12 },
      { month: 'Dec', position: 11 },
      { month: 'Jan', position: 11 },
    ],
    challengeHistory: [
      { rank: 11, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
    ],
  },
  'user-12': {
    ...baseParticipants[11],
    rankingHistory: [
      { month: 'Sep', position: 13 },
      { month: 'Oct', position: 13 },
      { month: 'Nov', position: 13 },
      { month: 'Dec', position: 12 },
      { month: 'Jan', position: 12 },
    ],
    challengeHistory: [
      { rank: 12, challengeName: 'Winter Warrior 2025', date: 'Jan 15, 2025' },
    ],
  },
};

export function getParticipantDetail({
  participantId,
  challengeId,
}: {
  participantId: string;
  challengeId: string;
}): ParticipantDetail | undefined {
  const base = baseParticipantDetails[participantId];
  if (!base) {
    return undefined;
  }

  const ranked = buildRankedParticipants({ challengeId });
  const rankedEntry = ranked.find((p) => p.id === participantId);

  return {
    ...base,
    rank: rankedEntry?.rank ?? 0,
  };
}

export function getTop3Participants(challengeId: string): Participant[] {
  return getParticipantsByChallenge(challengeId).slice(0, 3);
}
