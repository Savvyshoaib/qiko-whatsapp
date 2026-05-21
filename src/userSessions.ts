import fs from "node:fs";
import path from "node:path";
import type { QikoUser } from "./qikoClient.js";

export interface ActiveWorker {
  agentId: string;
  name: string;
  userName?: string;
}

export interface QikoSession {
  token: string;
  user: QikoUser | null;
  email: string;
  linkedAt: string;
  activeWorker?: ActiveWorker | null;
}

/** WhatsApp user id (E.164 without +, e.g. 923001234567) scoped per business phone number. */
export function sessionKey(businessPhoneNumberId: string, waUserId: string): string {
  return `wa:${businessPhoneNumberId}:user:${waUserId}`;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "whatsapp-sessions.json");
type SessionMap = Record<string, QikoSession>;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAll(): SessionMap {
  ensureDataDir();
  if (!fs.existsSync(SESSIONS_FILE)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8")) as SessionMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(sessions: SessionMap): void {
  ensureDataDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

export function getSession(businessPhoneNumberId: string, waUserId: string): QikoSession | null {
  return readAll()[sessionKey(businessPhoneNumberId, waUserId)] ?? null;
}

export function setSession(
  businessPhoneNumberId: string,
  waUserId: string,
  session: Omit<QikoSession, "linkedAt"> & { linkedAt?: string }
): QikoSession {
  const all = readAll();
  const key = sessionKey(businessPhoneNumberId, waUserId);
  const record: QikoSession = { ...session, linkedAt: session.linkedAt ?? new Date().toISOString() };
  all[key] = record;
  writeAll(all);
  return record;
}

export function clearSession(businessPhoneNumberId: string, waUserId: string): boolean {
  const all = readAll();
  const key = sessionKey(businessPhoneNumberId, waUserId);
  if (!all[key]) return false;
  delete all[key];
  writeAll(all);
  return true;
}

export function setActiveWorker(
  businessPhoneNumberId: string,
  waUserId: string,
  worker: ActiveWorker | null
): QikoSession | null {
  const all = readAll();
  const key = sessionKey(businessPhoneNumberId, waUserId);
  const session = all[key];
  if (!session) return null;
  session.activeWorker = worker;
  all[key] = session;
  writeAll(all);
  return session;
}
