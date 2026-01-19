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
