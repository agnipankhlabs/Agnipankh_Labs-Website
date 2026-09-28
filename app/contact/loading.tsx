import { Container } from "@/components/ui/layout";

export default function ContactLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-5 w-24 animate-pulse rounded-full bg-navy/10" />
          <div className="mx-auto h-10 w-2/3 animate-pulse rounded-xl bg-navy/10 sm:h-12" />
          <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-navy/10" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-8">
            <div className="h-6 w-32 animate-pulse rounded bg-navy/10" />
            <div className="space-y-3 pt-2">
              <div className="h-10 w-full animate-pulse rounded-xl bg-navy/10" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-navy/10" />
              <div className="h-28 w-full animate-pulse rounded-xl bg-navy/10" />
              <div className="h-10 w-32 animate-pulse rounded-xl bg-navy/10" />
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-8">
            <div className="h-6 w-32 animate-pulse rounded bg-navy/10" />
            <div className="space-y-4 pt-4">
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted/40" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted/40" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted/40" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
