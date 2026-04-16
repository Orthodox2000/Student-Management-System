import { getSupabaseAdmin, getSupabaseBucketName, getSupabaseUrl } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const bucketName = getSupabaseBucketName();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      throw error;
    }

    const bucketExists = (buckets ?? []).some((bucket) => bucket.name === bucketName);
    if (!bucketExists) {
      throw new Error(
        `Storage bucket ${bucketName} was not found. Create that public bucket in Supabase Storage or update SUPABASE_STORAGE_BUCKET.`,
      );
    }

    return Response.json({
      status: "ok",
      service: "supabase",
      provider: "supabase",
      projectUrl: getSupabaseUrl(),
      bucket: bucketName,
      message: "Supabase database and storage are reachable.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        service: "supabase",
        provider: "supabase",
        message: error instanceof Error ? error.message : "Unable to reach Supabase.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
