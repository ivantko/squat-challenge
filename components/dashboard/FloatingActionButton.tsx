'use client';

import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
};

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-primary-500 text-white shadow-lg',
        'hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
        'transition-transform hover:scale-105 active:scale-95',
        'md:hidden', // Hide on desktop, show button in AppBar instead
        className,
      )}
      aria-label="Log new entry"
    >
      <PlusIcon className="h-6 w-6" />
    </button>
  );
}
