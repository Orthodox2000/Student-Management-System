import { jsonResponse } from "@/lib/api";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";

export type AuthUser = {
  uid: string;
  email: string | null;
};

function readBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export async function requireFirebaseAuth(request: Request): Promise<AuthUser> {
  const token = readBearerToken(request);
  if (!token) {
    throw new Error("Unauthorized: Missing Firebase ID token.");
  }

  const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
  };
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
    return jsonResponse({ error: error.message }, 401);
  }

  if (error instanceof Error) {
    return jsonResponse(
      {
        error: "Firebase auth verification failed.",
        detail: error.message,
      },
      401,
    );
  }

  return jsonResponse({ error: "Unauthorized" }, 401);
}
