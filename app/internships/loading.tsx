import { Container } from "@/components/ui/layout";

/**
 * Skeleton loading state for the internships listing page.
 * Shown while the async database fetch is in progress.
 */
export default function InternshipsLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        {/* Header skeleton */}
        <div className="max-w-3xl space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-muted" />
          <div className="h-5 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Value highlights strip skeleton */}
        <div className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-navy/10 bg-muted/20 p-6 sm:grid-cols-3 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>

        {/* Filter skeleton */}
        <div className="mt-12 h-14 animate-pulse rounded-2xl bg-muted/40" />

        {/* Cards skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-5 w-full animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-4/6 animate-pulse rounded bg-muted" />
              </div>
              <div className="mt-6 flex gap-2 border-t border-navy/10 pt-4">
                <div className="h-9 flex-1 animate-pulse rounded-xl bg-muted" />
                <div className="h-9 flex-1 animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
