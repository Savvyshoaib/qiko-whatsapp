import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { config } from "./config.js";
import { handleIncomingText } from "./messageRouter.js";

type RequestWithRawBody = Request & { rawBody?: Buffer };

export function verifyMetaSignature(req: RequestWithRawBody): boolean {
  const secret = config.meta.appSecret;
  if (!secret) return true;

  const signature = req.get("x-hub-signature-256");
  if (!signature || !req.rawBody) return false;

  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

interface WhatsAppTextMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

function extractTextMessages(body: unknown): Array<{
  phoneNumberId: string;
  from: string;
  text: string;
}> {
  const out: Array<{ phoneNumberId: string; from: string; text: string }> = [];
  if (!body || typeof body !== "object") return out;

  const root = body as {
    object?: string;
    entry?: Array<{
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: string };
          messages?: WhatsAppTextMessage[];
        };
      }>;
    }>;
  };

  if (root.object !== "whatsapp_business_account") return out;

  for (const entry of root.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id ?? config.meta.phoneNumberId;
      for (const msg of value?.messages ?? []) {
        if (msg.type === "text" && msg.text?.body) {
          out.push({
            phoneNumberId,
            from: msg.from,
            text: msg.text.body,
          });
        }
      }
    }
  }

  return out;
}

export function registerWebhookRoutes(app: Express): void {
  app.get("/webhook", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === config.meta.verifyToken) {
      console.log("WhatsApp webhook verified");
      res.status(200).send(challenge);
      return;
    }

    res.status(403).send("Forbidden");
  });

  app.post("/webhook", async (req: RequestWithRawBody, res: Response) => {
    if (!verifyMetaSignature(req)) {
      console.warn("Invalid X-Hub-Signature-256");
      res.sendStatus(403);
      return;
    }

    res.sendStatus(200);

    const messages = extractTextMessages(req.body);
    for (const msg of messages) {
      try {
        await handleIncomingText(msg.phoneNumberId, msg.from, msg.text);
      } catch (error) {
        console.error("handleIncomingText error:", error);
      }
    }
  });
}
