import { Container } from "@/components/ui/layout";

export default function VerifyLoading() {
  return (
    <div className="py-[2cm]">
      <Container>
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="mx-auto h-5 w-36 animate-pulse rounded-full bg-navy/10" />
          <div className="mx-auto h-10 w-3/4 animate-pulse rounded-xl bg-navy/10 sm:h-12" />
          <div className="mx-auto h-4 w-4/5 animate-pulse rounded bg-navy/10" />

          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-8 shadow-xs">
            <div className="h-12 w-full animate-pulse rounded-xl bg-navy/10" />
            <div className="mt-4 h-10 w-36 mx-auto animate-pulse rounded-xl bg-navy/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
