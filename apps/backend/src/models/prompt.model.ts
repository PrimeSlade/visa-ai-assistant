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

export type BudgetConversationMessage = {
  message_id: number;
  direction: "in" | "out";
  text: string;
  timestamp: number;
};

export type BudgetConversationRecord = {
  contact_id?: string;
  scenario?: string;
  conversation?: BudgetConversationMessage[];
};

export type ImproveAiBudgetRequestBody = {
  conversations?: unknown;
  similarityThreshold?: unknown;
};

export type ImproveAiBudgetInput = {
  conversations: BudgetConversationRecord[];
  similarityThreshold: number;
};

export type BudgetCategory = "eligibility" | "location" | "documents";

export type BudgetExampleEvaluation = {
  category: BudgetCategory;
  contactId: string;
  clientSequence: string;
  consultantReply: string;
  predictedReply: string;
  similarityScore: number;
  similarEnough: boolean;
};

export type ImproveAiBudgetResult = {
  shouldUpdatePrompt: boolean;
  reason: string;
  oldPrompt: string;
  proposedPrompt: string | null;
  selectedExamples: BudgetExampleEvaluation[];
  apiUsage: {
    predictionCalls: number;
    editorCalls: number;
    total: number;
  };
  budgetPolicy: {
    sampleCount: number;
    maxEditorCalls: number;
    maxTotalGeminiCalls: number;
    threshold: number;
    keywordQuota: Record<BudgetCategory, number>;
  };
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

export type AdminPromptResult = {
  name: string;
  prompt: string;
  version: number;
  lastUpdated: string;
  source: string;
};

export type UpdateConsultantPromptRequestBody = {
  prompt?: unknown;
};

export type UpdateConsultantPromptInput = {
  prompt: string;
};
