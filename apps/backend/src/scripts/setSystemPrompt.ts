import dotenv from "dotenv";
import prisma from "../lib/prisma";
import {
  saveSystemPromptContent,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";

dotenv.config();

function getPromptContentFromArgs(): string {
  const content = process.argv.slice(2).join(" ").trim();

  if (!content) {
    throw new Error("Provide the new prompt content as a command argument.");
  }

  return content;
}

function getPromptName(): string {
  return process.env.PROMPT_NAME?.trim() || SYSTEM_PROMPT_NAME;
}

async function main(): Promise<void> {
  try {
    const promptName = getPromptName();
    const content = getPromptContentFromArgs();
    await saveSystemPromptContent(content, promptName);
    console.log(`Updated system prompt "${promptName}".`);
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
