import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { generateGeminiJson, generateGeminiJsonReply } from "../lib/gemini";
import prisma from "../lib/prisma";
import {
  getSystemPromptContent,
  saveSystemPromptContent,
  PROMPT_EDITOR_SYSTEM_PROMPT_NAME,
  seedAllDefaultSystemPrompts,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";

dotenv.config();

type Direction = "in" | "out";

type ConversationMessage = {
  message_id: number;
  direction: Direction;
  text: string;
  timestamp: number;
};

type ConversationRecord = {
  contact_id?: string;
  scenario?: string;
  conversation?: ConversationMessage[];
};

type MessageBlock = {
  direction: Direction;
  messages: ConversationMessage[];
};

type ExtractedSequence = {
  contact_id: string;
  preceding_chat_history: MessageBlock[];
  client_sequence: ConversationMessage[];
  consultant_sequence_reply: ConversationMessage[];
};

type PromptEditorDiagnosis = {
  dimension: string;
  observation: string;
  root_cause_category: string;
  current_prompt_location: string;
  edit: string;
  rationale: string;
};

type PromptEditorResult = {
  diagnosis: PromptEditorDiagnosis[];
  prompt: string;
};

type SampleResult = ExtractedSequence & {
  ai_reply_before: string;
  ai_reply_after: string;
  prompt_update: PromptEditorResult;
};

const SAMPLE_COUNT = Number(process.env.CONVERSATION_SAMPLE_COUNT ?? "1");

function readConversationFile(filepath: string): ConversationRecord[] {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Could not find ${filepath}`);
  }

  const raw = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as ConversationRecord[];
}

function groupByDirection(conversation: ConversationMessage[]): MessageBlock[] {
  if (conversation.length === 0) {
    return [];
  }

  const blocks: MessageBlock[] = [];
  let currentDirection = conversation[0].direction;
  let currentBlock: ConversationMessage[] = [];

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

export function processConversations(filepath: string): ExtractedSequence[] {
  const data = readConversationFile(filepath);
  const results: ExtractedSequence[] = [];

  for (const record of data) {
    const contactId = record.contact_id ?? "unknown";
    const conversation = record.conversation ?? [];

    if (conversation.length === 0) {
      continue;
    }

    const blocks = groupByDirection(conversation);
    const chatHistory: MessageBlock[] = [];

    for (let index = 0; index < blocks.length - 1; index += 1) {
      const currentBlock = blocks[index];
      const nextBlock = blocks[index + 1];

      if (currentBlock.direction === "in" && nextBlock.direction === "out") {
        results.push({
          contact_id: contactId,
          preceding_chat_history: [...chatHistory],
          client_sequence: currentBlock.messages,
          consultant_sequence_reply: nextBlock.messages,
        });
      }

      chatHistory.push(currentBlock);
    }
  }

  return results;
}

function formatHistoryLine(message: ConversationMessage): string {
  const speaker = message.direction === "in" ? "[Client]" : "[Consultant]";
  return `${speaker}: ${message.text}`;
}

function formatChatHistory(history: MessageBlock[]): string {
  if (history.length === 0) {
    return "";
  }

  return history
    .flatMap((block) => block.messages)
    .map(formatHistoryLine)
    .join("\n");
}

function formatClientSequenceForEditor(messages: ConversationMessage[]): string {
  return messages.map((message) => `[Client]: ${message.text}`).join("\n");
}

function formatClientSequenceForReply(messages: ConversationMessage[]): string {
  return messages.map((message) => message.text).join("\n");
}

function formatConsultantReply(messages: ConversationMessage[]): string {
  return messages.map((message) => message.text).join("\n");
}

async function generateReply(
  systemPrompt: string,
  sequence: ExtractedSequence
): Promise<string> {
  const promptSections = [
    "Generate the next consultant DM reply based on the client messages and prior chat history.",
    "",
    "CLIENT:",
    formatClientSequenceForReply(sequence.client_sequence),
  ];
  const history = formatChatHistory(sequence.preceding_chat_history);

  if (history) {
    promptSections.push("", "CHAT HISTORY:", history);
  }

  return generateGeminiJsonReply(systemPrompt, promptSections.join("\n"));
}

async function runPromptEditor(
  editorPrompt: string,
  currentPrompt: string,
  sequence: ExtractedSequence,
  aiReply: string
): Promise<PromptEditorResult> {
  const history = formatChatHistory(sequence.preceding_chat_history);
  const result = await generateGeminiJson<PromptEditorResult>(
    editorPrompt,
    [
      "CURRENT_PROMPT:",
      currentPrompt,
      "",
      "---",
      "",
      "CHAT_HISTORY:",
      history,
      "",
      "---",
      "",
      "CLIENT_SEQUENCE:",
      formatClientSequenceForEditor(sequence.client_sequence),
      "",
      "---",
      "",
      "REAL_REPLY:",
      formatConsultantReply(sequence.consultant_sequence_reply),
      "",
      "---",
      "",
      "AI_REPLY:",
      aiReply,
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
    throw new Error("Prompt editor response did not include a diagnosis array.");
  }

  if (typeof result.prompt !== "string" || result.prompt.trim().length === 0) {
    throw new Error("Prompt editor response did not include a non-empty prompt.");
  }

  return {
    diagnosis: result.diagnosis,
    prompt: result.prompt,
  };
}

async function runOptimization(
  sequences: ExtractedSequence[],
  sampleCount: number
): Promise<{
  samples: SampleResult[];
  finalPrompt: string;
}> {
  await seedAllDefaultSystemPrompts();

  const editorPrompt = await getSystemPromptContent(
    PROMPT_EDITOR_SYSTEM_PROMPT_NAME
  );
  let workingPrompt = await getSystemPromptContent(SYSTEM_PROMPT_NAME);
  const selectedSequences = sequences.slice(0, sampleCount);
  const intermediateResults: Array<
    ExtractedSequence & {
      ai_reply_before: string;
      prompt_update: PromptEditorResult;
    }
  > = [];

  for (const sequence of selectedSequences) {
    const aiReplyBefore = await generateReply(workingPrompt, sequence);
    const promptUpdate = await runPromptEditor(
      editorPrompt,
      workingPrompt,
      sequence,
      aiReplyBefore
    );

    workingPrompt = promptUpdate.prompt;

    intermediateResults.push({
      ...sequence,
      ai_reply_before: aiReplyBefore,
      prompt_update: promptUpdate,
    });
  }

  await saveSystemPromptContent(workingPrompt, SYSTEM_PROMPT_NAME);
  const updatedPrompt = await getSystemPromptContent(SYSTEM_PROMPT_NAME);

  const samples: SampleResult[] = [];

  for (const result of intermediateResults) {
    const aiReplyAfter = await generateReply(updatedPrompt, result);
    samples.push({
      ...result,
      ai_reply_after: aiReplyAfter,
    });
  }

  return {
    samples,
    finalPrompt: updatedPrompt,
  };
}

function printSamples(
  samples: SampleResult[],
  totalCount: number,
  finalPrompt: string
): void {
  console.log(`Total sequences extracted: ${totalCount}`);
  console.log(`Optimization samples processed: ${samples.length}\n`);

  samples.forEach((sample, index) => {
    console.log(`=== SAMPLE ${index + 1} ===`);
    console.log(`Contact ID: ${sample.contact_id}`);
    console.log("Chat history:");
    console.log(formatChatHistory(sample.preceding_chat_history) || "(none)");
    console.log("\nClient sequence:");
    console.log(formatClientSequenceForEditor(sample.client_sequence));
    console.log("\nReal consultant reply:");
    console.log(formatConsultantReply(sample.consultant_sequence_reply));
    console.log("\nAI reply before prompt update:");
    console.log(sample.ai_reply_before);
    console.log("\nPrompt editor diagnosis:");
    console.log(JSON.stringify(sample.prompt_update.diagnosis, null, 2));
    console.log("\nAI reply after database prompt update:");
    console.log(sample.ai_reply_after);
    console.log("");
  });

  console.log("=== UPDATED DATABASE PROMPT ===");
  console.log(finalPrompt);
}

async function main(): Promise<void> {
  try {
    const filepath = path.resolve(__dirname, "../../../../conversations.json");
    const sequences = processConversations(filepath);
    const { samples, finalPrompt } = await runOptimization(
      sequences,
      SAMPLE_COUNT
    );

    printSamples(samples, sequences.length, finalPrompt);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
