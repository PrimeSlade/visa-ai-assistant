import type { ChatHistoryItem } from "./chat.model";

export type ImproveAiRequestBody = {
  clientSequence?: unknown;
  chatHistory?: unknown;
  consultantReply?: unknown;
};

export type ImproveAiInput = {
  clientSequence: string;
  chatHistory: ChatHistoryItem[];
  consultantReply: string;
};

export type ImproveAiResult = {
  predictedReply: string;
  updatedPrompt: string;
};

export type PromptEditorDiagnosis = {
  dimension: string;
  observation: string;
  root_cause_category: string;
  current_prompt_location: string;
  edit: string;
  rationale: string;
};

export type PromptEditorResult = {
  diagnosis: PromptEditorDiagnosis[];
  prompt: string;
};

export type ImproveAiManuallyRequestBody = {
  instructions?: unknown;
};

export type ImproveAiManuallyInput = {
  instructions: string;
};

export type ImproveAiManuallyResult = {
  updatedPrompt: string;
};
