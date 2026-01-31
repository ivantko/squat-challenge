import { Suspense } from 'react';
import { InviteClient } from './InviteClient';

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground">
          <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      }
    >
      <InviteClient token={token} />
    </Suspense>
  );
}
