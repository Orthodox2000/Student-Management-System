import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST() {
  return clearAdminSession(
    NextResponse.json({
      ok: true,
      message: "Admin session cleared.",
    }),
  );
}
