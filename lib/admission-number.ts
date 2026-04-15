const ADMISSION_PREFIX = "PU";

export function buildAdmissionNumber(sequence?: number): string {
  const year = new Date().getFullYear();
  const value =
    typeof sequence === "number"
      ? sequence
      : Number(String(Date.now()).slice(-5));
  return `${ADMISSION_PREFIX}${year}${String(value).padStart(5, "0")}`;
}
