import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const port = process.env.PORT ?? "4000";
const baseURL = process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`;
const trustedOrigins = [
  process.env.FRONTEND_URL ?? "http://localhost:3000",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((origin) =>
    origin.trim()
  ) ?? []),
].filter(Boolean);

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
