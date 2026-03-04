import { generateGeminiJsonReply } from "../lib/gemini";
import { getSystemPromptContent } from "../lib/systemPrompts";
import type { GeminiTestInput, GeminiTestResult } from "../models/gemini.model";

export async function runGeminiTest(
  input: GeminiTestInput
): Promise<GeminiTestResult> {
  const promptOverride = input.systemPrompt?.trim();
  const message = input.message.trim();

  const activeSystemPrompt =
    promptOverride && promptOverride.length > 0
      ? promptOverride
      : await getSystemPromptContent();

  const reply = await generateGeminiJsonReply(activeSystemPrompt, message);

  return {
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    promptSource:
      promptOverride && promptOverride.length > 0 ? "request" : "database",
    reply,
  };
}
