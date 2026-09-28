import type { Metadata } from "next";
import { Suspense } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Globe,
  Video,
  Users,
  ChevronRight,
  Search,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/ui/layout";
import { getPublicEvents, getPublicEventKinds, getUpcomingEvents } from "@/lib/public-events";
import { Button } from "@/components/ui/button";
import { EventKind } from "@/lib/generated/prisma/client";
import { PublicEventFilters } from "@/components/events/event-filters";
import { EventNewsletter } from "@/components/events/event-newsletter";

export const metadata: Metadata = {
  title: "Events | Agnipankh Labs",
  description: "Join our webinars, bootcamps, hackathons, and masterclasses. Learn from industry experts and build your skills.",
  openGraph: {
    title: "Events | Agnipankh Labs",
    description: "Join our webinars, bootcamps, hackathons, and masterclasses.",
    type: "website",
  },
}

export async function generateStaticParams() {
  const kinds = await getPublicEventKinds();
  return kinds.map((kind) => ({ kind }));
}

interface PageProps {
  searchParams: Promise<{
    kind?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeKind = params.kind ?? "ALL";
  const searchQuery = params.q ?? "";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 9;

  const [kinds, upcomingEvents, { events, total }] = await Promise.all([
    getPublicEventKinds(),
    getUpcomingEvents(3),
    getPublicEvents({
      kind: activeKind === "ALL" ? undefined : (activeKind as EventKind),
      search: searchQuery,
      page,
      pageSize,
    }),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-navy/95 via-navy to-royal/90 py-[2cm]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />
        <Container>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white mb-6">
              <Calendar className="h-3.5 w-3.5" />
              <span>Events & Workshops</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Upcoming Events & Workshops
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Join live sessions, hands-on workshops, and competitive challenges. Learn from industry experts and connect with peers.
            </p>
          </div>
        </Container>
      </Section>

      {/* Main Content */}
      <Section className="py-[2cm]">
        <Container className="space-y-10">
          {/* Search & Filter Bar */}
          <Suspense fallback={<div className="h-16 rounded-2xl bg-muted/40 animate-pulse" />}>
            <PublicEventFilters
              activeKind={activeKind}
              activeSearch={searchQuery}
              availableKinds={kinds}
            />
          </Suspense>

          {/* Events Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {events.length === 0 ? (
              <div className="lg:col-span-3 rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-xs">
                <Calendar className="mx-auto h-12 w-12 text-navy/30" />
                <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Events Found</h3>
                <p className="mt-2 text-sm text-body">
                  {searchQuery || activeKind !== "ALL"
                    ? "Try adjusting your filters or search terms."
                    : "No upcoming events at the moment. Check back soon!"}
                </p>
                {(searchQuery || activeKind !== "ALL") && (
                  <div className="mt-4">
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors"
                    >
                      Clear Filters
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              events.map((event) => (
                <article
                  key={event.id}
                  className="group relative flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white overflow-hidden shadow-xs hover:border-brand-ink/20 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {event.coverImageUrl && (
                      <img
                        src={event.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-navy">
                        {event.kind.replace(/_/g, " ")}
                      </span>
                      {event.isOnline && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-medium text-white">
                          <Globe className="h-2.5 w-2.5" />
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-navy/60">
                      <time dateTime={event.startsAt.toISOString()}>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.startsAt), "MMM d, yyyy")}
                        </span>
                      </time>
                      {event.endsAt && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.startsAt), "HH:mm")} - {format(new Date(event.endsAt), "HH:mm")}
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${event.slug}`} className="group">
                      <h2 className="font-heading text-lg font-bold text-navy group-hover:text-brand-ink transition-colors line-clamp-2">
                        {event.title}
                      </h2>
                    </Link>
                    {event.description && (
                      <p className="text-sm text-body line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-navy/5">
                      <div className="flex items-center gap-2 text-xs text-navy/60">
                        {event.isOnline ? (
                          <span className="inline-flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location || "On-site"}
                          </span>
                        )}
                        {event.capacity && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.registrationCount}/{event.capacity}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover transition-colors"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/events?${new URLSearchParams({
                    ...(activeKind !== "ALL" && { kind: activeKind }),
                    ...(searchQuery && { q: searchQuery }),
                    page: String(page - 1),
                  }).toString()}`}
                  className="rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-xl border border-navy/10 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-navy/40 cursor-not-allowed">
                  Previous
                </span>
              )}
              <span className="flex items-center px-4 text-sm text-navy/60">
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              {page * pageSize < total ? (
                <Link
                  href={`/events?${new URLSearchParams({
                    ...(activeKind !== "ALL" && { kind: activeKind }),
                    ...(searchQuery && { q: searchQuery }),
                    page: String(page + 1),
                  }).toString()}`}
                  className="rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-xl border border-navy/10 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-navy/40 cursor-not-allowed">
                  Next
                </span>
              )}
            </div>
          )}

          {/* Upcoming Events Sidebar (for mobile/desktop) */}
          {upcomingEvents.length > 0 && (
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs">
                <h3 className="font-heading text-lg font-bold text-navy mb-4">Upcoming Highlights</h3>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="flex gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors group"
                    >
                      {event.coverImageUrl && (
                        <img
                          src={event.coverImageUrl}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-navy group-hover:text-brand-ink transition-colors line-clamp-2">
                          {event.title}
                        </p>
                        <time className="text-[11px] text-navy/50">
                          {format(new Date(event.startsAt), "MMM d, yyyy")}{" "}
                          {event.isOnline ? <span className="ml-1 inline-flex items-center gap-1"><Globe className="h-2.5 w-2.5" /> Online</span> : <span className="ml-1 inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {event.location}</span>}
                        </time>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <EventNewsletter />
        </Container>
      </Section>
    </div>
  );
}