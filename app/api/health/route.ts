import { getSupabaseAdmin, getSupabaseBucketName } from "@/lib/supabase";

export const runtime = "nodejs";

async function checkSupabase() {
  const supabase = getSupabaseAdmin();
  const bucketName = getSupabaseBucketName();

  const [{ error: databaseError }, { data: buckets, error: bucketError }] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.storage.listBuckets(),
  ]);

  if (databaseError) {
    throw new Error(`Database check failed: ${databaseError.message}`);
  }

  if (bucketError) {
    throw new Error(`Storage check failed: ${bucketError.message}`);
  }

  const bucketExists = (buckets ?? []).some((bucket) => bucket.name === bucketName);
  if (!bucketExists) {
    throw new Error(`Storage bucket ${bucketName} was not found.`);
  }
}

export async function GET() {
  try {
    await checkSupabase();
    return Response.json({
      status: "ok",
      service: "student-management-system",
      timestamp: new Date().toISOString(),
      database: {
        status: "ok",
        provider: "supabase",
      },
      storage: {
        status: "ok",
        provider: "supabase",
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "degraded",
        service: "student-management-system",
        timestamp: new Date().toISOString(),
        database: {
          status: "error",
          provider: "supabase",
          message: error instanceof Error ? error.message : "Unknown Supabase error",
        },
      },
      { status: 503 },
    );
  }
}
