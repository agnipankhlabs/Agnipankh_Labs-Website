import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Sparkles,
  Eye,
  Users,
  Globe,
  Video,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { createEventAction } from "@/app/actions/admin-events";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Event — Admin | Agnipankh Labs",
  description: "Create a new event with registration management.",
};

export default async function NewEventPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/events/new");
  }

  const userRoles =
    (session.user as unknown as { roles?: string[] }).roles ?? [];
  const isAdmin =
    userRoles.includes("admin") ||
    userRoles.includes("super_admin") ||
    userRoles.includes("trainer");

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-md">
        <Container>
          <div className="flex h-14 items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin Console</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <Link
                href="/admin/events"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Events</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">Create Event</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <Sparkles className="h-3.5 w-3.5 text-brand-ink" />
                <span>Event Editor</span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1 text-xs font-medium text-navy/70 hover:bg-muted/40 hover:text-navy transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="pt-8 sm:pt-10">
        <Container className="space-y-6">
          <div className="max-w-5xl mx-auto space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Event Editor</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Create New Event
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Set up a new event with registration tracking and capacity management.
            </p>
          </div>

          <EventForm />
        </Container>
      </main>
    </div>
  );
}

function EventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState("WEBINAR");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [capacity, setCapacity] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("kind", kind);
    if (description) formData.set("description", description);
    formData.set("startsAt", startsAt);
    if (endsAt) formData.set("endsAt", endsAt);
    if (location) formData.set("location", location);
    formData.set("isOnline", isOnline ? "on" : "");
    if (capacity) formData.set("capacity", capacity);
    if (coverImageUrl) formData.set("coverImageUrl", coverImageUrl);
    if (isPublished) formData.set("isPublished", "on");

    startTransition(async () => {
      const res = await createEventAction(null, formData);
      if (res.success && res.eventId) {
        router.push(`/admin/events/${res.eventId}/edit`);
      } else {
        if (res.fieldErrors) setFormErrors(res.fieldErrors);
        setGeneralError(res.message ?? "Failed to create event.");
      }
    });
  }

  function generateSlug() {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
    setSlug(generated);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Events</span>
        </Link>

        <Link
          href="/events"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors shadow-2xs"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Live Events</span>
        </Link>
      </div>

      {/* Success/Error */}
      {generalError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-900 flex items-center gap-2 shadow-2xs"
        >
          <svg className="h-4 w-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">Basic Information</h2>
            <p className="text-xs text-body mt-0.5">Required fields marked with *</p>
          </div>

          <div className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-semibold text-navy">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug || slug === slug.replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "")) {
                      setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120));
                    }
                  }}
                  placeholder="e.g. React Performance Workshop"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.title ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-red-600">{formErrors.title[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="block text-xs font-semibold text-navy">
                  URL Slug <span className="text-red-600">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. react-performance-workshop"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.slug ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.slug && (
                  <p className="text-[11px] text-red-600">{formErrors.slug[0]}</p>
                )}
                <p className="text-[11px] text-navy/50">Auto-generated from title. Lowercase, numbers, hyphens only.</p>
              </div>
            </div>

            {/* Kind */}
            <div className="space-y-1.5">
              <label htmlFor="kind" className="block text-xs font-semibold text-navy">
                Event Type <span className="text-red-600">*</span>
              </label>
              <select
                id="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
              >
                <option value="WEBINAR">Webinar</option>
                <option value="BOOTCAMP">Bootcamp</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="INNOVATION_CHALLENGE">Innovation Challenge</option>
                <option value="COMPETITION">Competition</option>
                <option value="MASTERCLASS">Masterclass</option>
              </select>
              <p className="text-[11px] text-navy/50">Select the type of event.</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-semibold text-navy">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description, agenda, what attendees will learn..."
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              <p className="text-[11px] text-navy/50">Optional. Shown on event cards and detail page.</p>
            </div>
          </div>
        </div>

        {/* Date, Time & Location */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">Date, Time & Location</h2>
            <p className="text-xs text-body mt-0.5">Required fields marked with *</p>
          </div>

          <div className="space-y-4">
            {/* Start Date/Time */}
            <div className="space-y-1.5">
              <label htmlFor="startsAt" className="block text-xs font-semibold text-navy">
                Start Date & Time <span className="text-red-600">*</span>
              </label>
              <input
                id="startsAt"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                  formErrors.startsAt ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                }`}
              />
              {formErrors.startsAt && (
                <p className="text-[11px] text-red-600">{formErrors.startsAt[0]}</p>
              )}
            </div>

            {/* End Date/Time */}
            <div className="space-y-1.5">
              <label htmlFor="endsAt" className="block text-xs font-semibold text-navy">
                End Date & Time
              </label>
              <input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              <p className="text-[11px] text-navy/50">Optional. Leave empty for single-session events.</p>
            </div>

            {/* Online/On-site & Location */}
            <div className="space-y-4 pt-4 border-t border-navy/10">
              <h3 className="font-heading text-sm font-bold text-navy">Venue</h3>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="rounded border-navy/20 text-brand-ink focus:ring-brand-ink"
                  />
                  <span className="text-xs font-medium text-navy">Online event</span>
                </label>
                <p className="text-[11px] text-navy/50 ml-5">When checked, location field is optional. Uncheck for on-site events.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="location" className="block text-xs font-semibold text-navy">
                  Location {isOnline ? "" : <span className="text-red-600">*</span>}
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={isOnline ? "Optional: Platform/Meeting link" : "e.g. Auditorium, Building Name, Address"}
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
                <p className="text-[11px] text-navy/50">{isOnline ? "Platform, meeting link, or timezone info." : "Venue name, room, full address."}</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="capacity" className="block text-xs font-semibold text-navy">
                  Capacity
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 100 (leave empty for unlimited)"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
                <p className="text-[11px] text-navy/50">Optional. Maximum number of registrations allowed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Media & Publish Settings */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">Media & Publish Settings</h2>
            <p className="text-xs text-body mt-0.5">Optional fields for better visibility.</p>
          </div>

          <div className="space-y-4">
            {/* Cover Image */}
            <div className="space-y-1.5">
              <label htmlFor="coverImageUrl" className="block text-xs font-semibold text-navy">
                Cover Image URL
              </label>
              <input
                id="coverImageUrl"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink"
              />
              <p className="text-[11px] text-navy/50">Displayed at top of event page and in social shares.</p>
            </div>

            {/* Publish Settings */}
            <div className="space-y-4 pt-4 border-t border-navy/10">
              <h3 className="font-heading text-sm font-bold text-navy">Publish Settings</h3>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-navy/20 text-brand-ink focus:ring-brand-ink"
                  />
                  <span className="text-xs font-medium text-navy">Publish immediately</span>
                </label>
                <p className="text-[11px] text-navy/50 ml-5">When checked, event will be published now.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/events"
            className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="gap-2 text-xs py-2.5 px-6 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span>{isPublished ? "Publish Event" : "Save as Draft"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}