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
  ImproveAiResult,
  PromptEditorResult,
} from "../models/improveAi";
import { generateReply } from "./generateReplyService";

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

export async function improveAi(
  input: ImproveAiInput
): Promise<ImproveAiResult> {
  //retrieve prompt from db
  const currentPrompt = await getSystemPromptContent(SYSTEM_PROMPT_NAME);

  //generate reply
  const replyResult = await generateReply({
    clientSequence: input.clientSequence,
    chatHistory: input.chatHistory,
  });

  const predictedReply = replyResult.aiReply;

  //rengen prompt
  const promptUpdate = await runPromptEditor(
    currentPrompt,
    input,
    predictedReply
  );

  //update prompt in db
  const updatedPrompt = await saveSystemPromptContent(
    promptUpdate.prompt,
    SYSTEM_PROMPT_NAME
  );

  return {
    predictedReply,
    updatedPrompt,
  };
}
