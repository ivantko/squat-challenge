import Link from 'next/link';
import {
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
  Dumbbell,
  Wallet,
  Gamepad2,
  ArrowRight,
  Zap,
  Target,
  Medal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared/ui/button';

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CategoryBadge({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2',
        'border border-border bg-card shadow-sm',
        'transition-all hover:scale-105 hover:shadow-md',
      )}
    >
      <Icon className={cn('h-5 w-5', color)} />
      <span className="font-medium text-foreground">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 px-4 py-20 md:py-32">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-500">
            <SwordsIcon className="h-4 w-4" />
            Challenge your crew
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Five Buddies.
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Endless Challenges.
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Track challenges across Fitness, Finance, and Gaming. Compete with
            your crew, climb the leaderboard, and prove who&apos;s the ultimate
            champion.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-xl px-8 text-base"
            >
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl px-8 text-base"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>

          {/* Category badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CategoryBadge
              icon={Dumbbell}
              label="Fitness"
              color="text-red-500"
            />
            <CategoryBadge
              icon={Wallet}
              label="Finance"
              color="text-green-500"
            />
            <CategoryBadge
              icon={Gamepad2}
              label="Gaming"
              color="text-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Built for Friendly Competition
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Everything you need to track challenges, settle scores, and crown
              champions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={TrophyIcon}
              title="Leaderboard Rankings"
              description="Real-time rankings show who's on top. Track wins, win rates, and climb the ranks."
            />
            <FeatureCard
              icon={SwordsIcon}
              title="1v1 Duels"
              description="Challenge any buddy to a head-to-head duel. Win/loss or score-based - you choose."
            />
            <FeatureCard
              icon={UsersIcon}
              title="5-Person Crew"
              description="Perfect for your squad. Everyone competes, everyone climbs, everyone has fun."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Updates"
              description="Log entries on the go. Results update immediately across all devices."
            />
            <FeatureCard
              icon={Target}
              title="Multi-Category"
              description="Fitness, Finance, Gaming - track different types of challenges separately."
            />
            <FeatureCard
              icon={Medal}
              title="Historical Tracking"
              description="Log past entries with date picker. Never miss a win, even retroactively."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Get started in minutes. Start competing today.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Create Your Crew',
                description:
                  'Invite your 4 buddies. Everyone signs up and joins the challenge.',
              },
              {
                step: '2',
                title: 'Log Your Wins',
                description:
                  'Completed a challenge? Log it with optional proof. Track your progress.',
              },
              {
                step: '3',
                title: 'Climb the Ranks',
                description:
                  'Check the leaderboard. Challenge rivals to duels. Become the champion.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary-500 px-4 py-20">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-br from-primary-600/50 to-transparent" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Dominate?
          </h2>
          <p className="mb-8 text-lg text-white/80">
            Join FiveGuysLudus and start your competitive journey today.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="gap-2 rounded-xl px-8 text-base"
          >
            <Link href="/dashboard">
              Start Competing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <SwordsIcon className="h-6 w-6 text-primary-500" />
            <span className="text-xl font-bold text-foreground">
              FiveGuysLudus
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Track challenges between 5 buddies across Fitness, Finance, and
            Gaming.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} FiveGuysLudus. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
