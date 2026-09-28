import { Container } from "@/components/ui/layout";

export default function CourseDetailLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="h-6 w-32 animate-pulse rounded-full bg-navy/10" />
            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-navy/10 sm:h-12" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-navy/10" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-navy/10" />
            </div>
            <div className="h-48 animate-pulse rounded-2xl bg-navy/10" />
          </div>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-2xl border border-navy/10 bg-white p-6 shadow-xs" />
          </div>
        </div>
      </Container>
    </div>
  );
}
