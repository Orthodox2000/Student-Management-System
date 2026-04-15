import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { handleApiError, jsonResponse } from "@/lib/api";

export const runtime = "nodejs";

function getDemoCredentials() {
  return {
    email: process.env.DEMO_USER_EMAIL || "demo.student@pillai.local",
    password: process.env.DEMO_USER_PASSWORD || "Student@123",
  };
}

function canProvisionDemoUser() {
  return process.env.NODE_ENV !== "production";
}

export async function POST() {
  if (!canProvisionDemoUser()) {
    return jsonResponse(
      { error: "Demo account provisioning is disabled outside local development." },
      403,
    );
  }

  const auth = getFirebaseAdminAuth();
  const demo = getDemoCredentials();
  let created = false;

  try {
    try {
      await auth.getUserByEmail(demo.email);
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

      if (code !== "auth/user-not-found") {
        throw error;
      }

      await auth.createUser({
        email: demo.email,
        password: demo.password,
        displayName: "Demo Student Manager",
        emailVerified: true,
      });
      created = true;
    }

    return jsonResponse({
      ok: true,
      created,
      credentials: demo,
      message: created ? "Demo account created for testing." : "Demo account already exists.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
