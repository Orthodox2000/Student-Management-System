import { normalizeStudentPayload } from "@/lib/student-schema";
import {
  sanitizeDate,
  sanitizeEmail,
  sanitizeMultilineText,
  sanitizePhone,
  sanitizeText,
} from "@/lib/sanitize";

export async function parseStudentFormData(request: Request) {
  const formData = await request.formData();
  const payload = {
    name: sanitizeText(formData.get("name")),
    course: sanitizeText(formData.get("course")),
    year: sanitizeText(formData.get("year")),
    dateOfBirth: sanitizeDate(formData.get("dateOfBirth")),
    email: sanitizeEmail(formData.get("email")),
    mobileNumber: sanitizePhone(formData.get("mobileNumber")),
    gender: sanitizeText(formData.get("gender")),
    address: sanitizeMultilineText(formData.get("address")),
  };

  const parsed = normalizeStudentPayload(payload);
  const photo = formData.get("photo");
  const removePhotoRaw = formData.get("removePhoto");

  const removePhoto = String(removePhotoRaw ?? "false").toLowerCase() === "true";
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;

  return { parsed, photoFile, removePhoto };
}
