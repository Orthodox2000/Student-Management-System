import { randomUUID } from "node:crypto";
import { getFirebaseAdminStorage } from "@/lib/firebase-admin";

const maxPhotoSizeBytes = 5 * 1024 * 1024;

export async function savePhoto(file: File) {
  if (file.size > maxPhotoSizeBytes) {
    throw new Error("Photo must be 5MB or smaller.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = getSafeExtension(file.name, file.type);
  if (!extension) {
    throw new Error("Unsupported photo type. Use png, jpg, jpeg, or webp.");
  }
  const safeName = `students/${Date.now()}-${randomUUID()}${extension}`;
  const bucket = getFirebaseAdminStorage();
  const storageFile = bucket.file(safeName);

  await storageFile.save(bytes, {
    metadata: {
      contentType: file.type || getContentType(extension),
      cacheControl: "public, max-age=31536000, immutable",
    },
    resumable: false,
  });

  const [signedUrl] = await storageFile.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });

  return signedUrl;
}

function getSafeExtension(name: string, type: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png") || type.includes("png")) return ".png";
  if (lower.endsWith(".webp") || type.includes("webp")) return ".webp";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg") || type.includes("jpeg"))
    return ".jpg";
  return "";
}

function getContentType(extension: string) {
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  return "image/jpeg";
}
