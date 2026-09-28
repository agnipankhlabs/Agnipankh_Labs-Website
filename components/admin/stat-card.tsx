"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/layout";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  href?: string;
  color?: "navy" | "emerald" | "blue" | "amber" | "purple" | "red";
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  href,
  color = "navy",
}: StatCardProps) {
  const colorClasses = {
    navy: "bg-navy/5 text-navy border-navy/10",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    red: "bg-red-50 text-red-800 border-red-200",
  };

  const iconBg = colorClasses[color];

  return (
    <Card className={`p-5 space-y-3 ${href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-body">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold text-navy">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.value > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : trend.value < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-navy/40" />
          )}
          <span className={`font-medium ${
            trend.value > 0 ? "text-emerald-700" :
            trend.value < 0 ? "text-red-700" : "text-navy/60"
          }`}>
            {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        </div>
      )}

      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ink hover:text-brand-hover transition-colors pt-2"
        >
          <span>View details</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      )}
    </Card>
  );
}