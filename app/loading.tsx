import { Container } from "@/components/ui/layout";

/**
 * Universal root loading state.
 * Renders instantaneously on any route transition before route-specific or streamed data arrives.
 */
export default function RootLoading() {
  return (
    <div className="py-[1.5cm] animate-fade-in" style={{ animationDuration: "150ms" }}>
      <Container>
        {/* Header skeleton */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-5 w-32 animate-pulse rounded-full bg-navy/10" />
          <div className="mx-auto h-10 w-3/4 animate-pulse rounded-2xl bg-navy/10 sm:h-12" />
          <div className="mx-auto h-4 w-5/6 animate-pulse rounded-lg bg-navy/10" />
        </div>

        {/* Content grid skeleton */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs"
            >
              <div className="h-6 w-1/3 animate-pulse rounded-lg bg-navy/10" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-navy/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-navy/10" />
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-4">
                <div className="h-4 w-20 animate-pulse rounded bg-navy/10" />
                <div className="h-8 w-24 animate-pulse rounded-xl bg-navy/10" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
