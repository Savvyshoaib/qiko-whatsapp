/** WhatsApp uses *bold* (single asterisk), same as Slack mrkdwn. */

export function markdownToWhatsApp(text: string): string {
  let out = text.trim();
  out = out.replace(/\*\*([^*]+)\*\*/g, "*$1*");
  out = out.replace(/__([^_]+)__/g, "*$1*");
  return out;
}

/** Truncate for WhatsApp text message limit (4096). */
export function truncateReply(text: string, max = 4000): string {
  const formatted = markdownToWhatsApp(text);
  if (formatted.length <= max) return formatted;
  return `${formatted.slice(0, max - 20)}\n\n…(truncated)`;
}
