import { NextResponse } from "next/server";
import { handleApiError, jsonResponse } from "@/lib/api";
import { sanitizeEmail } from "@/lib/sanitize";
import { createAdminSessionToken, withAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

function getAdminCredentials() {
  return {
    email: sanitizeEmail(process.env.ADMIN_LOGIN_EMAIL || ""),
    password: String(process.env.ADMIN_LOGIN_PASSWORD || ""),
  };
}

function normalizeBody(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { email: "", password: "" };
  }

  const maybe = body as { email?: unknown; password?: unknown };
  return {
    email: sanitizeEmail(maybe.email),
    password: typeof maybe.password === "string" ? maybe.password : "",
  };
}

export async function POST(request: Request) {
  try {
    const configured = getAdminCredentials();
    if (!configured.email || !configured.password) {
      return jsonResponse(
        { error: "Admin login credentials are not configured in the environment." },
        500,
      );
    }

    const submitted = normalizeBody(await request.json());
    if (!submitted.email || !submitted.password) {
      return jsonResponse({ error: "Email and password are required." }, 400);
    }

    if (submitted.email !== configured.email || submitted.password !== configured.password) {
      return jsonResponse({ error: "Invalid admin credentials." }, 401);
    }

    const response = NextResponse.json({
      ok: true,
      sessionToken: createAdminSessionToken(configured.email),
      user: {
        email: configured.email,
      },
      message: "Admin session created successfully.",
    });

    return withAdminSession(response, configured.email);
  } catch (error) {
    return handleApiError(error);
  }
}
