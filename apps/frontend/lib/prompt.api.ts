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
