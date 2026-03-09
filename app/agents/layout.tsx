import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Hub | Westernacher SAP FSD Generator",
  description:
    "Meet the 6 specialized AI agents that power enterprise-grade SAP specification generation.",
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
