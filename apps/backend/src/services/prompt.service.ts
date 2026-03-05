import { formatChatHistory } from "../lib/chatHistory";
import { generateGeminiJson } from "../lib/gemini";
import { HttpError } from "../lib/errors";
import {
  getSystemPromptContent,
  PROMPT_EDITOR_SYSTEM_PROMPT_NAME,
  saveSystemPromptContent,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";
import prisma from "../lib/prisma";
import type {
  AdminPromptResult,
  BudgetCategory,
  BudgetConversationMessage,
  BudgetConversationRecord,
  BudgetExampleEvaluation,
  ImproveAiBudgetInput,
  ImproveAiBudgetResult,
  ImproveAiInput,
  ImproveAiManuallyInput,
  ImproveAiManuallyResult,
  ImproveAiResult,
  PromptEditorResult,
  UpdateConsultantPromptInput,
} from "../models/prompt.model";
import { generateReply } from "./chat.service";

type MessageBlock = {
  direction: "in" | "out";
  messages: BudgetConversationMessage[];
};

type ExtractedSequence = {
  contactId: string;
  precedingChatHistory: MessageBlock[];
  clientSequence: BudgetConversationMessage[];
  consultantSequenceReply: BudgetConversationMessage[];
};

const KEYWORD_QUOTA: Record<BudgetCategory, number> = {
  eligibility: 1,
  location: 1,
  documents: 1,
};

const BUDGET_SAMPLE_COUNT = 3;
const MAX_EDITOR_CALLS = 1;
const MAX_TOTAL_GEMINI_CALLS = 4;

const KEYWORDS: Record<BudgetCategory, string[]> = {
  eligibility: [
    "eligible",
    "eligibility",
    "qualify",
    "qualification",
    "requirement",
    "requirements",
    "criteria",
    "can i",
    "am i",
    "มีสิทธิ์",
    "คุณสมบัติ",
  ],
  location: [
    "location",
    "where",
    "country",
    "city",
    "bangkok",
    "thailand",
    "embassy",
    "consulate",
    "apply in",
    "where can i apply",
    "ที่ไหน",
    "สถานที่",
  ],
  documents: [
    "document",
    "documents",
    "paper",
    "papers",
    "bank statement",
    "proof",
    "evidence",
    "passport copy",
    "form",
    "เอกสาร",
    "หลักฐาน",
  ],
};

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
    "- return the complete updated prompt text in the caller's requested JSON schema",
  ].join("\n");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarityScore(
  predictedReply: string,
  consultantReply: string
): number {
  const predicted = normalizeText(predictedReply);
  const consultant = normalizeText(consultantReply);

  if (!predicted || !consultant) {
    return 0;
  }

  if (predicted === consultant) {
    return 1;
  }

  const predictedTokens = predicted.split(" ");
  const consultantTokens = consultant.split(" ");

  const consultantTokenCounts = new Map<string, number>();
  for (const token of consultantTokens) {
    consultantTokenCounts.set(
      token,
      (consultantTokenCounts.get(token) ?? 0) + 1
    );
  }

  let intersection = 0;
  for (const token of predictedTokens) {
    const count = consultantTokenCounts.get(token) ?? 0;
    if (count > 0) {
      intersection += 1;
      consultantTokenCounts.set(token, count - 1);
    }
  }

  const diceScore =
    (2 * intersection) /
    Math.max(predictedTokens.length + consultantTokens.length, 1);

  return Number(diceScore.toFixed(4));
}

function validateConversations(
  conversations: BudgetConversationRecord[]
): BudgetConversationRecord[] {
  return conversations.map((record, recordIndex) => {
    if (typeof record !== "object" || record === null) {
      throw new Error(`conversations[${recordIndex}] must be an object.`);
    }

    const conversation = Array.isArray(record.conversation)
      ? record.conversation
      : [];

    const sanitizedConversation = conversation
      .filter((item) => typeof item === "object" && item !== null)
      .map((item, messageIndex) => {
        const message = item as BudgetConversationMessage;
        if (message.direction !== "in" && message.direction !== "out") {
          throw new Error(
            `conversations[${recordIndex}].conversation[${messageIndex}].direction must be "in" or "out".`
          );
        }

        if (
          typeof message.text !== "string" ||
          message.text.trim().length === 0
        ) {
          throw new Error(
            `conversations[${recordIndex}].conversation[${messageIndex}].text must be a non-empty string.`
          );
        }

        return {
          message_id: Number(message.message_id ?? messageIndex + 1),
          direction: message.direction,
          text: message.text.trim(),
          timestamp: Number(message.timestamp ?? 0),
        } as BudgetConversationMessage;
      });

    return {
      contact_id:
        typeof record.contact_id === "string" ? record.contact_id : "unknown",
      scenario:
        typeof record.scenario === "string" ? record.scenario : undefined,
      conversation: sanitizedConversation,
    };
  });
}

