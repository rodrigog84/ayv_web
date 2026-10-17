import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ayv_admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "ayv-admin-local";
}

function sessionToken(): string {
  return createHmac("sha256", getAdminPassword())
    .update("ayv-outlet-admin-session-v1")
    .digest("hex");
}

export function createSessionValue(): string {
  return sessionToken();
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const expected = sessionToken();
  try {
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(ADMIN_COOKIE)?.value);
}

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
