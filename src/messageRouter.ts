import { config } from "./config.js";
import { loginToQiko } from "./qikoClient.js";
import { clearPending, getPending, setPending } from "./pendingLogin.js";
import { truncateReply } from "./whatsappFormat.js";
import { sendWhatsAppText } from "./whatsappClient.js";
import {
  clearSession,
  getSession,
  setSession,
} from "./userSessions.js";
import {
  formatWorkersList,
  requireSession,
  selectWorker,
  sendMessageToActiveWorker,
} from "./workerChat.js";
import { fetchQikoAgents } from "./qikoClient.js";

const HELP_TEXT = `*Qikobot on WhatsApp*

Commands:
• *help* — this message
• *login* — sign in with Qiko email & password
• *status* — connection info
• *logout* — disconnect
• *workers* — list your workers
• *worker <name>* — pick active worker
• Any other message — chat with active worker

Web app: ${config.qikoWebAppUrl}`;

function normalizeCommand(text: string): { cmd: string; arg: string } {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "help" || lower === "start" || lower === "hi" || lower === "hello") {
    return { cmd: "help", arg: "" };
  }
  if (lower === "login" || lower === "signin" || lower === "sign in") {
    return { cmd: "login", arg: "" };
  }
  if (lower === "logout") return { cmd: "logout", arg: "" };
  if (lower === "status") return { cmd: "status", arg: "" };
  if (lower === "workers" || lower === "worker list") return { cmd: "workers", arg: "" };
  if (lower.startsWith("worker ")) {
    return { cmd: "worker", arg: trimmed.slice(7).trim() };
  }
  return { cmd: "chat", arg: trimmed };
}

export async function handleIncomingText(
  businessPhoneNumberId: string,
  waUserId: string,
  text: string
): Promise<void> {
  const reply = async (body: string) => {
    await sendWhatsAppText({ to: waUserId, body: truncateReply(body) });
  };

  const pending = getPending(businessPhoneNumberId, waUserId);
  if (pending) {
    if (pending.step === "awaiting_email") {
      const email = text.trim();
      if (!email.includes("@")) {
        await reply("Please send a valid email address.");
        return;
      }
      setPending(businessPhoneNumberId, waUserId, {
        step: "awaiting_password",
        email,
        startedAt: pending.startedAt,
      });
      await reply(`Thanks. Now reply with your Qiko *password* for ${email}.`);
      return;
    }

    if (pending.step === "awaiting_password") {
      const email = pending.email ?? "";
      try {
        const result = await loginToQiko({ email, password: text });
        const token = result.data!.token!;
        const user = result.data?.user ?? null;
        setSession(businessPhoneNumberId, waUserId, {
          token,
          user,
          email: user?.email ?? email,
        });
        clearPending(businessPhoneNumberId, waUserId);
        const name = user?.user_name || user?.name || email;
        await reply(
          `Connected as *${name}*.\n\nSend *workers* then *worker <name>*, or just type your question.`
        );
      } catch (error) {
        clearPending(businessPhoneNumberId, waUserId);
        const msg = error instanceof Error ? error.message : "Login failed";
        await reply(`${msg}\n\nSend *login* to try again.`);
      }
      return;
    }
  }

  const { cmd, arg } = normalizeCommand(text);

  try {
    if (cmd === "help") {
      await reply(HELP_TEXT);
      return;
    }

    if (cmd === "login") {
      clearPending(businessPhoneNumberId, waUserId);
      setPending(businessPhoneNumberId, waUserId, {
        step: "awaiting_email",
        startedAt: new Date().toISOString(),
      });
      await reply("Sign in to Qiko.\n\nReply with your *Qiko email address*.");
      return;
    }

    if (cmd === "logout") {
      clearPending(businessPhoneNumberId, waUserId);
      const removed = clearSession(businessPhoneNumberId, waUserId);
      await reply(removed ? "Disconnected from Qiko." : "You were not connected.");
      return;
    }

    if (cmd === "status") {
      const session = getSession(businessPhoneNumberId, waUserId);
      if (!session) {
        await reply("Not connected. Send *login* to sign in.");
        return;
      }
      const name = session.user?.user_name || session.user?.name || session.email;
      const worker = session.activeWorker?.name;
      await reply(
        `Connected as *${name}*${worker ? `\nActive worker: *${worker}*` : "\nNo worker selected yet."}`
      );
      return;
    }

    if (cmd === "workers") {
      const session = requireSession(businessPhoneNumberId, waUserId);
      const agents = await fetchQikoAgents(session.token);
      const active = session.activeWorker?.name;
      const header = active
        ? `*Your Qiko workers* (active: *${active}*)\n\n`
        : "*Your Qiko workers*\n\n";
      await reply(`${header}${formatWorkersList(agents)}\n\nPick one: *worker <name>*`);
      return;
    }

    if (cmd === "worker") {
      if (!arg) {
        await reply("Usage: *worker <name>*\nExample: *worker Daniel Carter*");
        return;
      }
      const { worker } = await selectWorker(businessPhoneNumberId, waUserId, arg);
      await reply(`Active worker: *${worker.name}*\n\nSend your question as a normal message.`);
      return;
    }

    const { reply: workerReply, worker } = await sendMessageToActiveWorker(
      businessPhoneNumberId,
      waUserId,
      arg
    );
    await reply(`*${worker.name}*\n\n${workerReply}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    await reply(msg);
  }
}
