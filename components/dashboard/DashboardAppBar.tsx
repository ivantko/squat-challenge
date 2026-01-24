'use client';

import { ChevronLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';
import { cn } from '@/lib/utils';

interface DashboardAppBarProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function DashboardAppBar({
  title,
  onBack,
  showBackButton = true,
  rightSlot,
  className,
}: DashboardAppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between',
        className,
      )}
    >
      {/* Back Button */}
      <div className="w-10">
        {showBackButton && (
          <button
            onClick={handleBack}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              'border border-primary-500 bg-transparent',
              'text-primary-500 transition-colors',
              'hover:bg-primary-500/10',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            )}
            aria-label="Go back"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Title */}
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      {/* Theme Switch */}
      <div className="flex items-center justify-end gap-2">
        {rightSlot}
        <ThemeSwitch />
      </div>
    </header>
  );
}

export default DashboardAppBar;
