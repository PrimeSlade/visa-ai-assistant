type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GeminiSchema = {
  type: string;
  properties?: Record<string, GeminiSchema>;
  items?: GeminiSchema;
  required?: string[];
};

type GeminiReplyPayload = {
  reply?: unknown;
  message?: unknown;
  response?: unknown;
  text?: unknown;
};

export function extractJson<T>(text: string): T {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Model response did not contain valid JSON.");
    }

    return JSON.parse(match[0]) as T;
  }
}

async function generateGeminiText(
  systemPrompt: string,
  userPrompt: string,
  responseSchema?: GeminiSchema
): Promise<string> {
  const apiKey = process.env.GEMINI_API;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API environment variable.");
  }

  const generationConfig: Record<string, unknown> = {
    temperature: 0.4,
    responseMimeType: "application/json",
  };

  if (responseSchema) {
    generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig,
      }),
    }
  );

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Gemini API request failed.");
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return text;
}

export async function generateGeminiJson<T>(
  systemPrompt: string,
  userPrompt: string,
  responseSchema?: GeminiSchema
): Promise<T> {
  const text = await generateGeminiText(
    systemPrompt,
    userPrompt,
    responseSchema
  );

  return extractJson<T>(text);
}

function normalizeReply(parsed: GeminiReplyPayload): string {
  const candidate =
    parsed.reply ?? parsed.message ?? parsed.response ?? parsed.text;

  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate.trim();
  }

  throw new Error("Gemini response JSON did not include a string reply.");
}

export async function generateGeminiJsonReply(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const text = await generateGeminiText(systemPrompt, userPrompt, {
    type: "OBJECT",
    properties: {
      reply: {
        type: "STRING",
      },
    },
    required: ["reply"],
  });

  const parsed = extractJson<GeminiReplyPayload>(text);
  return normalizeReply(parsed);
}
