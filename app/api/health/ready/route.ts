import { getAdminDataConnect } from "@/lib/dataconnect";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getAdminDataConnect().executeQuery("ListStudents");
    return Response.json({
      status: "ready",
      checks: {
        dataconnect: "ok",
        connector: "ok",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "not_ready",
        checks: {
          dataconnect: "failed",
          connector: "failed",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
