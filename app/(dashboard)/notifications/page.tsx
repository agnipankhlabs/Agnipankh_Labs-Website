"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Bell,
  Check,
  ChevronRight,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { markAsReadAction, markAllAsReadAction } from "@/app/actions/notification";
import { Container, Card } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";

const KIND_STYLE_MAP = {
  info: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200", icon: <Mail className="h-3 w-3 text-blue-600" />, label: "Info" },
  success: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />, label: "Success" },
  warning: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <AlertTriangle className="h-3 w-3 text-amber-600" />, label: "Warning" },
  error: { bg: "bg-red-50", text: "text-red-800", ring: "ring-red-200", icon: <AlertCircle className="h-3 w-3 text-red-600" />, label: "Error" },
  system: { bg: "bg-purple-50", text: "text-purple-800", ring: "ring-purple-200", icon: <Users className="h-3 w-3 text-purple-600" />, label: "System" },
};

interface Notification {
  id: string;
  title: string;
  body: string | null;
  href: string | null;
  kind: string;
  readAt: Date | null;
  createdAt: Date;
}

export default function NotificationsPage() {
  // This is a client component that would receive notifications from the server
  // For now we'll use a placeholder - the real implementation would fetch from server
  return (
    <div className="min-h-screen bg-muted/20 py-10 sm:py-16">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">Notifications</h1>
            <p className="mt-1 text-sm text-body">Your notifications and announcements</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-navy/30" />
            <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Notifications Yet</h3>
            <p className="mt-2 text-sm text-body">When you receive notifications, they&apos;ll appear here.</p>
          </div>
        </Card>
      </Container>
    </div>
  );
}