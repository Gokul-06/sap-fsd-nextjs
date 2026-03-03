"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
            SAP specifications that write themselves.
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
              Try it on your next project today.
            </span>
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Link
              href="/generate"
              className="group inline-flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.04] btn-shimmer overflow-hidden relative"
            >
              Generate New FSD
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
