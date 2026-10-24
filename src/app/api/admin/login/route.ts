import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createSessionValue, verifyPassword } from "@/lib/auth";

async function readPassword(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      password?: string;
    } | null;
    return body?.password ?? "";
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);
    return String(form?.get("password") ?? "");
  }
  // Fallback: try JSON then form
  const cloned = request.clone();
  const body = (await cloned.json().catch(() => null)) as {
    password?: string;
  } | null;
  if (body && typeof body.password === "string") return body.password;
  const form = await request.formData().catch(() => null);
  return String(form?.get("password") ?? "");
}

function wantsHtmlRedirect(request: Request): boolean {
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data") ||
    (accept.includes("text/html") && !accept.includes("application/json"))
  );
}

/** Prefer Host header so redirects stay on 127.0.0.1 (not 0.0.0.0). */
function absoluteUrl(request: Request, path: string): URL {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https") ? "https" : "http");
  if (host) {
    return new URL(path, `${proto}://${host}`);
  }
  return new URL(path, request.url);
}

export async function POST(request: Request) {
  const password = await readPassword(request);
  if (!verifyPassword(password)) {
    if (wantsHtmlRedirect(request)) {
      const url = absoluteUrl(request, "/admin");
      url.searchParams.set("error", "1");
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 },
    );
  }

  if (wantsHtmlRedirect(request)) {
    const res = NextResponse.redirect(absoluteUrl(request, "/admin"), 303);
    res.cookies.set(ADMIN_COOKIE, createSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
