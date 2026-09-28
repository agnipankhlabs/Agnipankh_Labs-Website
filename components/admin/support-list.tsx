"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  MessageSquare,
  Flag,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import type { AdminSupportTicketRecord } from "@/lib/admin-support";
import {
  updateTicketStatusAction,
  updateTicketPriorityAction,
  addTicketReplyAction,
} from "@/app/actions/admin-support";
import { Button } from "@/components/ui/button";

const STATUS_STYLE_MAP: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode; label: string }> = {
  OPEN: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200", icon: <Mail className="h-3 w-3 text-blue-600" />, label: "Open" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <AlertCircle className="h-3 w-3 text-amber-600" />, label: "In Progress" },
  WAITING_ON_USER: { bg: "bg-purple-50", text: "text-purple-800", ring: "ring-purple-200", icon: <Clock className="h-3 w-3 text-purple-600" />, label: "Waiting on User" },
  RESOLVED: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />, label: "Resolved" },
  CLOSED: { bg: "bg-navy/5", text: "text-navy", ring: "ring-navy/10", icon: <Mail className="h-3 w-3 text-navy/50" />, label: "Closed" },
};

const PRIORITY_STYLE_MAP: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode }> = {
  LOW: { bg: "bg-navy/5", text: "text-navy/60", ring: "ring-navy/10", icon: <ArrowUpDown className="h-3 w-3 text-navy/50" /> },
  NORMAL: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200", icon: <Flag className="h-3 w-3 text-blue-600" /> },
  HIGH: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <Flag className="h-3 w-3 text-amber-600" /> },
  URGENT: { bg: "bg-red-50", text: "text-red-800", ring: "ring-red-200", icon: <AlertTriangle className="h-3 w-3 text-red-600" /> },
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  GENERAL: "General",
  TECHNICAL: "Technical",
  URGENT: "Urgent",
  CERTIFICATE: "Certificate",
  ACADEMIC: "Academic",
};

export function AdminSupportList({
  tickets,
  total,
  page,
  pageSize,
}: {
  tickets: AdminSupportTicketRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleStatusChange(ticket: AdminSupportTicketRecord, newStatus: string) {
    setUpdatingId(ticket.id);
    startTransition(async () => {
      const res = await updateTicketStatusAction(ticket.id, newStatus);
      if (res.success) {
        setToastMessage(res.message ?? "Status updated.");
      } else {
        alert(res.message ?? "Failed to update status.");
      }
      setUpdatingId(null);
    });
  }

  function handlePriorityChange(ticket: AdminSupportTicketRecord, newPriority: string) {
    setUpdatingId(ticket.id);
    startTransition(async () => {
      const res = await updateTicketPriorityAction(ticket.id, newPriority);
      if (res.success) {
        setToastMessage(res.message ?? "Priority updated.");
      } else {
        alert(res.message ?? "Failed to update priority.");
      }
      setUpdatingId(null);
    });
  }

  function handleReply(ticket: AdminSupportTicketRecord) {
    if (!replyText.trim()) return;
    startTransition(async () => {
      const res = await addTicketReplyAction(ticket.id, replyText.trim(), false);
      if (res.success) {
        setToastMessage(res.message ?? "Reply sent.");
        setReplyingId(null);
        setReplyText("");
      } else {
        alert(res.message ?? "Failed to send reply.");
      }
    });
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <Mail className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Tickets Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No tickets match the selected filters. Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-navy/10 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-navy/10 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-navy/60">
                <th className="p-3">Ticket</th>
                <th className="p-3 hidden md:table-cell">Category</th>
                <th className="p-3 hidden lg:table-cell">Priority</th>
                <th className="p-3 hidden lg:table-cell">Status</th>
                <th className="p-3 hidden lg:table-cell">Requester</th>
                <th className="p-3 hidden lg:table-cell">Assignee</th>
                <th className="p-3 hidden lg:table-cell">SLA</th>
                <th className="p-3">Created</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {tickets.map((ticket) => {
                const statusStyle = STATUS_STYLE_MAP[ticket.status] ?? STATUS_STYLE_MAP.OPEN;
                const priorityStyle = PRIORITY_STYLE_MAP[ticket.priority] ?? PRIORITY_STYLE_MAP.NORMAL;
                const slaOverdue = ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED";
                return (
                  <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className="font-medium text-navy hover:text-brand-ink"
                      >
                        {ticket.subject}
                      </Link>
                      <p className="text-xs text-navy/60 line-clamp-1 mt-1">{ticket.body}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {CATEGORY_LABEL_MAP[ticket.category] ?? ticket.category}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.ring}`}>
                        {priorityStyle.icon}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}
                      >
                        {statusStyle.icon}
                        <span>{statusStyle.label}</span>
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      <div className="flex items-center gap-1">{ticket.requesterEmail}</div>
                      {ticket.requesterName && <div className="text-[10px] text-navy/50">{ticket.requesterName}</div>}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {ticket.assignedToId ? "Assigned" : "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {ticket.slaDueAt && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${slaOverdue ? "text-red-600" : "text-navy/60"}`}>
                          <Clock className="h-3 w-3" />
                          {format(new Date(ticket.slaDueAt), "MMM d, HH:mm")}
                          {slaOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {format(new Date(ticket.createdAt), "MMM d, HH:mm")}
                    </td>
                    <td className="p-3 w-32">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* Status dropdown */}
                        <div className="relative">
                          <button
                            className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = e.currentTarget.nextElementSibling as HTMLElement;
                              if (menu) menu.classList.toggle("hidden");
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 hidden z-10 w-44 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                            <div className="space-y-1">
                              {["OPEN", "IN_PROGRESS", "WAITING_ON_USER", "RESOLVED", "CLOSED"].map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ticket, status);
                                  }}
                                  disabled={updatingId === ticket.id}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    ticket.status === status
                                      ? "bg-brand-ink/10 text-brand-ink font-semibold"
                                      : "text-navy/70 hover:bg-muted/50"
                                  }`}
                                >
                                  {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
                                </button>
                              ))}
                              <hr className="my-1 border-navy/10" />
                              {["LOW", "NORMAL", "HIGH", "URGENT"].map((priority) => (
                                <button
                                  key={priority}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePriorityChange(ticket, priority);
                                  }}
                                  disabled={updatingId === ticket.id}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    ticket.priority === priority
                                      ? "bg-brand-ink/10 text-brand-ink font-semibold"
                                      : "text-navy/70 hover:bg-muted/50"
                                  }`}
                                >
                                  {priority}
                                </button>
                              ))}
                              <hr className="my-1 border-navy/10" />
                              <button
                                onClick={() => setReplyingId(ticket.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <MessageSquare className="h-3 w-3 inline mr-1" /> Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-navy/10 px-4 py-3 text-xs text-navy/60">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} tickets
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => window.location.href = `${window.location.pathname}?${new URLSearchParams(window.location.search).set("page", String(page - 1))}`}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= total}
              onClick={() => window.location.href = `${window.location.pathname}?${new URLSearchParams(window.location.search).set("page", String(page + 1))}`}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {replyingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-navy">Reply to Support Ticket</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response to the user..."
              className="w-full rounded-lg border border-navy/20 p-3 text-sm focus:border-brand-ink focus:outline-hidden"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingId(null);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isPending || !replyText.trim()}
                onClick={() => {
                  const t = tickets.find((tk) => tk.id === replyingId);
                  if (t) handleReply(t);
                }}
              >
                {isPending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}