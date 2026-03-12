"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const faqs = [
  {
    question: "What SAP modules are supported?",
    answer:
      "We currently support MM (Materials Management), SD (Sales & Distribution), FI (Financial Accounting), CO (Controlling), PP (Production Planning), QM (Quality Management), EWM (Extended Warehouse Management), and TM (Transportation Management). More modules are being added regularly.",
  },
  {
    question: "How does the AI generate specifications?",
    answer:
      "Our 6-agent AI team analyzes your business requirements using enterprise consulting frameworks. Each agent specializes in a different aspect — scope analysis, process mapping, data modeling, authorization, testing, and integration points — then synthesizes everything into a comprehensive FSD.",
  },
  {
    question: "Can I customize the generated documents?",
    answer:
      "Yes! After generation, you can refine any section using our AI-powered chat. You can also create custom templates, add company branding to Word exports, and save frequently used configurations for future documents.",
  },
  {
    question: "How accurate are the generated FSDs?",
    answer:
      "Our AI is trained on SAP best practices and references over 200 SAP objects including tables, transaction codes, Fiori apps, CDS views, and BAPIs. The documents are enterprise-grade and designed to be used directly in SAP implementation projects.",
  },
  {
    question: "What export formats are available?",
    answer:
      "You can export as professional Word documents (.docx) with company branding, table of contents, styled tables, and headers/footers. You can also share documents via secure links with your project team.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All data is encrypted in transit and at rest. Your requirements and generated documents are stored securely and never shared with third parties. We follow enterprise-grade security practices.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`rounded-xl border transition-all duration-300 ${
        isOpen
          ? "bg-white border-sky-200/60 shadow-lg shadow-sky-100/30"
          : "bg-white/60 border-slate-200/40 hover:bg-white hover:border-slate-200"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 text-left group"
      >
        <span
          className={`text-base font-semibold pr-4 transition-colors duration-200 ${
            isOpen ? "text-sky-600" : "text-slate-800 group-hover:text-sky-600"
          }`}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors duration-200 ${
            isOpen ? "bg-sky-50 text-sky-500" : "text-slate-400"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollReveal>
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200/50 px-4 py-1.5 text-xs font-semibold text-sky-600 mb-4">
              <HelpCircle className="h-3 w-3" />
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-slate-500">
              Everything you need to know about the FSD Generator
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                index={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
