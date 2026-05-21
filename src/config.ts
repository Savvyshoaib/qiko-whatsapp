const port = Number(process.env.PORT) || 3002;

function resolveAppUrl(): string {
  const explicit = process.env.WHATSAPP_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const render = process.env.RENDER_EXTERNAL_URL?.trim();
  if (render) return render.replace(/\/$/, "");

  return `http://localhost:${port}`;
}

export const config = {
  port,
  appUrl: resolveAppUrl(),
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN?.trim() || "",
    appSecret: process.env.META_APP_SECRET?.trim() || "",
    verifyToken: process.env.META_VERIFY_TOKEN?.trim() || "",
    phoneNumberId: process.env.META_PHONE_NUMBER_ID?.trim() || "",
    graphVersion: process.env.META_GRAPH_API_VERSION?.trim() || "v21.0",
  },
  qikoApiBaseUrl: process.env.QIKO_API_BASE_URL?.trim() || "",
  qikoWebOrigin: process.env.QIKO_WEB_ORIGIN?.trim() || "https://stage-app.qiko.ai",
  qikoWebAppUrl: process.env.QIKO_WEB_APP_URL?.trim() || "https://stage-app.qiko.ai",
};

export function webhookUrl(): string {
  return `${config.appUrl}/webhook`;
}

export function isMetaConfigured(): boolean {
  return Boolean(
    config.meta.accessToken &&
      config.meta.verifyToken &&
      config.meta.phoneNumberId
  );
}
