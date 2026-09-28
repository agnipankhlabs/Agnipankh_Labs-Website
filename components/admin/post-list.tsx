"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MoreVertical,
  Loader2,
  File,
} from "lucide-react";
import type { AdminPostRecord } from "@/lib/admin-posts";
import { togglePublishPostAction, deletePostAction } from "@/app/actions/admin-posts";
import { Button } from "@/components/ui/button";

interface StatusStyle {
  bg: string;
  text: string;
  ring: string;
  icon: React.ReactNode;
  label: string;
}

const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
  PUBLISHED: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    ring: "ring-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" />,
    label: "Published",
  },
  DRAFT: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-amber-200",
    icon: <Clock className="h-3 w-3 text-amber-600" />,
    label: "Draft",
  },
};

export function AdminPostList({
  posts,
  total,
  page,
  pageSize,
}: {
  posts: AdminPostRecord[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleTogglePublish(post: AdminPostRecord) {
    setUpdatingId(post.id);
    startTransition(async () => {
      const res = await togglePublishPostAction(post.id, !post.publishedAt);
      if (res.success) {
        setToastMessage(res.message ?? `Post ${!post.publishedAt ? "published" : "unpublished"}.`);
      } else {
        alert(res.message ?? "Failed to update status.");
      }
      setUpdatingId(null);
    });
  }

  function handleDelete(post: AdminPostRecord) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    startTransition(async () => {
      const res = await deletePostAction(post.id);
      if (res.success) {
        setToastMessage(res.message ?? "Post deleted.");
      } else {
        alert(res.message ?? "Failed to delete post.");
      }
      setDeletingId(null);
    });
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-navy/40">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Posts Found</h3>
        <p className="mt-1 text-xs text-body max-w-md mx-auto">
          No posts match the selected filters. Use the Create Post button to add your first post.
        </p>
        <div className="mt-6">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-hover transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Create Post</span>
          </Link>
        </div>
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
            <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
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
                <th className="p-3">Post</th>
                <th className="p-3 hidden md:table-cell">Category</th>
                <th className="p-3 hidden lg:table-cell">Status</th>
                <th className="p-3 hidden lg:table-cell">Author</th>
                <th className="p-3 hidden lg:table-cell">Published</th>
                <th className="p-3">Updated</th>
                <th className="p-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {posts.map((post) => {
                const statusStyle = post.publishedAt ? STATUS_STYLE_MAP.PUBLISHED : STATUS_STYLE_MAP.DRAFT;
                return (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-navy hover:text-brand-ink"
                      >
                        {post.title}
                      </Link>
                      {post.excerpt && (
                        <p className="text-xs text-navy/60 line-clamp-1 mt-0.5">{post.excerpt}</p>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {post.category ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy">
                          {post.category}
                        </span>
                      ) : (
                        <span className="text-xs text-navy/50">—</span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
                        {statusStyle.icon}
                        <span>{statusStyle.label}</span>
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60">
                      {post.authorName ?? "—"}
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-navy/60 whitespace-nowrap">
                      {post.publishedAt ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 inline text-emerald-600" />
                          <span className="ml-1">{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                        </>
                      ) : (
                        <span className="text-navy/50">—</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-navy/60 whitespace-nowrap">
                      {format(new Date(post.updatedAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 w-40">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 0-3L19.5 3.5a2.121 2.121 0 0 1 3 3z" />
                          </svg>
                        </Link>

                        <div className="relative">
                          <button
                            className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-navy transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = e.currentTarget.nextElementSibling as HTMLElement;
                              if (menu) menu.classList.toggle("hidden");
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>
                          <div className="absolute right-0 top-full mt-1 hidden z-10 w-36 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
                            <div className="space-y-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newStatus = post.publishedAt ? false : true;
                                  handleTogglePublish(post);
                                }}
                                disabled={isPending || updatingId === post.id}
                                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                  post.publishedAt
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {post.publishedAt ? "Unpublish" : "Publish"}
                              </button>
                              <hr className="my-1 border-navy/10" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(post);
                                }}
                                disabled={isPending || deletingId === post.id}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                Delete
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
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} posts
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
    </div>
  );
}