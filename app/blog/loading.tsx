import { Container } from "@/components/ui/layout";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-navy/90 py-[2cm]">
        <Container>
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <div className="mx-auto h-7 w-36 animate-pulse rounded-full bg-white/20" />
            <div className="mx-auto h-12 w-4/5 animate-pulse rounded-xl bg-white/20" />
            <div className="mx-auto h-5 w-3/5 animate-pulse rounded-lg bg-white/15" />
          </div>
        </Container>
      </div>

      {/* Content skeleton */}
      <div className="py-[2cm]">
        <Container className="space-y-10">
          <div className="h-16 animate-pulse rounded-2xl bg-muted/40" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Posts list skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-6 w-full animate-pulse rounded bg-muted" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
