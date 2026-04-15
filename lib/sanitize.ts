export function sanitizeText(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultilineText(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeEmail(value: unknown) {
  return sanitizeText(value).toLowerCase();
}

export function sanitizePhone(value: unknown) {
  return sanitizeText(value).replace(/[^0-9+\-()\s]/g, "");
}

export function sanitizeDate(value: unknown) {
  return sanitizeText(value).replace(/[^0-9-]/g, "");
}
