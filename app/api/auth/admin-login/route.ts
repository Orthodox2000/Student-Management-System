import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { handleApiError, jsonResponse } from "@/lib/api";
import { sanitizeEmail } from "@/lib/sanitize";

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

    if (
      submitted.email !== configured.email ||
      submitted.password !== configured.password
    ) {
      return jsonResponse({ error: "Invalid admin credentials." }, 401);
    }

    const auth = getFirebaseAdminAuth();
    let userRecord;

    try {
      userRecord = await auth.getUserByEmail(configured.email);
      userRecord = await auth.updateUser(userRecord.uid, {
        email: configured.email,
        password: configured.password,
        displayName: "Pillai College Admin",
        emailVerified: true,
      });
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

      if (code !== "auth/user-not-found") {
        throw error;
      }

      userRecord = await auth.createUser({
        email: configured.email,
        password: configured.password,
        displayName: "Pillai College Admin",
        emailVerified: true,
      });
    }

    await auth.setCustomUserClaims(userRecord.uid, { role: "admin", admin: true });
    const customToken = await auth.createCustomToken(userRecord.uid, {
      role: "admin",
      admin: true,
    });

    return jsonResponse({
      ok: true,
      customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
