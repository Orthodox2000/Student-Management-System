import { jsonResponse } from "@/lib/api";
import { handleAuthError, requireFirebaseAuth } from "@/lib/firebase-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFirebaseAuth(request);
    return jsonResponse({
      authenticated: true,
      user,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
