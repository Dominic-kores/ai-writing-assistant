import { z } from "zod";

// Validate incoming API requests
export const transformSchema = z.object({
  text: z.string().trim().min(1).max(15000),

  operation: z.enum([
    "summarize",
    "expand",
    "change-tone",
    "translate",
    "fix-grammar",
    "social-media",
    "paraphrase",
  ]),

  provider: z.enum(["anthropic", "openai"])
    .default("openai"),

  options: z.object({
    length: z.enum(["short", "medium", "long"]).optional(),

    tone: z.enum([
      "formal",
      "casual",
      "professional",
      "friendly",
    ]).optional(),

    language: z.enum([
      "english",
      "swahili",
      "french",
    ]).optional(),

    platform: z.enum([
      "twitter",
      "linkedin",
      "instagram",
    ]).optional(),
  }).default({}),

  customPrompt: z.string().trim().max(5000).optional(),
});

// Validate the AI-generated grammar response
const grammarSchema = z.object({
  correctedText: z.string().min(1),
  changes: z.array(z.string()),
});

export function parseGrammarOutput(rawText) {
  try {
    // Remove unwanted Markdown code fences
    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(cleaned);

    return grammarSchema.parse(parsed);
  } catch {
    const error = new Error(
      "The AI returned an invalid grammar response. Please try again."
    );

    error.status = 502;
    throw error;
  }
}

export function formatResult(result, operation) {
  if (!result.text?.trim()) {
    const error = new Error("The AI returned an empty response");
    error.status = 502;
    throw error;
  }

  if (operation === "fix-grammar") {
    const structured = parseGrammarOutput(result.text);

    return {
      ...result,
      text: structured.correctedText,
      changes: structured.changes,
    };
  }

  return result;
}