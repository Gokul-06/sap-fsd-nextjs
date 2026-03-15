export type BlogCategory =
  | "AI"
  | "SAP"
  | "Innovation"
  | "Engineering"
  | "Product Updates";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string;
  authorInitials: string;
  authorColor: string;
  date: string;
  readingTime: string;
  category: BlogCategory;
  tags: string[];
  featured?: boolean;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "AI",
  "SAP",
  "Innovation",
  "Engineering",
  "Product Updates",
];

export const categoryColorMap: Record<BlogCategory, string> = {
  AI: "bg-violet-100 text-violet-700 border-0",
  SAP: "bg-blue-100 text-blue-700 border-0",
  Innovation: "bg-emerald-100 text-emerald-700 border-0",
  Engineering: "bg-amber-100 text-amber-700 border-0",
  "Product Updates": "bg-sky-100 text-sky-700 border-0",
};

function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "multi-agent-ai-sap-specifications",
    title: "How Multi-Agent AI Systems Generate Enterprise SAP Specifications",
    excerpt:
      "A deep dive into the architecture: 6 specialized AI agents, a 4-phase pipeline, shared context, cross-critique, and RICEFW-aware section generation.",
    content: `## Why a Multi-Agent Architecture?

A single AI model, no matter how powerful, struggles with complex SAP specifications. It loses context over long documents, mixes up module-specific terminology, and can't self-review its own output. The solution: break the problem into specialized roles — just like a real consulting team.

## The 6-Agent Team

Each agent has a defined role, a specific system prompt, and access to SAP-domain knowledge:

1. **Project Director** — Reads the user's requirements, classifies the SAP module, identifies cross-module impacts, and produces a structured brief that all other agents share as their single source of truth
2. **Business Analyst** — Writes the executive summary, business background, and scoping sections. Trained to reference the user's exact input — not generic boilerplate
3. **Solution Architect** — Designs the To-Be process flow, maps SAP transactions/Fiori apps, and produces design decision tables. Has access to the SAP object registry (tables, BAPIs, tcodes)
4. **Technical Consultant** — Generates error handling matrices, input validations, and business rule tables. Focuses on edge cases the user might not think of
5. **Project Manager** — Builds migration object lists, cutover task tables, and rollback plans. Understands load sequencing and reconciliation
6. **BPMN Architect** — Produces Signavio-compatible BPMN 2.0 process diagrams as structured JSON with swim lanes, gateways, and SAP transaction references

## The 4-Phase Pipeline

The agents follow a strict orchestration pattern:

- **Phase 1 — Analysis**: The Project Director creates a shared context (module strategy, process steps, design decisions, terminology glossary, risk areas). This prevents agents from contradicting each other
- **Phase 2 — Parallel Generation**: All 5 specialists work simultaneously, each writing their assigned sections. Parallel execution keeps total generation time under 30 seconds
- **Phase 2.5 — Cross-Critique**: Each agent reviews other agents' sections and flags inconsistencies (e.g., the Solution Architect references a table that the Technical Consultant's error handling doesn't cover)
- **Phase 3 — Quality Review**: A final consistency check across all 14 sections ensures terminology, module references, and process flows are aligned

## Key Design Principles

- **Shared Context, Not Shared Prompts**: Every agent receives the Project Director's brief, ensuring alignment without duplicating the entire prompt
- **Domain-Specific Training**: Each agent has access to curated SAP knowledge — module-specific tables, transactions, Fiori apps, and best practices from the Westernacher consulting framework
- **User Input Priority**: The user's requirements are always the primary source. Agents are instructed to reference specific user input rather than generating generic content
- **RICEFW-Aware**: The system adapts its output structure based on the FSD type — Enhancement, Interface, Report, Form, Conversion, or Workflow — each with type-specific sections based on Westernacher's FS Section Mapping

## What Makes This Different

Traditional AI document generation uses a single prompt and hopes for the best. Our approach mirrors how a real consulting team operates: specialized roles, shared context, peer review, and quality gates. The result is a document that reads like it was written by a team of senior SAP consultants — because architecturally, it was.`,
    author: "Gokul Palanisamy",
    authorRole: "Consultant",
    authorInitials: "GP",
    authorColor: "bg-sky-500",
    date: "2026-03-08",
    readingTime: "4 min read",
    category: "AI",
    tags: ["Multi-Agent", "AI", "SAP", "FSD", "Automation"],
    featured: true,
  },
  {
    slug: "azure-ai-foundry-multi-provider-support",
    title: "Supporting Multiple AI Providers: From Anthropic to Azure AI Foundry",
    excerpt:
      "How we built a provider abstraction layer that lets enterprises switch between Anthropic Claude, Azure AI Foundry, OpenAI, and Azure OpenAI with a single environment variable.",
    content: `## Why Multi-Provider Support Matters

Enterprise deployments often have strict requirements about where AI models run. Some clients need Azure-hosted models for data sovereignty, others prefer direct API access for cost optimization.

## The Challenge

Our app was originally built with the Anthropic SDK hardcoded into every AI call. To support different providers, we needed to rewire the entire AI layer — without breaking any existing functionality.

## Our Approach: Adapter Pattern

We created a provider abstraction layer with four adapters:

- **Anthropic** — Direct Claude API access
- **Azure AI Foundry** — Claude models hosted on Microsoft Azure
- **OpenAI** — GPT-4o and other OpenAI models
- **Azure OpenAI** — OpenAI models on Azure infrastructure

Each adapter implements the same interface, so switching providers is just changing one environment variable.

## Zero Code Changes Required

The beauty of this architecture is that all 16+ AI functions — from executive summaries to test scenario generation — call a single \`callClaude()\` function. By rewiring just this one function to use our provider factory, the entire app automatically works with any supported provider.

## Document Vision Support

One key difference: only Anthropic and Azure AI Foundry support document uploads (PDF/DOCX extraction). For OpenAI providers, we show a clear error message explaining the limitation.

## Try It Yourself

Set \`AI_PROVIDER=azure-anthropic\` and provide your Azure AI Foundry endpoint — the app handles everything else automatically.`,
    author: "Gokul Palanisamy",
    authorRole: "Consultant",
    authorInitials: "GP",
    authorColor: "bg-sky-500",
    date: "2026-03-06",
    readingTime: "3 min read",
    category: "Engineering",
    tags: ["Azure", "Multi-Provider", "Architecture", "Claude", "OpenAI"],
  },
  {
    slug: "ai-secret-weapon-consulting-daily-work",
    title: "AI Is My Secret Weapon at Work — Here's How I Use It Every Day",
    excerpt:
      "From researching clients to decoding SAP scope items, AI has become an indispensable part of daily consulting work at Westernacher.",
    content: `## The Everyday AI Advantage

AI is kind of a secret weapon at work. Whether it's digging up info on a new customer or just trying to get thoughts onto the page without sounding like a robot — AI is there, every single day.

## Building the Full Picture

Picture this: pulling together a complete picture of a client's business just by surfing through public data. It's a bit like detective work, minus the trench coat. Walking into meetings already knowing what's what, thanks to AI-powered research sessions — that's the kind of edge that makes a real difference.

## The SAP Rabbit Holes

And let's not forget the SAP rabbit holes. If there's a tricky scope item ID that needs decoding, or you need to make sense of the wild results from an S/4HANA Readiness check, AI is the go-to sidekick.

Sure, sometimes it goes off on a tangent — those AI "hallucinations" are real. But trusting your gut and your knowledge to reel things back in is what makes the combo work. AI doesn't replace expertise — it amplifies it.

## Faster, Sharper, More Prepared

Honestly, it's made consultants faster, sharper, and gives them a way to show up way more prepared. The key is knowing when to trust the AI and when to apply your own judgment.

## Tips for Getting Started

- **Start small** — Use AI for research and summarization before meetings
- **Verify always** — Cross-check AI outputs against your domain knowledge
- **Iterate** — Refine your prompts based on what works for your workflow
- **Stay curious** — Experiment with new use cases regularly`,
    author: "Gokul Palanisamy",
    authorRole: "Consultant",
    authorInitials: "GP",
    authorColor: "bg-sky-500",
    date: "2026-03-01",
    readingTime: "3 min read",
    category: "AI",
    tags: ["AI", "Consulting", "Productivity", "SAP", "Daily Work"],
  },
];

// Ensure reading times are calculated
BLOG_POSTS.forEach((post) => {
  if (!post.readingTime) {
    post.readingTime = calculateReadingTime(post.content);
  }
});

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(
  currentSlug: string,
  limit: number = 2
): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit);
}

export function extractHeadings(
  content: string
): { id: string; text: string }[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: { id: string; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text });
  }
  return headings;
}
