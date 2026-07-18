export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-matcha">You&apos;re offline</h1>
      <p className="text-muted-foreground max-w-sm">
        Your timer and tasks are still available. Changes will sync when you&apos;re back online.
      </p>
    </div>
  );
}
