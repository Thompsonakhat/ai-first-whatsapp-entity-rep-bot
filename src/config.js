import "dotenv/config";

function numberFromEnv(name, fallback) {
  const raw = process.env[name] || "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const cfg = {
  PORT: process.env.PORT || "3000",
  CMB_WHATSAPP_WEBHOOK_SECRET: process.env.CMB_WHATSAPP_WEBHOOK_SECRET || "",
  COOKMYBOTS_AI_ENDPOINT: process.env.COOKMYBOTS_AI_ENDPOINT || "",
  COOKMYBOTS_AI_KEY: process.env.COOKMYBOTS_AI_KEY || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
  AI_TIMEOUT_MS: numberFromEnv("AI_TIMEOUT_MS", 600000),
  AI_MAX_RETRIES: numberFromEnv("AI_MAX_RETRIES", 2),
  CONCURRENCY: numberFromEnv("CONCURRENCY", 20)
};

export function getEnvSanity() {
  return {
    PORT_set: Boolean(process.env.PORT || cfg.PORT),
    CMB_WHATSAPP_WEBHOOK_SECRET_set: Boolean(cfg.CMB_WHATSAPP_WEBHOOK_SECRET),
    COOKMYBOTS_AI_ENDPOINT_set: Boolean(cfg.COOKMYBOTS_AI_ENDPOINT),
    COOKMYBOTS_AI_KEY_set: Boolean(cfg.COOKMYBOTS_AI_KEY),
    MONGODB_URI_set: Boolean(cfg.MONGODB_URI),
    AI_TIMEOUT_MS_set: Boolean(process.env.AI_TIMEOUT_MS),
    AI_MAX_RETRIES_set: Boolean(process.env.AI_MAX_RETRIES),
    CONCURRENCY_set: Boolean(process.env.CONCURRENCY)
  };
}

export function getStartupWarnings() {
  const warnings = [];

  if (!cfg.CMB_WHATSAPP_WEBHOOK_SECRET) {
    warnings.push("CMB_WHATSAPP_WEBHOOK_SECRET is missing; managed webhook requests will be rejected until configured.");
  }

  if (!cfg.COOKMYBOTS_AI_ENDPOINT || !cfg.COOKMYBOTS_AI_KEY) {
    warnings.push("CookMyBots AI Gateway is not fully configured; replies will use an infrastructure fallback.");
  }

  return warnings;
}
