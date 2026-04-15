import { jsonResponse } from "@/lib/api";
import { getFirebaseAdminAuth, getFirebaseAuthMode } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function getFirebaseConnectionMeta() {
  const authMode = getFirebaseAuthMode();

  return {
    target: authMode.target,
    emulatorHost: authMode.emulatorHost,
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null,
  };
}

function getFriendlyError(error: unknown, target: string, emulatorHost: string | null) {
  const message = error instanceof Error ? error.message : "Unknown Firebase connectivity error.";

  if (message.includes("ECONNREFUSED") && target === "emulator") {
    return `Firebase Auth emulator is configured at ${emulatorHost ?? "127.0.0.1:9099"} but is not reachable. Start the emulator or disable emulator mode.`;
  }

  return message;
}

export async function GET() {
  const meta = getFirebaseConnectionMeta();

  try {
    const auth = getFirebaseAdminAuth();
    await auth.listUsers(1);

    return jsonResponse({
      status: "ok",
      service: "firebase-auth",
      ...meta,
      message: "Firebase Admin SDK reached Firebase Auth successfully.",
    });
  } catch (error) {
    return jsonResponse(
      {
        status: "error",
        service: "firebase-auth",
        ...meta,
        message: getFriendlyError(error, meta.target, meta.emulatorHost),
      },
      503,
    );
  }
}
