import fs from "node:fs";
import path from "node:path";

export type LoginStep = "awaiting_email" | "awaiting_password";

export interface PendingLogin {
  step: LoginStep;
  email?: string;
  startedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "whatsapp-pending-login.json");
type Map = Record<string, PendingLogin>;

function key(businessPhoneNumberId: string, waUserId: string): string {
  return `wa:${businessPhoneNumberId}:user:${waUserId}`;
}

function readAll(): Map {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Map;
  } catch {
    return {};
  }
}

function writeAll(data: Map): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
}

export function getPending(businessPhoneNumberId: string, waUserId: string): PendingLogin | null {
  return readAll()[key(businessPhoneNumberId, waUserId)] ?? null;
}

export function setPending(
  businessPhoneNumberId: string,
  waUserId: string,
  pending: PendingLogin
): void {
  const all = readAll();
  all[key(businessPhoneNumberId, waUserId)] = pending;
  writeAll(all);
}

export function clearPending(businessPhoneNumberId: string, waUserId: string): void {
  const all = readAll();
  delete all[key(businessPhoneNumberId, waUserId)];
  writeAll(all);
}
