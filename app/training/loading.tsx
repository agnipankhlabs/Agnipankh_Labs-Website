import { Container } from "@/components/ui/layout";

export default function TrainingLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-5 w-32 animate-pulse rounded-full bg-navy/10" />
          <div className="mx-auto h-10 w-2/3 animate-pulse rounded-xl bg-navy/10 sm:h-12" />
          <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-navy/10" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs"
            >
              <div className="h-6 w-24 animate-pulse rounded bg-navy/10" />
              <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-navy/10" />
              <div className="mt-2 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-navy/10" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
