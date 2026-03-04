import { formatChatHistory } from "../lib/chatHistory";
import { generateGeminiJson } from "../lib/gemini";
import {
  getSystemPromptContent,
  PROMPT_EDITOR_SYSTEM_PROMPT_NAME,
  saveSystemPromptContent,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";
import type {
  ImproveAiInput,
  ImproveAiManuallyInput,
  ImproveAiManuallyResult,
  ImproveAiResult,
  PromptEditorResult,
} from "../models/prompt.model";
import { generateReply } from "./chat.service";

async function runPromptEditor(
  currentPrompt: string,
  input: ImproveAiInput,
  predictedReply: string
): Promise<PromptEditorResult> {
  const editorPrompt = await getSystemPromptContent(
    PROMPT_EDITOR_SYSTEM_PROMPT_NAME
  );

  const result = await generateGeminiJson<PromptEditorResult>(
    editorPrompt,
    [
      "CURRENT_PROMPT:",
      currentPrompt,
      "",
      "---",
      "",
      "CHAT_HISTORY:",
      formatChatHistory(input.chatHistory, "editor"),
      "",
      "---",
      "",
      "CLIENT_SEQUENCE:",
      `[Client]: ${input.clientSequence}`,
      "",
      "---",
      "",
      "REAL_REPLY:",
      input.consultantReply,
      "",
      "---",
      "",
      "AI_REPLY:",
      predictedReply,
    ].join("\n"),
    {
      type: "OBJECT",
      properties: {
        diagnosis: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              dimension: { type: "STRING" },
              observation: { type: "STRING" },
              root_cause_category: { type: "STRING" },
              current_prompt_location: { type: "STRING" },
              edit: { type: "STRING" },
              rationale: { type: "STRING" },
            },
            required: [
              "dimension",
              "observation",
              "root_cause_category",
              "current_prompt_location",
              "edit",
              "rationale",
            ],
          },
        },
        prompt: {
          type: "STRING",
        },
      },
      required: ["diagnosis", "prompt"],
    }
  );

  if (!Array.isArray(result.diagnosis)) {
    throw new Error(
      "Prompt editor response did not include a diagnosis array."
    );
  }

  if (typeof result.prompt !== "string" || result.prompt.trim().length === 0) {
    throw new Error(
      "Prompt editor response did not include a non-empty prompt."
    );
  }

  return result;
}

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

export async function improveAi(
  input: ImproveAiInput
): Promise<ImproveAiResult> {
  const currentPrompt = await getSystemPromptContent(SYSTEM_PROMPT_NAME);
  const replyResult = await generateReply({
    clientSequence: input.clientSequence,
    chatHistory: input.chatHistory,
  });
  const predictedReply = replyResult.aiReply;
  const promptUpdate = await runPromptEditor(
    currentPrompt,
    input,
    predictedReply
  );
  const updatedPrompt = await saveSystemPromptContent(
    promptUpdate.prompt,
    SYSTEM_PROMPT_NAME
  );

  return {
    predictedReply,
    updatedPrompt,
  };
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
