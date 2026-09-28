import type { Metadata } from "next";
import { MetadataRoute } from "next";
import { Suspense } from "react";
import { format } from "date-fns";
import {
  FileText,
  Calendar,
  Tag,
  User,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Container, Section, SectionHeading, Card } from "@/components/ui/layout";
import { getPublicPosts, getPublicCategories, getPublicTags, getRecentPosts } from "@/lib/public-posts";
import { Button } from "@/components/ui/button";
import { PublicBlogFilters } from "@/components/blog/blog-filters";

export const metadata: Metadata = {
  title: "Blog | Agnipankh Labs",
  description: "Insights, tutorials, and stories from the Agnipankh Labs team. Learn about technology, career development, and innovation.",
  openGraph: {
    title: "Blog | Agnipankh Labs",
    description: "Insights, tutorials, and stories from the Agnipankh Labs team.",
    type: "website",
  },
};

export async function generateStaticParams() {
  const categories = await getPublicCategories();
  return categories.map((cat) => ({ category: cat }));
}

interface PageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? "ALL";
  const activeTag = params.tag ?? "";
  const searchQuery = params.q ?? "";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 10;

  const [categories, tags, recentPosts, { posts, total }] = await Promise.all([
    getPublicCategories(),
    getPublicTags(),
    getRecentPosts(5),
    getPublicPosts({
      category: activeCategory,
      tag: activeTag,
      search: searchQuery,
      page,
      pageSize,
    }),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-navy/95 via-navy to-royal/90 py-[2cm]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" aria-hidden="true" />
        <Container>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white mb-6">
              <FileText className="h-3.5 w-3.5" />
              <span>Blog & Insights</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Ideas, Code & Career Wisdom
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Deep dives into technology, practical tutorials, career guidance, and behind-the-scenes stories from the Agnipankh Labs team.
            </p>
          </div>
        </Container>
      </Section>

      {/* Main Content */}
      <Section className="py-[2cm]">
        <Container className="space-y-10">
          {/* Search & Filter Bar */}
          <Suspense fallback={<div className="h-16 rounded-2xl bg-muted/40 animate-pulse" />}>
            <PublicBlogFilters
              activeCategory={activeCategory}
              activeTag={activeTag}
              activeSearch={searchQuery}
              availableCategories={categories}
              availableTags={tags}
            />
          </Suspense>

          {/* Posts Grid + Sidebar */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Posts List */}
            <div className="lg:col-span-3 space-y-6">
              {posts.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-navy/30" />
                  <h3 className="mt-4 font-heading text-lg font-bold text-navy">No Articles Found</h3>
                  <p className="mt-2 text-sm text-body">
                    {searchQuery || activeCategory !== "ALL" || activeTag
                      ? "Try adjusting your filters or search terms."
                      : "No published articles yet. Check back soon!"}
                  </p>
                  {(searchQuery || activeCategory !== "ALL" || activeTag) && (
                    <div className="mt-4">
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors"
                      >
                        Clear Filters
                      </Link>
                    </div>
                  )}
                </Card>
              ) : (
                <>
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="group relative rounded-2xl border border-navy/10 bg-white p-6 shadow-xs hover:border-brand-ink/20 hover:shadow-md transition-all"
                    >
                      {post.coverImageUrl && (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="relative mb-4 rounded-xl overflow-hidden aspect-video"
                          aria-label={`Read "${post.title}"`}
                        >
                          <img
                            src={post.coverImageUrl}
                            alt=""
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </Link>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-navy/60">
                          {post.category && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-navy">
                              <Tag className="h-2.5 w-2.5" />
                              {post.category}
                            </span>
                          )}
                          {post.publishedAt && (
                            <time dateTime={post.publishedAt.toISOString()}>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(post.publishedAt), "MMM d, yyyy")}
                              </span>
                            </time>
                          )}
                          {post.authorName && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.authorName}
                            </span>
                          )}
                        </div>
                        <Link href={`/blog/${post.slug}`} className="group">
                          <h2 className="font-heading text-xl font-bold text-navy group-hover:text-brand-ink transition-colors line-clamp-2">
                            {post.title}
                          </h2>
                        </Link>
                        {post.excerpt && (
                          <p className="text-sm text-body line-clamp-3">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-navy/5">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-hover transition-colors"
                          >
                            Read more
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-navy/60"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-navy/60">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}

                  {/* Pagination */}
                  {total > pageSize && (
                    <div className="flex items-center justify-center gap-2">
                      {page > 1 ? (
                        <Link
                          href={`/blog?${new URLSearchParams({
                            ...(activeCategory !== "ALL" && { category: activeCategory }),
                            ...(activeTag && { tag: activeTag }),
                            ...(searchQuery && { q: searchQuery }),
                            page: String(page - 1),
                          }).toString()}`}
                          className="rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
                        >
                          Previous
                        </Link>
                      ) : (
                        <span className="rounded-xl border border-navy/10 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-navy/40 cursor-not-allowed">
                          Previous
                        </span>
                      )}
                      <span className="flex items-center px-4 text-sm text-navy/60">
                        Page {page} of {Math.ceil(total / pageSize)}
                      </span>
                      {page * pageSize < total ? (
                        <Link
                          href={`/blog?${new URLSearchParams({
                            ...(activeCategory !== "ALL" && { category: activeCategory }),
                            ...(activeTag && { tag: activeTag }),
                            ...(searchQuery && { q: searchQuery }),
                            page: String(page + 1),
                          }).toString()}`}
                          className="rounded-xl border border-navy/15 bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-muted/40 transition-colors"
                        >
                          Next
                        </Link>
                      ) : (
                        <span className="rounded-xl border border-navy/10 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-navy/40 cursor-not-allowed">
                          Next
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <Card className="p-5 space-y-4 sticky top-24">
                  <h3 className="font-heading text-base font-bold text-navy">Recent Articles</h3>
                  <div className="space-y-3">
                    {recentPosts.slice(0, 5).map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="flex gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors group"
                      >
                        {post.coverImageUrl && (
                          <img
                            src={post.coverImageUrl}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-navy group-hover:text-brand-ink transition-colors line-clamp-2">
                            {post.title}
                          </p>
                          {post.publishedAt && (
                            <time className="text-[11px] text-navy/50">
                              {format(new Date(post.publishedAt), "MMM d, yyyy")}
                            </time>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="mt-6 p-5 space-y-4">
                  <h3 className="font-heading text-base font-bold text-navy">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/blog"
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        activeCategory === "ALL"
                          ? "bg-brand-ink text-white"
                          : "bg-navy/5 text-navy hover:bg-navy/10"
                      }`}
                    >
                      All
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/blog?category=${encodeURIComponent(cat)}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          activeCategory === cat
                            ? "bg-brand-ink text-white"
                            : "bg-navy/5 text-navy hover:bg-navy/10"
                        }`}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <Card className="mt-6 p-5 space-y-4">
                  <h3 className="font-heading text-base font-bold text-navy">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 15).map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          activeTag === tag
                            ? "bg-brand-ink text-white"
                            : "bg-navy/5 text-navy hover:bg-navy/10"
                        }`}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* CTA */}
              <Card className="mt-6 p-5 bg-gradient-to-br from-navy/90 to-royal/90 text-white">
                <h3 className="font-heading text-base font-bold">Stay Updated</h3>
                <p className="mt-2 text-sm text-white/80">Get the latest articles delivered to your inbox.</p>
                <form
                  action="#"
                  className="mt-4 space-y-2"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-2 focus:outline-brand-ink"
                    aria-label="Email address"
                  />
                  <Button variant="secondary" className="w-full" type="submit">
                    Subscribe
                  </Button>
                </form>
                <p className="mt-3 text-[11px] text-white/60 text-center">
                  By subscribing, you agree to our <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>.
                </p>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </div>
  );
}