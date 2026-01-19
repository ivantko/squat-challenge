import { Suspense } from 'react';
import { AuthLoginClient } from './AuthLoginClient';

export default function AuthLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground">
          <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
            <div className="text-sm text-muted-foreground">Loading…</div>
          </div>
        </div>
      }
    >
      <AuthLoginClient />
    </Suspense>
  );
}

