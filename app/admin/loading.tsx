export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top bar skeleton */}
      <div className="h-14 border-b border-navy/10 bg-white" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-navy/10" />
            <div className="h-4 w-72 animate-pulse rounded bg-navy/10" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-navy/10" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-navy/10 bg-white p-5"
            />
          ))}
        </div>

        {/* Big cards skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl border border-navy/10 bg-white p-6" />
          <div className="h-64 animate-pulse rounded-2xl border border-navy/10 bg-white p-6" />
        </div>
      </div>
    </div>
  );
}
