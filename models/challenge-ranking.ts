export type ChallengeType = 'fitness' | 'finance' | 'gaming';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  rank: number;
  wins: number;
  winRate: number;
  top25: number;
  top50: number;
}

export interface Challenge {
  id: string;
  name: string;
  type?: ChallengeType;
  startsAt?: string;
  endsAt?: string;
}

export interface ChallengeHistoryItem {
  rank: number;
  challengeName: string;
  date: string;
}

export interface RankingDataPoint {
  month: string;
  position: number;
}

export interface ParticipantDetail extends Participant {
  rankingHistory: RankingDataPoint[];
  challengeHistory: ChallengeHistoryItem[];
}

export type DuelScoringType = 'win_loss' | 'score_based';
export type DuelStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface Duel {
  id: string;
  challengeId?: string;
  challengerId: string;
  challengedId: string;
  challengerName?: string;
  challengedName?: string;
  scoringType: DuelScoringType;
  status: DuelStatus;
  winnerId?: string;
  challengerScore?: number;
  challengedScore?: number;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}
