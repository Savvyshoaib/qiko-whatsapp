import { config } from "./config.js";

export interface SendTextOptions {
  to: string;
  body: string;
}

export async function sendWhatsAppText(options: SendTextOptions): Promise<void> {
  const token = config.meta.accessToken;
  const phoneNumberId = config.meta.phoneNumberId;
  if (!token || !phoneNumberId) {
    throw new Error("META_ACCESS_TOKEN or META_PHONE_NUMBER_ID is not set");
  }

  const url = `https://graph.facebook.com/${config.meta.graphVersion}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: options.to.replace(/\D/g, ""),
      type: "text",
      text: { preview_url: false, body: options.body },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("WhatsApp send failed:", res.status, err);
    throw new Error(`WhatsApp API error (${res.status})`);
  }
}
