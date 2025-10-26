import type { Logger } from "pino";

export interface EnvConfig {
  OPENAI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_APP_ENV: "prod" | "staging" | "local";
  ANCHOR_RPC_URL?: string;
  ANCHOR_PRIVATE_KEY?: string;
}

const requiredEnvVars = ["FIREBASE_APP_ENV"];

export function validateEnv(logger: Logger): EnvConfig {
  const env = process.env.FIREBASE_APP_ENV || "local";

  const config: EnvConfig = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT,
    FIREBASE_APP_ENV: env as "prod" | "staging" | "local",
    ANCHOR_RPC_URL: process.env.ANCHOR_RPC_URL,
    ANCHOR_PRIVATE_KEY: process.env.ANCHOR_PRIVATE_KEY,
  };

  // Log redacted presence list
  logger.info({
    env: config.FIREBASE_APP_ENV,
    project: config.FIREBASE_PROJECT_ID || "unknown",
    secrets: {
      OPENAI_API_KEY: !!config.OPENAI_API_KEY,
      DEEPSEEK_API_KEY: !!config.DEEPSEEK_API_KEY,
      ANTHROPIC_API_KEY: !!config.ANTHROPIC_API_KEY,
      ANCHOR_RPC_URL: !!config.ANCHOR_RPC_URL,
      ANCHOR_PRIVATE_KEY: !!config.ANCHOR_PRIVATE_KEY,
    },
  }, "Environment configuration loaded");

  return config;
}

export function getEnv(): EnvConfig {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT,
    FIREBASE_APP_ENV: (process.env.FIREBASE_APP_ENV || "local") as "prod" | "staging" | "local",
    ANCHOR_RPC_URL: process.env.ANCHOR_RPC_URL,
    ANCHOR_PRIVATE_KEY: process.env.ANCHOR_PRIVATE_KEY,
  };
}
