import dotenv from "dotenv";
import prisma from "../lib/prisma";
import {
  getSystemPromptContent,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";

dotenv.config();

function getPromptName(): string {
  return process.env.PROMPT_NAME?.trim() || SYSTEM_PROMPT_NAME;
}

async function main(): Promise<void> {
  try {
    const promptName = getPromptName();
    const content = await getSystemPromptContent(promptName);
    console.log(`System prompt "${promptName}":\n`);
    console.log(content);
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
