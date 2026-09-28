import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Sparkles,
  Eye,
  Calendar,
  Tag,
  Image,
  Globe,
  Loader2,
  File,
  ArrowLeft,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { getCategories } from "@/lib/admin-posts";
import { createPostAction } from "@/app/actions/admin-posts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Post — Admin | Agnipankh Labs",
  description: "Create a new blog post with full SEO optimization.",
};

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/posts/new");
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

  const categories = await getCategories();

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
                href="/admin/posts"
                className="flex items-center gap-1.5 font-medium text-body hover:text-navy transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Blog Posts</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-navy/30" />
              <span className="font-semibold text-navy">Create Post</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy">
                <Sparkles className="h-3.5 w-3.5 text-brand-ink" />
                <span>Post Editor</span>
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
              <Sparkles className="h-3.5 w-3.5" />
              <span>Post Editor</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
              Create New Post
            </h1>
            <p className="text-xs sm:text-sm text-body">
              Write and publish engaging content with full SEO control.
            </p>
          </div>

          <PostForm categories={categories} />
        </Container>
      </main>
    </div>
  );
}

function PostForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function generateSlug() {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
    setSlug(generated);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErrors({});
    setGeneralError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    if (excerpt) formData.set("excerpt", excerpt);
    if (content) formData.set("content", content);
    if (coverImageUrl) formData.set("coverImageUrl", coverImageUrl);
    if (category) formData.set("category", category);
    if (tags) formData.set("tags", tags);
    if (metaTitle) formData.set("metaTitle", metaTitle);
    if (metaDescription) formData.set("metaDescription", metaDescription);
    if (ogImageUrl) formData.set("ogImageUrl", ogImageUrl);
    if (canonicalUrl) formData.set("canonicalUrl", canonicalUrl);
    if (publishedAt) formData.set("publishedAt", publishedAt);
    if (isPublished) formData.set("isPublished", "on");

    startTransition(async () => {
      const res = await createPostAction(null, formData);
      if (res.success && res.postId) {
        router.push(`/admin/posts/${res.postId}/edit`);
      } else {
        if (res.fieldErrors) setFormErrors(res.fieldErrors);
        setGeneralError(res.message ?? "Failed to create post.");
      }
    });
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-brand-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Posts</span>
        </Link>

        <Link
          href="/blog"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors shadow-2xs"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Live Blog</span>
        </Link>
      </div>

      {/* Success/Error */}
      {generalError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-900 flex items-center gap-2 shadow-2xs"
        >
          <svg className="h-4 w-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">Basic Information</h2>
            <p className="text-xs text-body mt-0.5">Required fields marked with *</p>
          </div>

          <div className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-semibold text-navy">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug || slug === slug.replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "")) {
                      setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120));
                    }
                  }}
                  placeholder="e.g. 10 Tips for Better React Performance"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.title ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] text-red-600">{formErrors.title[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="block text-xs font-semibold text-navy">
                  URL Slug <span className="text-red-600">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. 10-tips-better-react-performance"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink ${
                    formErrors.slug ? "border-red-500 bg-red-50/20" : "border-navy/15 bg-white"
                  }`}
                />
                {formErrors.slug && (
                  <p className="text-[11px] text-red-600">{formErrors.slug[0]}</p>
                )}
                <p className="text-[11px] text-navy/50">Auto-generated from title. Lowercase, numbers, hyphens only.</p>              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label htmlFor="excerpt" className="block text-xs font-semibold text-navy">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary for previews and SEO (max 300 chars)"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              <p className="text-[11px] text-navy/50">Optional. Shown on cards and in SEO meta description.</p>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label htmlFor="content" className="block text-xs font-semibold text-navy">
                Content <span className="text-red-600">*</span>
              </label>
              <textarea
                id="content"
                rows={20}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here (Markdown supported)..."
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 font-mono focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
              />
              <p className="text-[11px] text-navy/50">Write in Markdown. Supports headings, lists, code blocks, links, images, and more.</p>
            </div>
          </div>
        </div>

        {/* Media & SEO */}
        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-navy/10 pb-4">
            <h2 className="font-heading text-base sm:text-lg font-bold text-navy">Media & SEO</h2>
            <p className="text-xs text-body mt-0.5">Optional fields for better visibility and sharing.</p>          </div>

          <div className="space-y-4">
            {/* Cover Image */}
            <div className="space-y-1.5">
              <label htmlFor="coverImageUrl" className="block text-xs font-semibold text-navy">
                Cover Image URL
              </label>
              <input
                id="coverImageUrl"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:outline-2 focus:outline-brand-ink"
              />
              <p className="text-[11px] text-navy/50">Displayed at top of post and in social shares.</p>            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="category" className="block text-xs font-semibold text-navy">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-xs font-medium text-navy focus:border-brand-ink focus:bg-white focus:outline-2 focus:outline-brand-ink"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tags" className="block text-xs font-semibold text-navy">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. react, performance, hooks, tutorial"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                />
                <p className="text-[11px] text-navy/50">Separate tags with commas.</p>
              </div>
            </div>

            {/* SEO Fields */}
            <div className="space-y-4 pt-4 border-t border-navy/10">
              <h3 className="font-heading text-sm font-bold text-navy">SEO Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="metaTitle" className="block text-xs font-semibold text-navy">
                    Meta Title
                  </label>
                  <input
                    id="metaTitle"
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Custom title for search results (max 60 chars)"
                    className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                  />
                  <p className="text-[11px] text-navy/50">Defaults to post title if empty.</p>                </div>

                <div className="space-y-1.5">
                  <label htmlFor="metaDescription" className="block text-xs font-semibold text-navy">
                    Meta Description
                  </label>
                  <input
                    id="metaDescription"
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Description for search results (max 160 chars)"
                    className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                  />
                  <p className="text-[11px] text-navy/50">Defaults to excerpt if empty.</p>                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ogImageUrl" className="block text-xs font-semibold text-navy">
                    Open Graph Image
                  </label>
                  <input
                    id="ogImageUrl"
                    type="url"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                  />
                  <p className="text-[11px] text-navy/50">Image for social media previews.</p>                </div>

                <div className="space-y-1.5">
                  <label htmlFor="canonicalUrl" className="block text-xs font-semibold text-navy">
                    Canonical URL
                  </label>
                  <input
                    id="canonicalUrl"
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://example.com/canonical-url"
                    className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                  />
                  <p className="text-[11px] text-navy/50">Prevents duplicate content issues.</p>                </div>
              </div>

              {/* Publish Settings */}
              <div className="space-y-4 pt-4 border-t border-navy/10">
                <h3 className="font-heading text-sm font-bold text-navy">Publish Settings</h3>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-navy/20 text-brand-ink focus:ring-brand-ink"
                    />
                    <span className="text-xs font-medium text-navy">Publish immediately</span>
                  </label>
                  <p className="text-[11px] text-navy/50 ml-5">When checked, post will be published now (or at scheduled date).</p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="publishedAt" className="block text-xs font-semibold text-navy">
                    Scheduled Publish Date
                  </label>
                  <input
                    id="publishedAt"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    placeholder="e.g. 2026-09-15T10:00"
                    className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-xs text-navy placeholder:text-navy/40 focus:border-brand-ink focus:outline-2 focus:outline-brand-ink"
                  />
                  <p className="text-[11px] text-navy/50">Optional. Leave empty to publish immediately when enabled.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/posts"
            className="rounded-xl border border-navy/15 bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="gap-2 text-xs py-2.5 px-6 font-semibold"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>{isPublished ? "Publish Post" : "Save as Draft"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}