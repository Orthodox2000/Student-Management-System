import { getAdminDataConnect } from "@/lib/dataconnect";

export const runtime = "nodejs";

export async function GET() {
  try {
    await getAdminDataConnect().executeQuery("ListStudents");
    return Response.json({
      status: "ok",
      service: "student-management-system",
      timestamp: new Date().toISOString(),
      dataconnect: {
        status: "ok",
        mode: process.env.DATA_CONNECT_EMULATOR_HOST ? "emulator" : "cloud",
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "degraded",
        service: "student-management-system",
        timestamp: new Date().toISOString(),
        dataconnect: {
          status: "error",
          message: error instanceof Error ? error.message : "Unknown Data Connect error",
        },
      },
      { status: 503 },
    );
  }
}
