import { cn } from "@/lib/utils";

/**
 * StatusBadge — single-source-of-truth for every entity status pill.
 *
 * Admin list views used to maintain their own inline style maps for the same
 * statuses. Centralising here means a colour change propagates everywhere
 * automatically and a new status variant only has to be added once.
 *
 * Usage:
 *   <StatusBadge status="ACTIVE" />
 *   <StatusBadge status="PENDING" size="sm" />
 */

const STYLE_MAP: Record<
  string,
  { bg: string; text: string; ring: string; label: string }
> = {
  // Generic
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Active",
  },
  INACTIVE: {
    bg: "bg-navy/5",
    text: "text-navy/60",
    ring: "ring-navy/10",
    label: "Inactive",
  },
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-amber-200",
    label: "Pending",
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-red-50",
    text: "text-red-800",
    ring: "ring-red-200",
    label: "Rejected",
  },
  // Applications
  APPLIED: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    ring: "ring-blue-200",
    label: "Applied",
  },
  SCREENING: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    ring: "ring-purple-200",
    label: "Screening",
  },
  ACCEPTED: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Accepted",
  },
  WITHDRAWN: {
    bg: "bg-navy/5",
    text: "text-navy/60",
    ring: "ring-navy/10",
    label: "Withdrawn",
  },
  // Payments
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Completed",
  },
  FAILED: {
    bg: "bg-red-50",
    text: "text-red-800",
    ring: "ring-red-200",
    label: "Failed",
  },
  REFUNDED: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-amber-200",
    label: "Refunded",
  },
  // Support tickets
  OPEN: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    ring: "ring-blue-200",
    label: "Open",
  },
  IN_PROGRESS: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-amber-200",
    label: "In Progress",
  },
  WAITING_ON_USER: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    ring: "ring-purple-200",
    label: "Waiting on User",
  },
  RESOLVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Resolved",
  },
  CLOSED: {
    bg: "bg-navy/5",
    text: "text-navy/60",
    ring: "ring-navy/10",
    label: "Closed",
  },
  // Certificates
  ISSUED: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    label: "Issued",
  },
  REVOKED: {
    bg: "bg-red-50",
    text: "text-red-800",
    ring: "ring-red-200",
    label: "Revoked",
  },
};

const FALLBACK = {
  bg: "bg-navy/5",
  text: "text-navy/70",
  ring: "ring-navy/10",
  label: undefined,
};

interface StatusBadgeProps {
  status: string;
  /** Override the human-readable label. Falls back to STYLE_MAP label or raw status. */
  label?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  label,
  size = "xs",
  className,
}: StatusBadgeProps) {
  const style = STYLE_MAP[status] ?? FALLBACK;
  const displayLabel = label ?? style.label ?? status;

  const sizeClass = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold ring-1",
        style.bg,
        style.text,
        style.ring,
        sizeClass,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}
