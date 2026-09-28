import { Container } from "@/components/ui/layout";

export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header skeleton */}
      <header className="border-b border-navy/10 bg-white">
        <Container className="py-[2cm]">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <div className="mx-auto h-5 w-32 animate-pulse rounded-full bg-navy/10" />
            <div className="mx-auto h-10 w-2/3 animate-pulse rounded-xl bg-navy/10" />
            <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-navy/10" />
          </div>
        </Container>
      </header>

      {/* Main catalog skeleton */}
      <main className="py-12">
        <Container>
          {/* Filters skeleton */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-10 w-64 animate-pulse rounded-xl bg-navy/10" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-navy/10" />
              ))}
            </div>
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-navy/10" />
                    <div className="h-4 w-16 animate-pulse rounded bg-navy/10" />
                  </div>
                  <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-navy/10" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-navy/10" />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-4">
                  <div className="h-5 w-20 animate-pulse rounded bg-navy/10" />
                  <div className="h-8 w-24 animate-pulse rounded-xl bg-navy/10" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
