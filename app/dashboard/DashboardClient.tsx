'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DashboardAppBar,
  ChallengeSelectChip,
  Top3Podium,
  LeaderboardTable,
  ParticipantDetail,
  LogEntryCard,
} from '@/components/dashboard';
import type {
  Participant as ParticipantModel,
  ParticipantDetail as ParticipantDetailModel,
} from '@/models/hams-for-the-maams';

type ChallengeDto = { slug: string; name: string };

type LeaderboardRowDto = {
  userId: string;
  displayName: string | null;
  avatarPath: string | null;
  rank: number;
  wins: number;
  winRate: number;
  top25: number;
  top50: number;
};

type ParticipantDetailDto = {
  userId: string;
  name: string;
  avatarPath: string | null;
  rank: number;
  wins: number;
  winRate: number;
  top25: number;
  top50: number;
  rankingHistory: { month: string; position: number }[];
  challengeHistory: { rank: number; challengeName: string; date: string }[];
};

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL
  const selectedChallengeId = searchParams.get('challenge') || 'all';
  const selectedParticipantId = searchParams.get('participant');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<ChallengeDto[]>([]);
  const [participants, setParticipants] = useState<ParticipantModel[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ParticipantDetailModel | null>(null);

  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingParticipant, setIsLoadingParticipant] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadMe() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return;
        const data = (await res.json()) as { userId?: string };
        if (isActive) setCurrentUserId(data.userId ?? null);
      } catch (error) {
        void error;
      }
    }

    void loadMe();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    setIsLoadingChallenges(true);

    async function loadChallenges() {
      try {
        const res = await fetch('/api/challenges');
        if (!res.ok) return;
        const data = (await res.json()) as { challenges: ChallengeDto[] };
        if (isActive) setChallenges(data.challenges || []);
      } catch (error) {
        void error;
      } finally {
        if (isActive) setIsLoadingChallenges(false);
      }
    }

    void loadChallenges();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    setIsLoadingLeaderboard(true);

    async function ensureJoined() {
      try {
        await fetch('/api/challenges/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeSlug: selectedChallengeId }),
        });
      } catch (error) {
        void error;
      }
    }

    async function loadLeaderboard() {
      try {
        await ensureJoined();
        const res = await fetch(
          `/api/leaderboard?challenge=${encodeURIComponent(selectedChallengeId)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { rows: LeaderboardRowDto[] };
        if (!isActive) return;

        setParticipants(
          (data.rows || []).map((r) => ({
            id: r.userId,
            name: r.displayName ?? 'Participant',
            avatar: r.avatarPath ?? undefined,
            rank: r.rank,
            wins: r.wins,
            winRate: r.winRate,
            top25: r.top25,
            top50: r.top50,
          })),
        );
      } catch (error) {
        void error;
      } finally {
        if (isActive) setIsLoadingLeaderboard(false);
      }
    }

    void loadLeaderboard();
    return () => {
      isActive = false;
    };
  }, [selectedChallengeId, refreshCounter]);

  useEffect(() => {
    let isActive = true;

    async function loadParticipant() {
      if (!selectedParticipantId) {
        setSelectedParticipant(null);
        return;
      }

      setIsLoadingParticipant(true);
      try {
        const res = await fetch(
          `/api/participants/${encodeURIComponent(selectedParticipantId)}?challenge=${encodeURIComponent(selectedChallengeId)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as ParticipantDetailDto;
        if (!isActive) return;

        setSelectedParticipant({
          id: data.userId,
          name: data.name,
          avatar: data.avatarPath ?? undefined,
          rank: data.rank,
          wins: data.wins,
          winRate: data.winRate,
          top25: data.top25,
          top50: data.top50,
          rankingHistory: data.rankingHistory,
          challengeHistory: data.challengeHistory,
        });
      } catch (error) {
        void error;
      } finally {
        if (isActive) setIsLoadingParticipant(false);
      }
    }

    void loadParticipant();
    return () => {
      isActive = false;
    };
  }, [selectedParticipantId, selectedChallengeId, refreshCounter]);

  // URL update helpers
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `/dashboard?${queryString}` : '/dashboard', {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handleChallengeSelect = useCallback(
    (challengeId: string) => {
      updateUrlParams({ challenge: challengeId === 'all' ? null : challengeId });
    },
    [updateUrlParams],
  );

  const handleParticipantSelect = useCallback(
    (participantId: string) => {
      updateUrlParams({ participant: participantId });
    },
    [updateUrlParams],
  );

  const handleBack = useCallback(() => {
    if (selectedParticipantId) {
      // Clear participant selection
      updateUrlParams({ participant: null });
    } else {
      router.back();
    }
  }, [selectedParticipantId, updateUrlParams, router]);

  // Determine if we should show detail view on mobile
  const showDetailOnMobile = !!selectedParticipantId;
  const showDetailPane = !!selectedParticipantId;

  const challengeOptions = useMemo(() => {
    if (isLoadingChallenges) {
      return [{ id: 'all', name: 'Loading…' }];
    }

    if (challenges.length === 0) {
      return [{ id: 'all', name: 'All Time' }];
    }

    return challenges.map((c) => ({ id: c.slug, name: c.name }));
  }, [challenges, isLoadingChallenges]);

  return (
    <div className="hftm-theme hftm-dashboard-bg min-h-screen text-foreground transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* App Bar */}
        <DashboardAppBar
          title="Challenge Ranking"
          onBack={handleBack}
          showBackButton={true}
          rightSlot={
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className={cn(
                  'hidden h-10 items-center justify-center rounded-xl px-3 md:flex',
                  'border border-border bg-transparent text-sm font-medium text-foreground',
                  'hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                )}
              >
                Sign out
              </button>
            </form>
          }
        />

        {/* Challenge Select */}
        <ChallengeSelectChip
          challenges={challengeOptions}
          selectedChallengeId={selectedChallengeId}
          onSelectChallenge={handleChallengeSelect}
          className="mb-4"
        />

        {/* Main Content - Responsive Grid */}
        <div className="px-4 pb-6 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Leaderboard Panel */}
            <div
              className={cn(
                showDetailPane ? 'md:col-span-5' : 'md:col-span-12',
                // Hide on mobile when detail is shown
                showDetailOnMobile && 'hidden md:block',
              )}
            >
              <div className="space-y-4">
                {/* Top 3 Podium */}
                {isLoadingLeaderboard ? (
                  <div className="rounded-3xl bg-card p-6 shadow-xl">
                    <div className="text-sm text-muted-foreground">
                      Loading leaderboard…
                    </div>
                  </div>
                ) : (
                  <Top3Podium
                    participants={participants}
                    onSelectParticipant={handleParticipantSelect}
                  />
                )}

                {/* Leaderboard Table */}
                <div className="overflow-hidden rounded-3xl bg-card shadow-xl">
                  <LeaderboardTable
                    participants={participants}
                    currentUserId={currentUserId ?? undefined}
                    selectedParticipantId={selectedParticipantId}
                    onSelectParticipant={handleParticipantSelect}
                    className="max-h-96"
                  />
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div
              className={cn(
                'md:col-span-7',
                // Show on mobile only when participant is selected
                !showDetailOnMobile && 'hidden',
              )}
            >
              {selectedParticipant ? (
                <div className="space-y-4">
                  <ParticipantDetail
                    participant={selectedParticipant}
                    className="rounded-3xl bg-card p-4 shadow-xl md:p-6"
                  />
                  {currentUserId && selectedParticipant.id === currentUserId && (
                    <LogEntryCard
                      challengeSlug={selectedChallengeId}
                      currentUserId={currentUserId}
                      onCreated={() => setRefreshCounter((x) => x + 1)}
                    />
                  )}
                </div>
              ) : isLoadingParticipant && selectedParticipantId ? (
                <div className="rounded-3xl bg-card p-6 shadow-xl">
                  <div className="text-sm text-muted-foreground">
                    Loading participant…
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-96 items-center justify-center rounded-3xl bg-card p-6 shadow-xl">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">👈</div>
                    <p className="text-muted-foreground">
                      Select a participant to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

