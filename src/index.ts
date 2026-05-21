import "dotenv/config";
import express from "express";
import { config, isMetaConfigured, webhookUrl } from "./config.js";
import { renderLandingHtml } from "./landing.js";
import { renderPrivacyPolicyHtml } from "./privacy.js";
import { registerWebhookRoutes } from "./webhook.js";

const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

registerWebhookRoutes(app);

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(renderLandingHtml());
});

app.get(["/privacy", "/privacy-policy"], (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(renderPrivacyPolicyHtml());
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    meta: isMetaConfigured(),
    qikoApi: Boolean(config.qikoApiBaseUrl),
    webhook: webhookUrl(),
  });
});

app.listen(config.port, () => {
  console.log(`Qiko WhatsApp app — ${config.appUrl}`);
  console.log(`Webhook: ${webhookUrl()}`);
  console.log(`Meta configured: ${isMetaConfigured()}`);
});
