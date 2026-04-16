import { z } from "zod";
import { YEAR_OPTIONS } from "@/lib/student-options";

export const studentFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  course: z
    .string()
    .trim()
    .min(2, "Course is required.")
    .max(60, "Course must be 60 characters or fewer.")
    .regex(/^[A-Za-z0-9&/().+\-\s]+$/, "Course contains invalid characters."),
  year: z.coerce.number().int().refine((value) => YEAR_OPTIONS.includes(value as (typeof YEAR_OPTIONS)[number]), {
    message: "Select a valid academic year.",
  }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().trim().email().max(180),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits."),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().trim().min(5).max(400),
});

export function normalizeStudentPayload(payload: unknown) {
  return studentFormSchema.parse(payload);
}
