"use client";

import Link from "next/link";
import { BookOpen, Users, Tag, ExternalLink } from "lucide-react";
import type { PublicCourseRecord } from "@/lib/public-courses";

interface CourseCardProps {
  course: PublicCourseRecord;
}

export function PublicCourseCard({ course }: CourseCardProps) {
  const isFree = !course.pricePaise || course.pricePaise === 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group rounded-2xl border border-navy/10 bg-white p-6 shadow-xs transition-all hover:shadow-lg hover:border-brand-ink/30 hover:-translate-y-1"
    >
      <div className="space-y-4">
        {/* Header with level and price */}
        <div className="flex flex-wrap items-center gap-2">
          {course.level && (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-medium text-navy">
              <Tag className="h-3 w-3" />
              {course.level}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isFree
              ? "bg-emerald-100 text-emerald-800"
              : "bg-blue-100 text-blue-800"
          }`}>
            {isFree ? (
              <>
                <span>Free</span>
              </>
            ) : (
              <>
                ₹{(course.pricePaise! / 100).toLocaleString("en-IN")}
              </>
            )}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand-ink transition-colors">
          {course.title}
        </h3>

        {/* Summary */}
        {course.summary && (
          <p className="text-xs text-body line-clamp-2">{course.summary}</p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-navy/60 pt-2 border-t border-navy/5">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
          </span>
          {course.cohortCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.cohortCount} cohort{course.cohortCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-navy/5">
          <span className="text-xs font-semibold text-brand-ink group-hover:underline">
            View Course
          </span>
          <ExternalLink className="h-4 w-4 text-navy/40 group-hover:text-brand-ink transition-colors" />
        </div>
      </div>
    </Link>
  );
}