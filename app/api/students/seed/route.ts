import { handleApiError, jsonResponse } from "@/lib/api";
import { handleAdminAuthError, requireAdminSession } from "@/lib/admin-session";
import { sampleStudents } from "@/lib/sample-students";
import { createStudent } from "@/lib/student-repository";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);

    const created = [];
    for (const student of sampleStudents) {
      try {
        const row = await createStudent(student, null);
        created.push(row);
      } catch (error) {
        const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
        if (code !== "23505") {
          throw error;
        }
      }
    }

    return jsonResponse({
      message: created.length > 0 ? `Loaded ${created.length} dummy students.` : "Dummy students already exist.",
      students: created,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAdminAuthError(error);
    }
    return handleApiError(error);
  }
}
