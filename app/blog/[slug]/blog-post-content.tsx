"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  categoryColorMap,
  extractHeadings,
  getRelatedPosts,
  type BlogPost,
} from "@/lib/blog-data";

const easeOut = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

/* ── Table of Contents ── */
function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string }[];
}) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
        On this page
      </p>
      {headings.map(({ id, text }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`block text-[13px] py-1.5 pl-3 border-l-2 transition-all duration-200 ${
            activeId === id
              ? "border-sky-500 text-sky-600 font-medium"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
          }`}
        >
          {text}
        </a>
      ))}
    </nav>
  );
}

/* ── Related Post Card ── */
function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md shadow-sky-100/20 hover:shadow-lg hover:shadow-sky-200/30 hover:bg-white/90 transition-all duration-500 p-6">
        <Badge className={`${categoryColorMap[post.category]} text-xs mb-3`}>
          {post.category}
        </Badge>
        <h4 className="text-base font-semibold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors duration-300 line-clamp-2">
          {post.title}
        </h4>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-6 w-6 rounded-full ${post.authorColor} flex items-center justify-center text-[10px] font-semibold text-white`}
            >
              {post.authorInitials}
            </div>
            <span className="text-xs text-slate-500">{post.author}</span>
          </div>
          <span className="text-xs text-slate-400">{post.readingTime}</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  const headings = extractHeadings(post.content);
  const relatedPosts = getRelatedPosts(post.slug, 2);

  return (
    <div className="relative z-10">
      {/* ── Cover / Header ── */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <Badge className="bg-white/10 text-white/80 border-white/10 text-xs hover:bg-white/15 mb-4">
                {post.category}
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-2 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author + Meta */}
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full ${post.authorColor} flex items-center justify-center text-sm font-semibold text-white ring-2 ring-white/20`}
                >
                  {post.authorInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {post.author}
                    {post.authorRole && (
                      <span className="text-slate-400 font-normal">
                        {" "}
                        &middot; {post.authorRole}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="h-0.5 w-0.5 rounded-full bg-slate-500" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Content + Sidebar ── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-12">
            {/* Main content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 min-w-0 max-w-3xl"
            >
              <div className="blog-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ children, ...props }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      return (
                        <h2 id={id} {...props}>
                          {children}
                        </h2>
                      );
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-12 pt-8 border-t border-slate-100"
                >
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Sticky TOC sidebar — desktop only */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Related Posts ── */}
      {relatedPosts.length > 0 && (
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="border-t border-slate-100 pt-12">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">
                More from the blog
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {relatedPosts.map((rp) => (
                  <RelatedPostCard key={rp.slug} post={rp} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Back to Blog ── */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
