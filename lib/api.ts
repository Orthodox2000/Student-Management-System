import { ZodError } from "zod";

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function parseId(value: string) {
  const id = value.trim();
  if (!/^[0-9a-fA-F-]{8,}$/.test(id)) {
    throw new Error("Invalid student id format.");
  }
  return id;
}

export function handleApiError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("Could not find the table 'public.students' in the schema cache")
  ) {
    return jsonResponse(
      {
        error:
          "Supabase table public.students was not found. Apply supabase/schema.sql in your Supabase SQL editor first.",
      },
      500,
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const status =
      "status" in error && typeof error.status === "number"
        ? error.status
        : "code" in error && error.code === "23505"
          ? 409
          : 400;

    return jsonResponse(
      {
        error: error.message,
      },
      status,
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return jsonResponse(
      {
        error:
          "Duplicate value found. Email or admission number already exists.",
      },
      409,
    );
  }

  if (error instanceof ZodError) {
    return jsonResponse(
      {
        error: "Validation failed",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      400,
    );
  }

  if (error instanceof Error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ error: "Unexpected server error" }, 500);
}
