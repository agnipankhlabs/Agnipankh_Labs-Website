import { Container } from "@/components/ui/layout";

export default function EventDetailLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-6 w-24 animate-pulse rounded-full bg-navy/10" />
          <div className="h-10 w-4/5 animate-pulse rounded-xl bg-navy/10 sm:h-12" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-muted/40" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-navy/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
