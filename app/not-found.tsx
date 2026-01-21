import Link from 'next/link';
import { SwordsIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <SwordsIcon className="h-8 w-8 text-primary-500" />
          <span className="text-2xl font-bold text-foreground">FiveGuysLudus</span>
        </div>

        {/* 404 */}
        <h1 className="mb-4 text-8xl font-bold text-primary-500">404</h1>

        {/* Message */}
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved or deleted.
        </p>

        {/* Action */}
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <HomeIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
