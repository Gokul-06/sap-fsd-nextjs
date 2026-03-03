"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
      "Our 6-agent AI team analyzes your business requirements using McKinsey consulting frameworks. Each agent specializes in a different aspect — scope analysis, process mapping, data modeling, authorization, testing, and integration points — then synthesizes everything into a comprehensive FSD.",
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

function FaqItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-sky-600 group"
      >
        <span className="text-base font-medium text-slate-800 group-hover:text-sky-600 transition-colors pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
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
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollReveal>
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-12">
            Frequently asked questions
          </h2>

          <div>
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
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
