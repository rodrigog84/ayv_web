import { connection } from "next/server";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

/** Require an admin session; otherwise send the user to /admin (login). */
export async function requireAdmin(): Promise<void> {
  await connection();
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin");
  }
}
