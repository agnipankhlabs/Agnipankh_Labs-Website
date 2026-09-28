import { Container } from "@/components/ui/layout";

export default function BlogPostLoading() {
  return (
    <article className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-6 w-28 animate-pulse rounded-full bg-navy/10" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-navy/10" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-navy/10" />
            <div className="space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-navy/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-navy/10" />
            </div>
          </div>
          <div className="h-64 w-full animate-pulse rounded-2xl bg-muted/40 sm:h-80" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-navy/10" />
          </div>
        </div>
      </Container>
    </article>
  );
}
