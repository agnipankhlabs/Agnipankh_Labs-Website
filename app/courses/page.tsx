import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Zap,
  Award,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { getPublicCourses, getPublicCourseLevels } from "@/lib/public-courses";
import { PublicCourseFilters } from "@/components/courses/course-filters";
import { PublicCourseCard } from "@/components/courses/course-card";

export const metadata: Metadata = {
  title: "Courses | Agnipankh Labs",
  description:
    "Explore our structured courses in web development, AI/ML, data science, cybersecurity, and more. Learn at your own pace with hands-on projects and expert mentorship.",
  openGraph: {
    title: "Courses | Agnipankh Labs",
    description: "Structured learning programs with hands-on projects and industry mentorship.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{
    level?: string;
    q?: string;
  }>;
}

async function CoursesPageContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeLevel = params.level ?? "ALL";
  const searchQuery = params.q ?? "";

  const [levels, courses] = await Promise.all([
    getPublicCourseLevels(),
    getPublicCourses({ level: activeLevel, search: searchQuery }),
  ]);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <header className="border-b border-navy/10 bg-white">
        <Container className="py-[2cm]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-ink">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Learning Programs</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy">
              Courses & Learning Programs
            </h1>
            <p className="text-lg text-body max-w-2xl mx-auto">
              Structured, hands-on courses designed by industry practitioners.
              Learn at your own pace with real projects, expert mentorship, and
              verifiable certificates.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-navy/70">
                <GraduationCap className="h-5 w-5 text-brand-ink" />
                <span>Structured Curriculum</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy/70">
                <Zap className="h-5 w-5 text-brand-ink" />
                <span>Hands-on Projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy/70">
                <Award className="h-5 w-5 text-brand-ink" />
                <span>Verifiable Certificates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy/70">
                <Clock className="h-5 w-5 text-brand-ink" />
                <span>Self-paced Learning</span>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-[2cm]">
        <Container className="space-y-8">
          {/* Filter Bar */}
          <Suspense fallback={<div className="h-12 rounded-2xl bg-muted/40 animate-pulse" />}>
            <PublicCourseFilters
              activeLevel={activeLevel}
              activeSearch={searchQuery}
              availableLevels={levels}
            />
          </Suspense>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy">
                No Courses Found
              </h3>
              <p className="mt-2 text-sm text-body max-w-md mx-auto">
                {searchQuery || activeLevel !== "ALL"
                  ? "Try adjusting your filters or search terms."
                  : "No published courses available at the moment. Check back soon!"}
              </p>
              {(searchQuery || activeLevel !== "ALL") && (
                <div className="mt-6">
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-navy/70">
                Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
                {activeLevel !== "ALL" && ` in ${activeLevel}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <PublicCourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {/* CTA Section */}
          <Section>
            <SectionHeading
              eyebrow="Ready to Start Learning?"
              title="Join Thousands of Learners"
              description="Pick a course, enroll instantly, and start building real projects today."
            />
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <ButtonLink
                href="/courses"
                variant="primary"
                className="gap-2 text-sm py-3 px-6 font-semibold"
              >
                <BookOpen className="h-4 w-4" />
                <span>Browse All Courses</span>
              </ButtonLink>
              <ButtonLink
                href="/internships"
                variant="outline"
                className="gap-2 text-sm py-3 px-6 font-semibold"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Explore Internships</span>
              </ButtonLink>
            </div>
          </Section>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy/10 bg-navy text-surface/90">
        <Container className="py-6 text-center">
          <p className="text-xs text-surface/60">
            &copy; {new Date().getFullYear()} Agnipankh Labs. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default async function CoursesPage({ searchParams }: PageProps) {
  return <CoursesPageContent searchParams={searchParams} />;
}