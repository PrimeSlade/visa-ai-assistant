import type { BudgetConversationRecord } from "@/lib/prompt.api";

export const BUDGET_DRAFT_STORAGE_KEY = "improve-ai-budget-draft-v1";

export type PromptDiffLine = {
  type: "same" | "add" | "remove";
  value: string;
};

export function clearBudgetDraftStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BUDGET_DRAFT_STORAGE_KEY);
}

export function safeParseConversations(
  jsonText: string
): BudgetConversationRecord[] {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of conversation records.");
  }

  return parsed as BudgetConversationRecord[];
}

export function buildPromptDiff(
  oldPrompt: string,
  proposedPrompt: string
): PromptDiffLine[] {
  const oldLines = oldPrompt.split("\n");
  const newLines = proposedPrompt.split("\n");
  const maxLength = Math.max(oldLines.length, newLines.length);
  const result: PromptDiffLine[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const oldLine = oldLines[index];
    const newLine = newLines[index];

    if (oldLine === newLine && oldLine !== undefined) {
      result.push({ type: "same", value: oldLine });
      continue;
    }

    if (oldLine !== undefined) {
      result.push({ type: "remove", value: oldLine });
    }

    if (newLine !== undefined) {
      result.push({ type: "add", value: newLine });
    }
  }

  return result;
}
