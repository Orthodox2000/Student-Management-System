import { buildAdmissionNumber } from "@/lib/admission-number";
import { getSupabaseAdmin, getSupabaseBucketName } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  const sampleAdmission = buildAdmissionNumber(7);
  checks.admissionNumber = {
    ok: /^PU\d{9}$/.test(sampleAdmission),
    detail: sampleAdmission,
  };

  try {
    const supabase = getSupabaseAdmin();
    const bucketName = getSupabaseBucketName();

    const { error: queryError } = await supabase.from("students").select("id", { count: "exact", head: true });
    checks.database = {
      ok: !queryError,
      detail: queryError?.message ?? "Supabase query successful",
    };

    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const bucketExists = !bucketError && (buckets ?? []).some((bucket) => bucket.name === bucketName);
    checks.storage = {
      ok: bucketExists,
      detail: bucketError?.message ?? (bucketExists ? `Bucket ${bucketName} available` : `Bucket ${bucketName} not found`),
    };
  } catch (error) {
    checks.database = {
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
