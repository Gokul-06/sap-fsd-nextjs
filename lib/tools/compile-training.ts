// ─────────────────────────────────────────────
// Compile Training: AI-powered personality prompt generator
// Takes questionnaire answers and distills them into
// a concise personality instruction for each agent.
// Uses the multi-provider AI abstraction layer.
// ─────────────────────────────────────────────

import { getProvider } from "@/lib/ai/provider";

export async function compilePersonalityPrompt(
  agentRole: string,
  expertName: string,
  questionnaire: Record<string, string>,
): Promise<string> {
  const qaPairs = Object.entries(questionnaire)
    .map(([q, a], i) => `Q${i + 1}: ${q}\nA${i + 1}: ${a}`)
    .join("\n\n");

  const prompt = `You are an expert prompt engineer. Analyze the following interview answers from an SAP expert named "${expertName}" (role: ${agentRole}) and create a concise PERSONALITY INSTRUCTION (max 400 words) that captures:

1. Their thinking style and decision-making approach
2. Their priorities and what they always focus on
3. Their writing conventions and tone preferences
4. Their domain-specific expertise and biases
5. Their signature patterns that distinguish their work

Format the output as direct second-person instructions that can be injected into an AI agent's system prompt. Start with "You think and write like ${expertName}." and then list their key traits as actionable instructions.

Do NOT include generic SAP advice. Only include specific patterns from their answers.

---

INTERVIEW ANSWERS:

${qaPairs}

---

Return ONLY the personality instruction text. No explanations, no headers, no markdown formatting.`;

  const provider = getProvider();
  const response = await provider.complete({
    messages: [{ role: "user", content: prompt }],
    maxTokens: 1024,
  });

  if (!response.text) {
    throw new Error("Failed to compile personality prompt — no text response");
  }

  return response.text.trim();
}
