import { generateGeminiJson } from "../lib/gemini";
import {
  getSystemPromptContent,
  PROMPT_EDITOR_SYSTEM_PROMPT_NAME,
  saveSystemPromptContent,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";
import type {
  ImproveAiManuallyInput,
  ImproveAiManuallyResult,
} from "../models/improveAiManually";

function buildManualEditorSystemPrompt(editorPrompt: string): string {
  return [
    editorPrompt,
    "",
    "---",
    "",
    "### MANUAL EDIT MODE",
    "",
    "If the input contains CURRENT_PROMPT and INSTRUCTIONS instead of the automatic improvement fields, switch to manual edit mode.",
    "In manual edit mode:",
    "- apply only the explicit INSTRUCTIONS",
    "- preserve all unrelated sections verbatim",
    "- do not add extra policies unless the instructions require them",
    '- return the complete updated prompt text in the caller\'s requested JSON schema',
  ].join("\n");
}

export async function improveAiManually(
  input: ImproveAiManuallyInput
): Promise<ImproveAiManuallyResult> {
  const currentPrompt = await getSystemPromptContent(SYSTEM_PROMPT_NAME);
  const editorPrompt = await getSystemPromptContent(
    PROMPT_EDITOR_SYSTEM_PROMPT_NAME
  );

  const result = await generateGeminiJson<{ prompt: string }>(
    buildManualEditorSystemPrompt(editorPrompt),
    [
      "CURRENT_PROMPT:",
      currentPrompt,
      "",
      "---",
      "",
      "INSTRUCTIONS:",
      input.instructions,
    ].join("\n"),
    {
      type: "OBJECT",
      properties: {
        prompt: {
          type: "STRING",
        },
      },
      required: ["prompt"],
    }
  );

  if (typeof result.prompt !== "string" || result.prompt.trim().length === 0) {
    throw new Error(
      "Manual prompt editor response did not include a non-empty prompt."
    );
  }

  const updatedPrompt = await saveSystemPromptContent(
    result.prompt,
    SYSTEM_PROMPT_NAME
  );

  return {
    updatedPrompt,
  };
}
