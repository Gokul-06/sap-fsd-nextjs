import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Westernacher SAP FSD Generator",
  description:
    "Insights on AI, SAP, and enterprise innovation from the Westernacher team.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
