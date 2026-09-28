import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { format } from "date-fns";
import {
  BookOpen,
  Clock,
  Users,
  Tag,
  GraduationCap,
  Zap,
  Award,
  Play,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getPublicCourseDetailBySlug } from "@/lib/public-course-detail";
import { EnrollButton } from "@/components/courses/enroll-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourseDetailBySlug(slug);
  
  if (!course) {
    return {
      title: "Course Not Found | Agnipankh Labs",
      robots: "noindex, nofollow",
    };
  }

  const isFree = !course.pricePaise || course.pricePaise === 0;
  const priceText = isFree ? "Free" : `₹${(course.pricePaise! / 100).toLocaleString("en-IN")}`;

  return {
    title: `${course.title} | Courses | Agnipankh Labs`,
    description: course.summary ?? `Learn ${course.title} with hands-on projects and expert mentorship. ${course.lessonCount} lessons, ${priceText}.`,
    openGraph: {
      title: `${course.title} | Agnipankh Labs`,
      description: course.summary ?? `Learn ${course.title} with hands-on projects.`,
      type: "website",
    },
  };
}

function LessonKindIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "VIDEO":
      return <Play className="h-4 w-4 text-blue-600" />;
    case "QUIZ":
      return <Award className="h-4 w-4 text-amber-600" />;
    case "ASSIGNMENT":
      return <FileText className="h-4 w-4 text-purple-600" />;
    case "CODE_LAB":
      return <Zap className="h-4 w-4 text-emerald-600" />;
    default:
      return <BookOpen className="h-4 w-4 text-navy/70" />;
  }
}

function LessonKindLabel({ kind }: { kind: string }) {
  switch (kind) {
    case "VIDEO":
      return "Video";
    case "QUIZ":
      return "Quiz";
    case "ASSIGNMENT":
      return "Assignment";
    case "CODE_LAB":
      return "Code Lab";
    default:
      return "Reading";
  }
}

