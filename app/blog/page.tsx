"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import {
  getAllPosts,
  BLOG_CATEGORIES,
  categoryColorMap,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blog-data";

const easeOut = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeOut },
  }),
};

/* ── Featured Hero Card ── */
function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 sm:p-12 md:p-16 text-white shadow-2xl shadow-sky-900/20 hover:shadow-sky-800/30 transition-shadow duration-500"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-sky-400/5 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Featured label + Category */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-sky-400">
              Featured
            </span>
            <span className="h-1 w-1 rounded-full bg-sky-500/50" />
            <Badge className="bg-white/10 text-white/80 border-white/10 text-xs hover:bg-white/15">
              {post.category}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 group-hover:text-sky-200 transition-colors duration-300">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
            {post.excerpt}
          </p>

          {/* Author + Meta */}
          <div className="flex items-center gap-4">
            {/* Author avatar */}
            <div
              className={`h-10 w-10 rounded-full ${post.authorColor} flex items-center justify-center text-sm font-semibold text-white ring-2 ring-white/20`}
            >
              {post.authorInitials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {post.author}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-slate-500" />
                <span>{post.readingTime}</span>
              </div>
            </div>
          </div>

          {/* Read arrow */}
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="h-6 w-6 text-sky-400" />
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

/* ── Blog List Card ── */
function BlogListCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <motion.article
        whileHover={{
          y: -4,
          transition: { type: "spring", stiffness: 400, damping: 15 },
        }}
        className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md shadow-sky-100/20 hover:shadow-xl hover:shadow-sky-200/30 hover:bg-white/90 transition-all duration-500 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Color accent */}
          <div className="hidden sm:block w-1.5 bg-gradient-to-b from-sky-400 via-sky-300 to-violet-300 rounded-l-2xl flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="p-6 sm:p-8 flex-1 min-w-0">
            {/* Top row: Category + Reading time */}
            <div className="flex items-center gap-3 mb-3">
              <Badge
                className={`${categoryColorMap[post.category]} text-xs`}
              >
                {post.category}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors duration-300 line-clamp-2">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-2">
              {post.excerpt}
            </p>

            {/* Author + Date row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full ${post.authorColor} flex items-center justify-center text-xs font-semibold text-white`}
                >
                  {post.authorInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">
                    {post.author}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Read more arrow */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-sky-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                Read
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<
    BlogCategory | "All"
  >("All");
  const allPosts = getAllPosts();
  const featuredPost = allPosts.find((p) => p.featured);
  const regularPosts = allPosts.filter((p) => !p.featured);
  const filteredPosts =
    activeCategory === "All"
      ? regularPosts
      : regularPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="relative z-10">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8">
        {/* Background glows */}
        <div className="absolute -left-20 -top-10 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet-100/25 blur-3xl animate-float-medium" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-5xl text-center"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl"
          >
            Blog
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 leading-relaxed"
          >
            Thoughts on AI, SAP, and the future of enterprise specifications.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Featured Post ── */}
      {featuredPost && activeCategory === "All" && (
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <FeaturedPost post={featuredPost} />
          </div>
        </section>
      )}

      {/* ── Category Filter + Posts ── */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {(["All", ...BLOG_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeCategory === cat
                    ? "bg-sky-100/80 text-sky-700 border-sky-200 shadow-sm"
                    : "bg-white/60 backdrop-blur-sm text-slate-500 border-white/60 hover:bg-sky-50/80 hover:text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog list */}
          {filteredPosts.length > 0 ? (
            <StaggerContainer
              className="flex flex-col gap-5"
              staggerDelay={0.1}
            >
              {filteredPosts.map((post) => (
                <StaggerItem key={post.slug}>
                  <BlogListCard post={post} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">
                No posts in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
