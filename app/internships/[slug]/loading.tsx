import { Container } from "@/components/ui/layout";

export default function InternshipDetailLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-28 animate-pulse rounded-full bg-navy/10" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-navy/10" />
            </div>
            <div className="h-10 w-4/5 animate-pulse rounded-xl bg-navy/10 sm:h-12" />
            <div className="h-5 w-full animate-pulse rounded bg-navy/10" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
            ))}
          </div>

          <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
            <div className="h-7 w-48 animate-pulse rounded bg-navy/10" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-navy/10" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-navy/10" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
