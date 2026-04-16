import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jsonResponse } from "@/lib/api";

export type AdminSessionUser = {
  email: string;
};

const SESSION_COOKIE = "pillai_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing AUTH_SESSION_SECRET.");
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function readBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

async function readCookie(request: Request, name: string) {
  const cookieStore = await cookies();
  const fromStore = cookieStore.get(name)?.value;
  if (fromStore) {
    return fromStore;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(/;\s*/);
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key === name) {
      return rest.join("=");
    }
  }

  return null;
}

export function createAdminSessionToken(email: string) {
  const payload = toBase64Url(
    JSON.stringify({
      email,
      exp: Date.now() + SESSION_DURATION_MS,
    }),
  );

  return `${payload}.${sign(payload)}`;
}

function parseAdminSessionToken(token: string | null): AdminSessionUser | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(payload)) as { email?: unknown; exp?: unknown };
    if (typeof decoded.email !== "string" || typeof decoded.exp !== "number") {
      return null;
    }

    if (decoded.exp <= Date.now()) {
      return null;
    }

    return { email: decoded.email };
  } catch {
    return null;
  }
}

export async function readAdminSession(request: Request): Promise<AdminSessionUser | null> {
  const bearerToken = readBearerToken(request);
  const bearerSession = parseAdminSessionToken(bearerToken);
  if (bearerSession) {
    return bearerSession;
  }

  const cookieToken = await readCookie(request, SESSION_COOKIE);
  return parseAdminSessionToken(cookieToken);
}

export async function requireAdminSession(request: Request): Promise<AdminSessionUser> {
  const session = await readAdminSession(request);
  if (!session) {
    throw new Error("Unauthorized: Admin session required.");
  }
  return session;
}

export function withAdminSession(response: NextResponse, email: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: createAdminSessionToken(email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });

  return response;
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export function handleAdminAuthError(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
    return jsonResponse({ error: error.message }, 401);
  }

  if (error instanceof Error) {
    return jsonResponse({ error: error.message }, 401);
  }

  return jsonResponse({ error: "Unauthorized" }, 401);
}
