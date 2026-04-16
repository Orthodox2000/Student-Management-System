import { jsonResponse } from "@/lib/api";
import { handleAdminAuthError, requireAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAdminSession(request);
    return jsonResponse({
      authenticated: true,
      user,
    });
  } catch (error) {
    return handleAdminAuthError(error);
  }
}
