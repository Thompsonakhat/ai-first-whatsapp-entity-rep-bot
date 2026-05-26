import crypto from "node:crypto";
import express from "express";
import { cfg } from "./config.js";
import { handleText } from "./brain.js";
import { log, safeErr } from "./lib/logging.js";

function verifyWebhookSecret(received) {
  const expected = String(cfg.CMB_WHATSAPP_WEBHOOK_SECRET || "").trim();
  const got = String(received || "").trim();

  if (!expected || !got) return false;

  const expectedBuffer = Buffer.from(expected);
  const gotBuffer = Buffer.from(got);

  if (expectedBuffer.length !== gotBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, gotBuffer);
}

function boolFromPayload(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function normalizeInbound(body = {}) {
  const from = String(body.from || body.chatId || "anon").trim();
  const chatId = String(body.chatId || body.from || from || "anon").trim();
  const senderId = String(body.senderId || body.participantJid || body.participant || body.from || from || "anon").trim();
  const isGroup = boolFromPayload(body.isGroup) || chatId.endsWith("@g.us");

  return {
    projectId: String(body.projectId || "").trim(),
    platform: "whatsapp",
    source: String(body.source || "managed").trim(),
    from,
    chatId,
    senderId,
    participantJid: String(body.participantJid || body.participant || "").trim(),
    userId: senderId || from || "anon",
    text: String(body.text || "").trim(),
    messageId: String(body.messageId || "").trim(),
    isGroup,
    groupId: body.groupId ? String(body.groupId) : isGroup ? chatId : null,
    pushName: body.pushName ? String(body.pushName) : "",
    messageType: body.messageType ? String(body.messageType) : "text",
    timestamp: Number(body.timestamp || Date.now()),
    shouldRespond: body.shouldRespond === undefined ? undefined : boolFromPayload(body.shouldRespond),
    mentionedBot: boolFromPayload(body.mentionedBot),
    isReplyToBot: boolFromPayload(body.isReplyToBot),
    directedToBot: boolFromPayload(body.directedToBot),
    raw: body.raw || body
  };
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      ok: true,
      platform: "whatsapp",
      managedTransport: true,
      aiConfigured: Boolean(cfg.COOKMYBOTS_AI_ENDPOINT && cfg.COOKMYBOTS_AI_KEY),
      memoryConfigured: Boolean(cfg.MONGODB_URI)
    });
  });

  app.post("/webhook/cookmybots/whatsapp", async (req, res) => {
    try {
      const authorized = verifyWebhookSecret(req.headers["x-cookmybots-webhook-secret"]);

      if (!authorized) {
        log.warn("whatsapp.webhook_unauthorized", {
          secretConfigured: Boolean(cfg.CMB_WHATSAPP_WEBHOOK_SECRET)
        });
        return res.status(401).json({ ok: false, error: "unauthorized" });
      }

      const event = normalizeInbound(req.body || {});

      if (!event.text) {
        return res.status(200).json({ ok: true, reply: "" });
      }

      const reply = await handleText(event);

      return res.status(200).json({
        ok: true,
        reply: String(reply || "").slice(0, 4000)
      });
    } catch (err) {
      log.error("whatsapp.webhook_failure", {
        err: safeErr(err)
      });

      return res.status(500).json({
        ok: false,
        error: "server_error",
        reply: "I could not process that message right now."
      });
    }
  });

  app.post("/test", async (req, res) => {
    try {
      const event = normalizeInbound({
        ...(req.body || {}),
        from: "local@s.whatsapp.net",
        chatId: req.body?.chatId || "local@s.whatsapp.net",
        senderId: "local@s.whatsapp.net",
        source: "local"
      });

      const reply = await handleText(event);
      return res.status(200).json({ ok: true, reply });
    } catch (err) {
      log.error("whatsapp.local_test_failure", {
        err: safeErr(err)
      });
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  return app;
}

export async function startServer() {
  const app = createApp();
  const port = Number(cfg.PORT || 3000);

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      log.info("whatsapp.server_started", {
        port,
        platform: "whatsapp",
        managedTransport: true
      });
      resolve(server);
    });
  });
}
