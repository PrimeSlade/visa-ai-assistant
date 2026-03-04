import dotenv from "dotenv";
import prisma from "../lib/prisma";
import {
  PROMPT_EDITOR_SYSTEM_PROMPT_NAME,
  seedAllDefaultSystemPrompts,
  SYSTEM_PROMPT_NAME,
} from "../lib/systemPrompts";

dotenv.config();

async function main(): Promise<void> {
  try {
    await seedAllDefaultSystemPrompts();
    console.log(
      `Seeded system prompts "${SYSTEM_PROMPT_NAME}" and "${PROMPT_EDITOR_SYSTEM_PROMPT_NAME}".`
    );
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
