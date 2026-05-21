import { config, isMetaConfigured, webhookUrl } from "./config.js";

export function renderLandingHtml(): string {
  const webhook = webhookUrl();
  const metaOk = isMetaConfigured();
  const qikoOk = Boolean(config.qikoApiBaseUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Qikobot for WhatsApp</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 48px auto; padding: 0 20px;
      background: #05070a; color: #e2e8f0; line-height: 1.6; }
    h1 { background: linear-gradient(135deg, #6366f1, #22d3ee); -webkit-background-clip: text; background-clip: text; color: transparent; }
    code { background: #1e293b; padding: 2px 8px; border-radius: 6px; font-size: 0.9em; }
    .ok { color: #4ade80; } .bad { color: #f87171; }
    a { color: #22d3ee; }
  </style>
</head>
<body>
  <h1>Qikobot for WhatsApp</h1>
  <p>Webhook service for Meta WhatsApp Cloud API → Qiko workers.</p>
  <ul>
    <li>Meta config: <span class="${metaOk ? "ok" : "bad"}">${metaOk ? "OK" : "missing env"}</span></li>
    <li>Qiko API: <span class="${qikoOk ? "ok" : "bad"}">${qikoOk ? "OK" : "missing QIKO_API_BASE_URL"}</span></li>
  </ul>
  <p>Webhook URL for Meta App Dashboard:<br /><code>${webhook}</code></p>
  <p>Privacy Policy: <a href="/privacy-policy">/privacy-policy</a></p>
  <p>Full setup: see <code>WHATSAPP_INTEGRATION.md</code> in the repo.</p>
</body>
</html>`;
}
