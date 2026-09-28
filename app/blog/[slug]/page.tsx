import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Tag,
  User,
  Share2,
  ChevronLeft,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Container, Section } from "@/components/ui/layout";
import { getPublicPostBySlug, getPublicCategories, getPublicTags, getRecentPosts, getPublicPosts } from "@/lib/public-posts";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { SITE } from "@/content/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Agnipankh Labs",
    };
  }

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt ?? `Read "${post.title}" on the Agnipankh Labs blog.`;
  const ogImage = post.ogImageUrl ?? post.coverImageUrl;
  const canonicalUrl = post.canonicalUrl ?? `/blog/${post.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      images: ogImage ? [{ url: ogImage }] : [],
      tags: post.tags,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "article:published_time": post.publishedAt?.toISOString() ?? "",
      "article:modified_time": post.updatedAt.toISOString(),
      "article:author": post.authorName ?? "",
      "article:tag": post.tags.join(","),
    },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await getPublicPosts({ pageSize: 100 });
    return posts.posts.map((post: { slug: string }) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [categories, tags, recentPosts] = await Promise.all([
    getPublicCategories(),
    getPublicTags(),
    getRecentPosts(5),
  ]);

  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);

  return (
    <article className="min-h-screen bg-white">
      {/* Breadcrumb & Header */}
      <Section className="pt-8 pb-6 border-b border-navy/10">
        <Container>
          <nav className="flex items-center gap-2 text-xs text-navy/60 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="flex items-center gap-1.5 hover:text-brand-ink transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-ink transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-navy/40 truncate max-w-[200px]">{post.title}</span>
          </nav>

          <header className="max-w-3xl mx-auto text-center space-y-4">
            {post.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink/10 px-3 py-1 text-sm font-medium text-brand-ink">
                <FileText className="h-3.5 w-3.5" />
                {post.category}
              </span>
            )}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-navy leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-body max-w-2xl mx-auto">{post.excerpt}</p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-navy/60 pt-4 border-t border-navy/10">
              {post.authorName && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>By {post.authorName}</span>
                </div>
              )}
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()} className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Published {format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
                </time>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              <CopyButton
                textToCopy={`${SITE.url}/blog/${post.slug}`}
                copyCurrentUrl
                showText
                label="Share article"
                className="inline-flex items-center gap-1.5 text-xs text-brand-ink hover:text-brand-hover font-medium cursor-pointer"
              />
            </div>
          </header>
        </Container>
      </Section>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <Section className="-mt-6 px-4">
          <Container>
            <div className="relative aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Main Content */}
      <Section className="pt-8 pb-16">
        <Container className="max-w-3xl space-y-10">
          {/* Article Content */}
          <div
            className="prose prose-navy max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-8 border-t border-navy/10">
              <Tag className="h-4 w-4 text-navy/50" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-sm font-medium text-navy hover:bg-navy/10 hover:text-brand-ink transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Box */}
          {post.authorName && (
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-ink/10 text-brand-ink">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-navy">{post.authorName}</h4>
                  <p className="text-sm text-body mt-1">Author at Agnipankh Labs</p>
                </div>
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs">
            <h4 className="font-heading font-bold text-navy mb-4">Share this article</h4>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${SITE.url}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.24-3.333 3.333-8.502-9.24-7.227 8.26h-3.308l7.227-8.26-8.502-9.24 3.333-3.333 8.502 9.24 7.227-8.26z" />
                </svg>
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE.url}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <CopyButton
                textToCopy={`${SITE.url}/blog/${post.slug}`}
                copyCurrentUrl
                showText
                className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-muted/40 transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Related Posts */}
          {recentPosts.filter((p) => p.id !== post.id).length > 0 && (
            <div>
              <h3 className="font-heading text-xl font-bold text-navy mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {recentPosts
                  .filter((p) => p.id !== post.id)
                  .slice(0, 4)
                  .map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group rounded-2xl border border-navy/10 bg-white p-5 shadow-xs hover:border-brand-ink/20 hover:shadow-md transition-all"
                    >
                      {relatedPost.coverImageUrl && (
                        <img
                          src={relatedPost.coverImageUrl}
                          alt=""
                          className="mb-3 rounded-xl aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        {relatedPost.category && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-xs font-medium text-navy w-fit">
                            <Tag className="h-2.5 w-2.5" />
                            {relatedPost.category}
                          </span>
                        )}
                        <h4 className="font-heading text-base font-bold text-navy group-hover:text-brand-ink transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        {relatedPost.publishedAt && (
                          <time className="text-xs text-navy/50">
                            {format(new Date(relatedPost.publishedAt), "MMM d, yyyy")}
                          </time>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="pt-8 border-t border-navy/10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:text-brand-hover transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Newsletter CTA */}
      <Section className="py-12 bg-navy/95">
        <Container className="max-w-2xl text-center">
          <h3 className="font-heading text-2xl font-bold text-white">Enjoyed this article?</h3>
          <p className="mt-2 text-white/80">Get the latest insights delivered straight to your inbox.</p>
          <form
            action="#"
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-center"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-2 focus:outline-brand-ink"
              aria-label="Email address"
            />
            <Button variant="secondary" type="submit" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-sm text-white/60">
            By subscribing, you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </Container>
      </Section>
    </article>
  );
}

function renderMarkdown(markdown: string): string {
  // Simple markdown to HTML renderer for basic elements
  return markdown
    // Headings
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" className="text-brand-ink underline hover:text-brand-hover" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" className="rounded-xl my-4 w-full" />')
    // Lists
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
    // Wrap list items in ul/ol (simplified)
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    // Paragraphs
    .replace(/^(?!<[hulpb])(.*?)$/gim, "<p>$1</p>")
    // Clean up empty paragraphs
    .replace(/<p>\s*<\/p>/gim, "")
    // Fix nested tags
    .replace(/<p>(<h[1-6]>)/gim, "$1")
    .replace(/<\/h[1-6]><\/p>/gim, "</h$1>")
    .replace(/<p>(<ul>)/gim, "$1")
    .replace(/<\/ul><\/p>/gim, "</ul>")
    .replace(/<p>(<pre>)/gim, "$1")
    .replace(/<\/pre><\/p>/gim, "</pre>")
    // Horizontal rule
    .replace(/^---$/gim, "<hr className='my-8 border-navy/10' />");
}