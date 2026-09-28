"use client";

import { useState, useTransition } from "react";
import { BookOpen, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  priceText: string;
  initiallyEnrolled?: boolean;
  initialProgress?: number;
}

export function EnrollButton({
  courseId,
  courseSlug,
  priceText,
  initiallyEnrolled = false,
  initialProgress = 0,
}: EnrollButtonProps) {
  const [isEnrolled, setIsEnrolled] = useState(initiallyEnrolled);
  const [progress] = useState(initialProgress);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  async function handleEnroll() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        const data = await res.json();
        if (data.success) {
          setIsEnrolled(true);
          setShowProgress(true);
        } else {
          setError(data.message ?? "Failed to enroll.");
        }
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  async function handleViewProgress() {
    // Navigate to course with progress view
    window.location.href = `/courses/${courseSlug}?enrolled=1`;
  }

  if (isEnrolled && showProgress) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-navy">Course Progress</span>
              <span className="font-bold text-brand-ink">{progress}%</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-ink rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {progress >= 100 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completed!</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleViewProgress}
          className="gap-2 text-sm py-2.5 px-5 font-semibold"
        >
          <BookOpen className="h-4 w-4" />
          <span>Continue Learning</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        onClick={handleEnroll}
        disabled={isPending || isEnrolled}
        variant="primary"
        className="gap-2 text-sm py-3 px-6 font-semibold w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4" />
        )}
        <span>
          {isEnrolled ? "Enrolled" : `Enroll Now — ${priceText}`}
        </span>
      </Button>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 flex items-center gap-2 w-full sm:w-auto">
          <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}