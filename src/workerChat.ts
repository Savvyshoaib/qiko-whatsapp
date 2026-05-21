import {
  chatWithQikoWorker,
  fetchQikoAgents,
  type QikoAgent,
  type QikoChatPayload,
} from "./qikoClient.js";
import { getSession, setActiveWorker, type ActiveWorker } from "./userSessions.js";

export function requireSession(businessPhoneNumberId: string, waUserId: string) {
  const session = getSession(businessPhoneNumberId, waUserId);
  if (!session) {
    throw new Error("Not connected to Qiko. Send *login* to sign in.");
  }
  return session;
}

export function agentChatId(agent: QikoAgent): string {
  return agent.agent_unique_id || agent.user_name || agent.id;
}

export function agentDisplayName(agent: QikoAgent): string {
  return agent.agent_name || agent.user_name || agentChatId(agent);
}

export function formatWorkersList(agents: QikoAgent[]): string {
  const ready = agents.filter((a) => (a.status || "").toLowerCase() === "ready");
  const list = ready.length > 0 ? ready : agents;
  if (list.length === 0) {
    return "No workers found. Create one in the Qiko web app first.";
  }
  return list
    .map((a, i) => {
      const status = (a.status || "unknown").toLowerCase();
      return `${i + 1}. *${agentDisplayName(a)}* — (${status})`;
    })
    .join("\n");
}

export function resolveWorker(agents: QikoAgent[], query: string): QikoAgent | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const ready = agents.filter((a) => (a.status || "").toLowerCase() === "ready");
  const exact = ready.find((a) => {
    const name = agentDisplayName(a).toLowerCase();
    return name === q;
  });
  if (exact) return exact;
  return (
    ready.find((a) => agentDisplayName(a).toLowerCase().includes(q)) ?? null
  );
}

export function toActiveWorker(agent: QikoAgent): ActiveWorker {
  return {
    agentId: agentChatId(agent),
    name: agentDisplayName(agent),
    userName: agent.user_name,
  };
}

export async function selectWorker(
  businessPhoneNumberId: string,
  waUserId: string,
  query: string
): Promise<{ worker: ActiveWorker }> {
  const session = requireSession(businessPhoneNumberId, waUserId);
  const agents = await fetchQikoAgents(session.token);
  const match = resolveWorker(agents, query);
  if (!match) {
    throw new Error(`Worker "${query}" not found. Send *workers* to see names.`);
  }
  if ((match.status || "").toLowerCase() !== "ready") {
    throw new Error(`Worker "${agentDisplayName(match)}" is not ready yet.`);
  }
  const worker = toActiveWorker(match);
  setActiveWorker(businessPhoneNumberId, waUserId, worker);
  return { worker };
}

export async function sendMessageToActiveWorker(
  businessPhoneNumberId: string,
  waUserId: string,
  message: string
): Promise<{ reply: string; worker: ActiveWorker }> {
  const session = requireSession(businessPhoneNumberId, waUserId);
  const text = message.trim();
  if (!text) throw new Error("Message cannot be empty.");

  let worker = session.activeWorker ?? null;
  if (!worker) {
    const agents = await fetchQikoAgents(session.token);
    const ready = agents.filter((a) => (a.status || "").toLowerCase() === "ready");
    if (ready.length === 1) {
      worker = toActiveWorker(ready[0]);
      setActiveWorker(businessPhoneNumberId, waUserId, worker);
    } else {
      throw new Error("No worker selected. Send: *worker <name>* (see *workers*).");
    }
  }

  const payload: QikoChatPayload = {
    agent_unique_id: worker.agentId,
    user_name: worker.userName || worker.agentId,
    message: text,
    email: session.email,
  };

  const reply = await chatWithQikoWorker(session.token, worker.agentId, payload);
  return { reply, worker };
}
