import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Edit,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { getAdminCourseById } from "@/lib/admin-courses";
import { CourseForm } from "@/components/admin/course-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getAdminCourseById(id);
  
  if (!course) {
    return {
      title: "Course Not Found — Admin | Agnipankh Labs",
      robots: "noindex, nofollow",
    };
  }

  return {
    title: `Edit ${course.title} — Admin Desk | Agnipankh Labs`,
    description: `Edit course "${course.title}" with lessons and curriculum.`,
  };
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/admin/courses/${id}/edit`);
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

  const course = await getAdminCourseById(id);
  if (!course) {
    notFound();
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
                href="/admin/courses"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Course Desk</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <Link
                href={`/admin/courses/${id}/edit`}
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Course</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">{course.title}</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <Edit className="h-3.5 w-3.5 text-brand-ink" />
                <span>Course Editor</span>
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
              <Edit className="h-3.5 w-3.5" />
              <span>Course Editor</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Edit Course: {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Modify course details, lessons, and curriculum structure.
            </p>
          </div>

          <CourseForm
            isEditing={true}
            courseId={id}
            initialValues={{
              title: course.title,
              slug: course.slug,
              summary: course.summary ?? undefined,
              description: course.description ?? undefined,
              level: course.level ?? undefined,
              prerequisites: course.prerequisites.join("\n"),
              pricePaise: course.pricePaise ?? undefined,
              isPublished: course.isPublished,
              lessons: course.lessons.map((l) => ({
                title: l.title,
                ordinal: l.ordinal,
                kind: l.kind,
                content: l.content ?? undefined,
                videoUrl: l.videoUrl ?? undefined,
                durationMinutes: l.durationMinutes ?? undefined,
              })),
            }}
          />
        </Container>
      </main>
    </div>
  );
}