function groupByDirection(
  conversation: BudgetConversationMessage[]
): MessageBlock[] {
  if (conversation.length === 0) {
    return [];
  }

  const blocks: MessageBlock[] = [];
  let currentDirection = conversation[0].direction;
  let currentBlock: BudgetConversationMessage[] = [];

  for (const message of conversation) {
    if (message.direction === currentDirection) {
      currentBlock.push(message);
      continue;
    }

    blocks.push({
      direction: currentDirection,
      messages: currentBlock,
    });
    currentDirection = message.direction;
    currentBlock = [message];
  }

  if (currentBlock.length > 0) {
    blocks.push({
      direction: currentDirection,
      messages: currentBlock,
    });
  }

  return blocks;
}

function extractSequences(
  conversations: BudgetConversationRecord[]
): ExtractedSequence[] {
  const sequences: ExtractedSequence[] = [];

  for (const record of conversations) {
    const blocks = groupByDirection(record.conversation ?? []);
    const history: MessageBlock[] = [];

    for (let index = 0; index < blocks.length - 1; index += 1) {
      const currentBlock = blocks[index];
      const nextBlock = blocks[index + 1];

      if (currentBlock.direction === "in" && nextBlock.direction === "out") {
        sequences.push({
          contactId: record.contact_id ?? "unknown",
          precedingChatHistory: [...history],
          clientSequence: currentBlock.messages,
          consultantSequenceReply: nextBlock.messages,
        });
      }

      history.push(currentBlock);
    }
  }

  return sequences;
}

function sequenceText(sequence: ExtractedSequence): string {
  return sequence.clientSequence.map((message) => message.text).join(" ");
}

function belongsToCategory(
  sequence: ExtractedSequence,
  category: BudgetCategory
): boolean {
  const normalized = normalizeText(sequenceText(sequence));
  return KEYWORDS[category].some((keyword) =>
    normalized.includes(normalizeText(keyword))
  );
}

function selectBudgetExamples(sequences: ExtractedSequence[]): Array<{
  category: BudgetCategory;
  sequence: ExtractedSequence;
}> {
  const selected: Array<{
    category: BudgetCategory;
    sequence: ExtractedSequence;
  }> = [];
  const usedIndices = new Set<number>();

  const categories: BudgetCategory[] = ["eligibility", "location", "documents"];
  for (const category of categories) {
    let pickedForCategory = 0;

    for (let index = 0; index < sequences.length; index += 1) {
      if (usedIndices.has(index)) {
        continue;
      }

      if (!belongsToCategory(sequences[index], category)) {
        continue;
      }

      selected.push({
        category,
        sequence: sequences[index],
      });
      usedIndices.add(index);
      pickedForCategory += 1;

      if (pickedForCategory >= KEYWORD_QUOTA[category]) {
        break;
      }
    }
  }

  if (selected.length < BUDGET_SAMPLE_COUNT) {
    const fallbackCategories: BudgetCategory[] = [
      "eligibility",
      "location",
      "documents",
    ];

    for (let index = 0; index < sequences.length; index += 1) {
      if (usedIndices.has(index)) {
        continue;
      }

      selected.push({
        category:
          fallbackCategories[selected.length % fallbackCategories.length],
        sequence: sequences[index],
      });
      usedIndices.add(index);

      if (selected.length >= BUDGET_SAMPLE_COUNT) {
        break;
      }
    }
  }

  if (selected.length < BUDGET_SAMPLE_COUNT) {
    throw new HttpError(
      400,
      "Not enough training examples to select 3 samples (eligibility/location/documents)."
    );
  }

  return selected.slice(0, BUDGET_SAMPLE_COUNT);
}