async function getEnrollmentStatus(courseId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { enrolled: false, progress: 0 };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, progressPct: true, status: true },
  });

  if (!enrollment) return { enrolled: false, progress: 0 };

  return {
    enrolled: true,
    progress: enrollment.progressPct,
    enrollmentId: enrollment.id,
    status: enrollment.status,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getPublicCourseDetailBySlug(slug);

  if (!course) {
    notFound();
  }

  const isFree = !course.pricePaise || course.pricePaise === 0;
  const priceText = isFree ? "Free" : `₹${(course.pricePaise! / 100).toLocaleString("en-IN")}`;

  // Fetch enrollment status for authenticated users
  const enrollmentStatus = await getEnrollmentStatus(course.id);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero / Header */}
      <header className="border-b border-navy/10 bg-white">
        <Container className="py-8 sm:py-12">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Courses</span>
          </Link>

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.level && (
                <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                  <Tag className="h-3 w-3" />
                  {course.level}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isFree
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {priceText}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy">
              {course.title}
            </h1>

            {course.summary && (
              <p className="text-lg text-body max-w-2xl">{course.summary}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-navy/70 pt-4 border-t border-navy/10">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-brand-ink" />
                {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
              </span>
              {course.cohortCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4 text-brand-ink" />
                  {course.cohortCount} cohort{course.cohortCount !== 1 ? "s" : ""}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4 text-brand-ink" />
                Updated {format(course.updatedAt, "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-12 sm:py-16">
        <Container className="space-y-12 max-w-5xl">
          {/* Description */}
          {course.description && (
            <Section>
              <SectionHeading
                title="Course Description"
                description="What you'll learn and what to expect"
              />
              <div className="prose prose-navy max-w-none text-body">
                {course.description.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </Section>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <Section>
              <SectionHeading
                eyebrow="Prerequisites"
                title="What You'll Need"
                description="Recommended background knowledge before starting"
              />
              <ul className="space-y-2">
                {course.prerequisites.map((prereq, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-body">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Curriculum / Lessons */}
          <Section>
            <SectionHeading
              eyebrow={`Curriculum (${course.lessons.length} lessons)`}
              title="Lesson Structure"
              description="Progress through lessons in order — each builds on the previous"
            />
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => (
                <Card
                  key={lesson.id}
                  className="p-5 space-y-3 hover:border-brand-ink/30 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy/50 font-mono text-sm font-bold">
                        {lesson.ordinal}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-semibold text-navy group-hover:text-brand-ink transition-colors">
                            {lesson.title}
                          </h4>
                          <LessonKindIcon kind={lesson.kind} />
                          <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy/70">
                            {LessonKindLabel({ kind: lesson.kind })}
                          </span>
                          {lesson.quizQuestionCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                              <Award className="h-3 w-3" />
                              {lesson.quizQuestionCount} question{lesson.quizQuestionCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {(lesson.durationMinutes || lesson.videoUrl) && (
                          <div className="flex items-center gap-3 text-xs text-navy/60">
                            {lesson.durationMinutes && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                ~{lesson.durationMinutes} min
                              </span>
                            )}
                            {lesson.videoUrl && (
                              <span className="inline-flex items-center gap-1 text-blue-600">
                                <Play className="h-3.5 w-3.5" />
                                Video available
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ButtonLink
                        href={`/courses/${course.slug}/lessons/${lesson.id}`}
                        variant="outline"
                        size="sm"
                        className="text-xs py-2 px-3"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span>Start Lesson</span>
                      </ButtonLink>
                    </div>
                  </div>

                  {lesson.content && (
                    <div className="pt-3 border-t border-navy/10">
                      <p className="text-sm text-body line-clamp-3">{lesson.content}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Section>

          {/* Cohorts */}
          {course.cohorts.length > 0 && (
            <Section>
              <SectionHeading
                eyebrow={`Upcoming Cohorts (${course.cohorts.length})`}
                title="Join a Cohort"
                description="Structured, mentor-led programs with fixed start/end dates and peer groups"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {course.cohorts.map((cohort) => (
                  <Card key={cohort.id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-navy">{cohort.name}</h4>
                        <p className="text-xs text-navy/60">
                          {format(cohort.startDate, "MMM d, yyyy")} – {format(cohort.endDate, "MMM d, yyyy")}
                        </p>
                      </div>
                      {cohort.capacity && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800">
                          <Users className="h-3.5 w-3.5" />
                          {cohort.enrollmentCount}/{cohort.capacity}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-navy/60">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {cohort.enrollmentCount} enrolled
                      </span>
                    </div>
                    <ButtonLink
                      href={`/cohorts/${cohort.id}`}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Cohort Details
                    </ButtonLink>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          {/* Value Props / CTA */}
          <Section>
            <SectionHeading
              eyebrow="Why This Course?"
              title="Built for Real Learning Outcomes"
              description="Every course is designed around practical application"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-5 text-center space-y-2">
                <GraduationCap className="h-10 w-10 mx-auto text-brand-ink" />
                <h4 className="font-heading font-bold text-navy">Structured Curriculum</h4>
                <p className="text-xs text-body">Lessons ordered by dependency — no gaps in knowledge.</p>
              </Card>
              <Card className="p-5 text-center space-y-2">
                <Zap className="h-10 w-10 mx-auto text-brand-ink" />
                <h4 className="font-heading font-bold text-navy">Hands-on Practice</h4>
                <p className="text-xs text-body">Code labs, assignments, and real projects in every module.</p>
              </Card>
              <Card className="p-5 text-center space-y-2">
                <Award className="h-10 w-10 mx-auto text-brand-ink" />
                <h4 className="font-heading font-bold text-navy">Verifiable Certificate</h4>
                <p className="text-xs text-body">HMAC-SHA256 secured certificate on completion.</p>
              </Card>
              <Card className="p-5 text-center space-y-2">
                <Users className="h-10 w-10 mx-auto text-brand-ink" />
                <h4 className="font-heading font-bold text-navy">Peer Community</h4>
                <p className="text-xs text-body">Learn alongside a cohort with mentor support.</p>
              </Card>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-8">
              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                priceText={priceText}
                initiallyEnrolled={enrollmentStatus.enrolled}
                initialProgress={enrollmentStatus.progress}
              />
              <ButtonLink
                href="/courses"
                variant="outline"
                className="gap-2 text-sm py-3 px-6 font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Catalog</span>
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