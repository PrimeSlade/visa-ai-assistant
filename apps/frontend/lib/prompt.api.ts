import { apiClient } from "./api-client";

type ApiSuccessResponse<T> = {
  status: "success";
  code: number;
  message: string;
  data: T;
};

export type AdminPromptResponse = {
  name: string;
  prompt: string;
  version: number;
  lastUpdated: string;
  source: string;
};

export async function getAdminPrompt(): Promise<AdminPromptResponse> {
  try {
    const { data } = await apiClient.get<
      ApiSuccessResponse<AdminPromptResponse>
    >("/admin/prompts");

    return data.data;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to fetch admin prompt.");
  }
}

export type UpdateConsultantPromptRequest = {
  prompt: string;
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

export type ImproveAiBudgetRequest = {
  conversations: BudgetConversationRecord[];
  similarityThreshold?: number;
};

export type ImproveAiBudgetResponse = {
  shouldUpdatePrompt: boolean;
  reason: string;
  oldPrompt: string;
  proposedPrompt: string | null;
  selectedExamples: Array<{
    category: "eligibility" | "location" | "documents";
    contactId: string;
    clientSequence: string;
    consultantReply: string;
    predictedReply: string;
    similarityScore: number;
    similarEnough: boolean;
  }>;
  apiUsage: {
    predictionCalls: number;
    editorCalls: number;
    total: number;
  };
};

export async function updateConsultantPrompt(
  input: UpdateConsultantPromptRequest
): Promise<AdminPromptResponse> {
  try {
    if (
      !input ||
      typeof input !== "object" ||
      typeof input.prompt !== "string" ||
      input.prompt.trim().length === 0
    ) {
      throw new Error(
        "Invalid request payload. Expected an object like { prompt: string }."
      );
    }

    const { data } = await apiClient.patch<
      ApiSuccessResponse<AdminPromptResponse>
    >("/admin/prompts/consultant", input);

    return data.data;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to update consultant prompt.");
  }
}

export async function improveAiBudget(
  input: ImproveAiBudgetRequest
): Promise<ImproveAiBudgetResponse> {
  try {
    if (!input || typeof input !== "object" || !Array.isArray(input.conversations)) {
      throw new Error(
        "Invalid request payload. Expected an object like { conversations: [...] }."
      );
    }

    const { data } = await apiClient.post<ApiSuccessResponse<ImproveAiBudgetResponse>>(
      "/improve-ai-budget",
      input
    );

    return data.data;
  } catch (error: any) {
    throw new Error(error.message ?? "Failed to run budget improve AI.");
  }
}
