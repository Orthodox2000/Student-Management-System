import { randomUUID } from "node:crypto";
import { getSupabaseAdmin, getSupabaseBucketName } from "@/lib/supabase";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

export async function savePhoto(file: File) {
  if (file.size > maxBytes) {
    throw new Error("Photo must be 5MB or smaller.");
  }

  if (!allowedTypes.has(file.type)) {
    throw new Error("Photo must be a PNG, JPG, JPEG, or WEBP file.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || file.type.split("/").pop() || "jpg";
  const path = `students/${Date.now()}-${randomUUID()}.${extension}`;
  const supabase = getSupabaseAdmin();
  const bucket = getSupabaseBucketName();
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Unable to create public image URL.");
  }

  return data.publicUrl;
}
