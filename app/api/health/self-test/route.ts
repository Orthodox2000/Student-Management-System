import { buildAdmissionNumber } from "@/lib/admission-number";
import { getAdminDataConnect } from "@/lib/dataconnect";

export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  const sampleAdmission = buildAdmissionNumber(7);
  checks.admissionNumber = {
    ok: /^PU\d{4}\d{5}$/.test(sampleAdmission),
    detail: sampleAdmission,
  };

  try {
    await getAdminDataConnect().executeQuery("ListStudents");
    checks.dataconnect = { ok: true, detail: "Data Connect query successful" };
  } catch (error) {
    checks.dataconnect = {
      ok: false,
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const isHealthy = Object.values(checks).every((item) => item.ok);

  return Response.json(
    {
      status: isHealthy ? "pass" : "fail",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 },
  );
}
