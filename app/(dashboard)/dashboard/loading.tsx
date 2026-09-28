import { Container } from "@/components/ui/layout";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <Container>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-44 animate-pulse rounded-lg bg-navy/10" />
              <div className="h-4 w-60 animate-pulse rounded bg-navy/10" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded-xl bg-navy/10" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-navy/10 bg-white p-6"
              />
            ))}
          </div>

          <div className="h-80 animate-pulse rounded-2xl border border-navy/10 bg-white p-6" />
        </div>
      </Container>
    </div>
  );
}
