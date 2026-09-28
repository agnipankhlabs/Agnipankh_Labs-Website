import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Video,
  Users,
  Share2,
  ChevronLeft,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { getPublicEventBySlug, getPublicEventKinds, getUpcomingEvents, getPublicEvents } from "@/lib/public-events";
import { Button } from "@/components/ui/button";
import { EventRegistrationForm } from "@/components/events/event-registration-form";
import { CopyButton } from "@/components/ui/copy-button";
import { SITE } from "@/content/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found | Agnipankh Labs",
    };
  }

  const title = event.title;
  const description = event.description ?? `Join "${event.title}" on ${format(new Date(event.startsAt), "MMMM d, yyyy")}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: event.createdAt.toISOString(),
      images: event.coverImageUrl ? [{ url: event.coverImageUrl }] : [],
    },
    twitter: {
      card: event.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: event.coverImageUrl ? [event.coverImageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  try {
    const kinds = await getPublicEventKinds();
    const events = [];
    for (const kind of kinds) {
      const { events: kindEvents } = await getPublicEvents({ kind, pageSize: 50 });
      events.push(...kindEvents);
    }
    return events.map((event) => ({ slug: event.slug }));
  } catch {
    return [];
  }
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const [kinds, upcomingEvents] = await Promise.all([
    getPublicEventKinds(),
    getUpcomingEvents(4),
  ]);

  const isUpcoming = new Date(event.startsAt) > new Date();
  const isAtCapacity = event.capacity && event.registrationCount >= event.capacity;
  const canRegister = isUpcoming && !isAtCapacity;

  return (
    <article className="min-h-screen bg-white">
      {/* Breadcrumb & Header */}
      <Section className="pt-8 pb-6 border-b border-navy/10">
        <Container>
          <nav className="flex items-center gap-2 text-xs text-navy/60 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="flex items-center gap-1.5 hover:text-brand-ink transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <span>/</span>
            <Link href="/events" className="hover:text-brand-ink transition-colors">
              Events
            </Link>
            <span>/</span>
            <span className="text-navy/40 truncate max-w-[200px]">{event.title}</span>
          </nav>

          <header className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink/10 px-3 py-1 text-sm font-medium text-brand-ink">
              <Calendar className="h-3.5 w-3.5" />
              {event.kind.replace(/_/g, " ")}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
              {event.title}
            </h1>
            {event.description && (
              <p className="text-lg text-body max-w-2xl mx-auto">{event.description}</p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-navy/60 pt-4 border-t border-navy/10">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(event.startsAt), "EEEE, MMMM d, yyyy")}
                  {event.endsAt && ` – ${format(new Date(event.endsAt), "MMMM d, yyyy")}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(event.startsAt), "HH:mm")}
                  {event.endsAt && ` – ${format(new Date(event.endsAt), "HH:mm")}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {event.isOnline ? (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Online Event</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>{event.location || "On-site"}</span>
                  </>
                )}
              </div>
            </div>
          </header>
        </Container>
      </Section>

      {/* Cover Image */}
      {event.coverImageUrl && (
        <Section className="-mt-6 px-4">
          <Container>
            <div className="relative aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl">
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Main Content */}
      <Section className="pt-8 pb-16">
        <Container className="max-w-3xl space-y-10">
          {/* Registration CTA */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs sticky top-24">
            <h3 className="font-heading text-lg font-bold text-navy mb-4">Register for this Event</h3>

            {event.isPublished ? (
              <>
                {!isUpcoming ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-center">
                    <XCircle className="mx-auto h-8 w-8 text-amber-600" />
                    <p className="mt-2 font-medium text-amber-900">Event has ended</p>
                    <p className="text-sm text-amber-700 mt-1">This event took place on {format(new Date(event.startsAt), "MMMM d, yyyy")}.</p>
                  </div>
                ) : isAtCapacity ? (
                  <div className="rounded-xl bg-red-50 p-4 text-center">
                    <XCircle className="mx-auto h-8 w-8 text-red-600" />
                    <p className="mt-2 font-medium text-red-900">Event is Full</p>
                    <p className="text-sm text-red-700 mt-1">All {event.capacity} spots have been filled.</p>
                  </div>
                ) : (
                  <EventRegistrationForm event={event} />
                )}
              </>
            ) : (
              <div className="rounded-xl bg-navy/5 p-4 text-center">
                <Calendar className="mx-auto h-8 w-8 text-navy/50" />
                <p className="mt-2 font-medium text-navy/70">Event not yet published</p>
                <p className="text-sm text-navy/50 mt-1">Registrations will open once the event is published.</p>
              </div>
            )}

            {/* Event Stats */}
            <div className="mt-8 pt-6 border-t border-navy/10 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-heading text-2xl font-bold text-navy">{event.registrationCount}</p>
                <p className="text-xs text-navy/50">Registrations</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-navy">{event.capacity ?? "Unlimited"}</p>
                <p className="text-xs text-navy/50">Capacity</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-8">
            {/* What to Expect */}
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                What to Expect
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-body">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Live interactive session with industry experts</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-body">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Q&A session with speakers</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-body">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access to recording (if available)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-body">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Digital certificate of participation</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-body">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Networking with fellow attendees</span>
                </li>
              </ul>
            </div>

            {/* Speakers/Organizers placeholder */}
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs">
              <h3 className="font-heading text-lg font-bold text-navy mb-4">Organized by</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-ink/10 text-brand-ink">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-navy">Agnipankh Labs</h4>
                  <p className="text-sm text-body mt-1">Innovation & Skill Development Platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs">
            <h4 className="font-heading font-bold text-navy mb-4">Share this event</h4>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(`${SITE.url}/events/${event.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.24-3.333 3.333-8.502-9.24-7.227 8.26h-3.308l7.227-8.26-8.502-9.24 3.333-3.333 8.502 9.24 7.227-8.26z" />
                </svg>
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE.url}/events/${event.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <CopyButton
                textToCopy={`${SITE.url}/events/${event.slug}`}
                copyCurrentUrl
                showText
                className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Back to Events */}
          <div className="pt-8 border-t border-navy/10">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:text-brand-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Events</span>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Related Events */}
      {upcomingEvents.filter((e) => e.id !== event.id).length > 0 && (
        <Section className="py-12 bg-muted/20">
          <Container>
            <h3 className="font-heading text-2xl font-bold text-navy mb-8 text-center">Other Upcoming Events</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents
                .filter((e) => e.id !== event.id)
                .slice(0, 3)
                .map((relatedEvent) => (
                  <Link
                    key={relatedEvent.id}
                    href={`/events/${relatedEvent.slug}`}
                    className="group rounded-2xl border border-navy/10 bg-white p-5 shadow-xs hover:border-brand-ink/20 hover:shadow-md transition-all"
                  >
                    {relatedEvent.coverImageUrl && (
                      <img
                        src={relatedEvent.coverImageUrl}
                        alt=""
                        className="mb-3 rounded-xl aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-xs font-medium text-navy w-fit">
                        {relatedEvent.kind.replace(/_/g, " ")}
                      </span>
                      <h4 className="font-heading text-base font-bold text-navy group-hover:text-brand-ink transition-colors line-clamp-2">
                        {relatedEvent.title}
                      </h4>
                      <time className="text-xs text-navy/50">
                        {format(new Date(relatedEvent.startsAt), "MMM d, yyyy")}
                      </time>
                    </div>
                  </Link>
                ))}
            </div>
          </Container>
        </Section>
      )}
    </article>
  );
}