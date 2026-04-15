import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const uploadDir = path.join(process.cwd(), "public", "uploads");
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
  const safeName = `${Date.now()}-${randomUUID()}${extension}`;

  await mkdir(uploadDir, { recursive: true });
  const absolutePath = path.join(uploadDir, safeName);
  await writeFile(absolutePath, bytes);

  return `/uploads/${safeName}`;
}

function getSafeExtension(name: string, type: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png") || type.includes("png")) return ".png";
  if (lower.endsWith(".webp") || type.includes("webp")) return ".webp";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg") || type.includes("jpeg"))
    return ".jpg";
  return "";
}
