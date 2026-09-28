import { Container } from "@/components/ui/layout";

export default function AboutLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="mx-auto h-5 w-24 animate-pulse rounded-full bg-navy/10" />
          <div className="mx-auto h-12 w-3/4 animate-pulse rounded-2xl bg-navy/10" />
          <div className="mx-auto h-5 w-5/6 animate-pulse rounded-lg bg-navy/10" />
        </div>

        <div className="mt-14 h-72 w-full animate-pulse rounded-3xl bg-muted/40" />

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl border border-navy/10 bg-white p-8" />
          <div className="h-48 animate-pulse rounded-2xl border border-navy/10 bg-white p-8" />
        </div>
      </Container>
    </div>
  );
}
