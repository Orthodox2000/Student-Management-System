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
