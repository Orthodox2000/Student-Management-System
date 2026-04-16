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

  if (digitsOnly.length === 0) {
    return "";
  }

  if (digitsOnly.length > 10 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2, 12);
  }

  return digitsOnly.slice(0, 10);
}

export function formatIndianPhoneForStorage(value: unknown) {
  const localDigits = sanitizePhone(value);
  return localDigits ? `+91 ${localDigits}` : "";
}

export function sanitizeDate(value: unknown) {
  return sanitizeText(value).replace(/[^0-9-]/g, "");
}
