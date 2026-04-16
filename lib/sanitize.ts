export function sanitizeText(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeTextInput(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[ ]{2,}/g, " ");
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

export function sanitizeMultilineInput(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
    .replace(/\r/g, "");
}

export function sanitizeEmail(value: unknown) {
  return sanitizeText(value).toLowerCase();
}

export function sanitizePhone(value: unknown) {
  const digitsOnly = String(value ?? "").replace(/\D/g, "");
  const localDigits = digitsOnly.startsWith("91") && digitsOnly.length > 10
    ? digitsOnly.slice(2, 12)
    : digitsOnly.slice(0, 10);

  if (!localDigits) {
    return "";
  }

  return `+91 ${localDigits}`;
}

export function sanitizeDate(value: unknown) {
  return sanitizeText(value).replace(/[^0-9-]/g, "");
}