function toChatHistory(history: MessageBlock[]): ImproveAiInput["chatHistory"] {
  return history.flatMap((block) =>
    block.messages.map((message) => ({
      role: block.direction === "out" ? "consultant" : "client",
      message: message.text,
    }))
  );
}

function toImproveAiInput(sequence: ExtractedSequence): ImproveAiInput {
  return {
    clientSequence: sequence.clientSequence
      .map((message) => message.text)
      .join("\n"),
    chatHistory: toChatHistory(sequence.precedingChatHistory),
    consultantReply: sequence.consultantSequenceReply
      .map((message) => message.text)
      .join("\n"),
  };
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

export async function improveAiBudget(
  input: ImproveAiBudgetInput
): Promise<ImproveAiBudgetResult> {
  const conversations = validateConversations(input.conversations);
  const sequences = extractSequences(conversations);
  const selected = selectBudgetExamples(sequences);
  const oldPrompt = await getSystemPromptContent(SYSTEM_PROMPT_NAME);

  const selectedExamples: BudgetExampleEvaluation[] = [];
  let predictionCalls = 0;

  for (const item of selected) {
    const improveInput = toImproveAiInput(item.sequence);
    const replyResult = await generateReply({
      clientSequence: improveInput.clientSequence,
      chatHistory: improveInput.chatHistory,
    });

    predictionCalls += 1;
    const similarityScore = calculateSimilarityScore(
      replyResult.aiReply,
      improveInput.consultantReply
    );
    const similarEnough = similarityScore >= input.similarityThreshold;

    selectedExamples.push({
      category: item.category,
      contactId: item.sequence.contactId,
      clientSequence: improveInput.clientSequence,
      consultantReply: improveInput.consultantReply,
      predictedReply: replyResult.aiReply,
      similarityScore,
      similarEnough,
    });
  }

  const firstFailedExample = selectedExamples.find(
    (example) => !example.similarEnough
  );

  let editorCalls = 0;
  let proposedPrompt: string | null = null;
  let reason =
    "All selected examples are similar enough. Prompt update skipped. Your prompt reached max level.";

  if (firstFailedExample) {
    const failedItem = selected.find(
      (item) =>
        item.category === firstFailedExample.category &&
        item.sequence.contactId === firstFailedExample.contactId &&
        item.sequence.clientSequence
          .map((message) => message.text)
          .join("\n") === firstFailedExample.clientSequence
    );

    if (!failedItem) {
      throw new Error("Failed to map a failing sample for prompt editing.");
    }

    const failedInput = toImproveAiInput(failedItem.sequence);
    const promptUpdate = await runPromptEditor(
      oldPrompt,
      failedInput,
      firstFailedExample.predictedReply
    );

    editorCalls = 1;
    proposedPrompt = promptUpdate.prompt;
    reason =
      "At least one selected example was below threshold. Returning proposed prompt draft for approval.";
  }

  const total = predictionCalls + editorCalls;
  if (total > MAX_TOTAL_GEMINI_CALLS) {
    throw new Error("Budget cap exceeded: total Gemini calls cannot exceed 4.");
  }

  return {
    shouldUpdatePrompt: proposedPrompt !== null,
    reason,
    oldPrompt,
    proposedPrompt,
    selectedExamples,
    apiUsage: {
      predictionCalls,
      editorCalls,
      total,
    },
    budgetPolicy: {
      sampleCount: BUDGET_SAMPLE_COUNT,
      maxEditorCalls: MAX_EDITOR_CALLS,
      maxTotalGeminiCalls: MAX_TOTAL_GEMINI_CALLS,
      threshold: input.similarityThreshold,
      keywordQuota: KEYWORD_QUOTA,
    },
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

export async function getAdminPromptByName(): Promise<AdminPromptResult> {
  const name = SYSTEM_PROMPT_NAME;
  const prompt = await prisma.systemPrompt.findUnique({
    where: { name },
  });

  if (!prompt) {
    throw new HttpError(404, `System prompt "${name}" was not found.`);
  }

  return {
    name: prompt.name,
    prompt: prompt.content,
    version: prompt.version,
    lastUpdated: prompt.updatedAt.toISOString(),
    source: "database",
  };
}

export async function updateConsultantPrompt(
  input: UpdateConsultantPromptInput
): Promise<AdminPromptResult> {
  await saveSystemPromptContent(input.prompt, SYSTEM_PROMPT_NAME);
  return getAdminPromptByName();
}
