"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  User,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import type { AdminLeadRecord } from "@/lib/admin-leads";
import {
  updateLeadStatusAction,
  addLeadNoteAction,
  assignLeadAction,
} from "@/app/actions/admin-leads";
import { Button } from "@/components/ui/button";

const STATUS_STYLE_MAP: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode }> = {
  NEW: { bg: "bg-blue-50", text: "text-blue-800", ring: "ring-blue-200", icon: <span className="h-3 w-3 rounded-full bg-blue-500" /> },
  CONTACTED: { bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", icon: <MessageSquare className="h-3 w-3 text-amber-600" /> },
  QUALIFIED: { bg: "bg-purple-50", text: "text-purple-800", ring: "ring-purple-200", icon: <UserPlus className="h-3 w-3 text-purple-600" /> },
  CONVERTED: { bg: "bg-emerald-50", text: "text-emerald-800", ring: "ring-emerald-200", icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" /> },
  CLOSED_LOST: { bg: "bg-red-50", text: "text-red-800", ring: "ring-red-200", icon: <X className="h-3 w-3 text-red-600" /> },
};

const KIND_LABEL_MAP: Record<string, string> = {
  CONTACT: "Contact Form",
  NEWSLETTER: "Newsletter",
  PARTNERSHIP: "Partnership",
  CAREERS: "Careers",
  MENTOR_APPLICATION: "Mentor Application",
  TRAINER_APPLICATION: "Trainer Application",
  CAMPUS_AMBASSADOR: "Campus Ambassador",
  CORPORATE_HIRING: "Corporate Hiring",
};

export function AdminLeadList({
  leads,
  total,
  page,
  pageSize,
}: {
  leads: AdminLeadRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingNoteId, setAddingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleStatusChange(lead: AdminLeadRecord, newStatus: string) {
    setUpdatingId(lead.id);
    startTransition(async () => {
      const res = await updateLeadStatusAction(lead.id, newStatus);
      if (res.success) {
        setToastMessage(res.message ?? "Status updated.");
      } else {
        alert(res.message ?? "Failed to update status.");
      }
      setUpdatingId(null);
    });
  }

  function handleAddNote(lead: AdminLeadRecord) {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const res = await addLeadNoteAction(lead.id, noteText.trim());
      if (res.success) {
        setToastMessage(res.message ?? "Note added.");
        setAddingNoteId(null);
        setNoteText("");
      } else {
        alert(res.message ?? "Failed to add note.");
      }
    });
  }

  function handleAssign(lead: AdminLeadRecord) {
    if (!assignUserId.trim()) return;
    startTransition(async () => {
      const res = await assignLeadAction(lead.id, assignUserId.trim());
      if (res.success) {
        setToastMessage(res.message ?? "Lead assigned.");
        setAssigningId(null);
        setAssignUserId("");
      } else {
        alert(res.message ?? "Failed to assign lead.");
      }
    });
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <Mail className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Leads Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No leads match the selected filters. Try adjusting your search or filters.
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
                <th className="p-3">Lead</th>
                <th className="p-3 hidden md:table-cell">Type</th>
                <th className="p-3 hidden lg:table-cell">Status</th>
                <th className="p-3 hidden lg:table-cell">Organization</th>
                <th className="p-3 hidden lg:table-cell">Source</th>
                <th className="p-3">Date</th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {leads.map((lead) => {
                const statusStyle = STATUS_STYLE_MAP[lead.status] ?? STATUS_STYLE_MAP.NEW;
                return (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-navy hover:text-brand-ink"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-navy/60">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-xs text-navy/60 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </p>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                        {KIND_LABEL_MAP[lead.kind] ?? lead.kind}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}
                      >
                        {statusStyle.icon}
                        <span className="capitalize">{lead.status.toLowerCase().replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {lead.organizationName ?? "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {lead.sourceChannel ?? "—"}
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 w-32">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
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
                          <div className="absolute right-0 top-full mt-1 hidden z-10 w-40 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                            <div className="space-y-1">
                              {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED_LOST"].map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange({ ...lead, status: status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED_LOST" }, status);
                                  }}
                                  disabled={updatingId === lead.id}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    lead.status === status
                                      ? "bg-brand-ink/10 text-brand-ink font-semibold"
                                      : "text-navy/70 hover:bg-muted/50"
                                  }`}
                                >
                                  {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
                                </button>
                              ))}
                              <hr className="my-1 border-navy/10" />
                              <button
                                onClick={() => setAddingNoteId(lead.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <MessageSquare className="h-3 w-3 inline mr-1" /> Add Note
                              </button>
                              <button
                                onClick={() => setAssigningId(lead.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg"
                              >
                                <User className="h-3 w-3 inline mr-1" /> Assign
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
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} leads
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

      {/* Add Note Modal */}
      {addingNoteId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-xs p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAddingNoteId(null); }}
        >
          <div className="w-full max-w-md rounded-3xl border border-navy/15 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-navy/10 pb-4">
              <h4 className="font-heading text-base font-bold text-navy">Add Note</h4>
              <button onClick={() => setAddingNoteId(null)} className="text-navy/50 hover:text-navy">✕</button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
              rows={4}
              className="w-full rounded-xl border border-navy/20 p-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setAddingNoteId(null); setNoteText(""); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleAddNote({ id: addingNoteId } as AdminLeadRecord)} disabled={isPending || !noteText.trim()}>
                {isPending && updatingId === addingNoteId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Save Note</span>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assigningId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-xs p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAssigningId(null); }}
        >
          <div className="w-full max-w-md rounded-3xl border border-navy/15 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-navy/10 pb-4">
              <h4 className="font-heading text-base font-bold text-navy">Assign Lead</h4>
              <button onClick={() => setAssigningId(null)} className="text-navy/50 hover:text-navy">✕</button>
            </div>
            <input
              type="text"
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              placeholder="Handler User ID"
              className="w-full rounded-xl border border-navy/20 p-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setAssigningId(null); setAssignUserId(""); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleAssign({ id: assigningId } as AdminLeadRecord)} disabled={isPending || !assignUserId.trim()}>
                {isPending && updatingId === assigningId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Assign</span>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}