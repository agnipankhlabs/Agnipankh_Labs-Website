import { Container } from "@/components/ui/layout";

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-navy/90 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <div className="mx-auto h-7 w-40 animate-pulse rounded-full bg-white/20" />
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded-xl bg-white/20" />
            <div className="mx-auto h-5 w-2/3 animate-pulse rounded-lg bg-white/15" />
          </div>
        </Container>
      </div>

      {/* Content skeleton */}
      <div className="py-[2cm]">
        <Container className="space-y-10">
          <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-3"
              >
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-full animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-9 animate-pulse rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}
