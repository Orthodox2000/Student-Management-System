import { handleApiError, jsonResponse } from "@/lib/api";
import { handleAuthError, requireFirebaseAuth } from "@/lib/firebase-auth";
import { savePhoto } from "@/lib/file-storage";
import { parseStudentFormData } from "@/lib/student-form-data";
import { createStudent, listStudents, toStudentDTO } from "@/lib/student-repository";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireFirebaseAuth(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") ?? undefined;
    const students = await listStudents(query);
    return jsonResponse({ students: students.map(toStudentDTO) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireFirebaseAuth(request);
    const { parsed, photoFile } = await parseStudentFormData(request);
    const photoUrl = photoFile ? await savePhoto(photoFile) : null;
    const created = await createStudent(parsed, photoUrl);

    return jsonResponse(
      {
        message: "Student created successfully",
        student: toStudentDTO(created),
      },
      201,
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
