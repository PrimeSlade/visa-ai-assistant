export type GeminiTestRequestBody = {
  message?: unknown;
  systemPrompt?: unknown;
};

export type GeminiTestInput = {
  message: string;
  systemPrompt?: string;
};

export type GeminiTestResult = {
  model: string;
  promptSource: "database" | "request";
  reply: string;
};
