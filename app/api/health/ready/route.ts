import { getSupabaseAdmin, getSupabaseBucketName } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const bucketName = getSupabaseBucketName();

    const [{ error: databaseError }, { data: buckets, error: bucketError }] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.storage.listBuckets(),
    ]);

    if (databaseError) throw databaseError;
    if (bucketError) throw bucketError;

    const bucketExists = (buckets ?? []).some((bucket) => bucket.name === bucketName);
    if (!bucketExists) {
      throw new Error(`Storage bucket ${bucketName} was not found.`);
    }

    return Response.json({
      status: "ready",
      checks: {
        database: "ok",
        storage: "ok",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "not_ready",
        checks: {
          database: "failed",
          storage: "failed",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
