import { handleApiError, jsonResponse, parseId } from "@/lib/api";
import { handleAuthError, requireFirebaseAuth } from "@/lib/firebase-auth";
import { savePhoto } from "@/lib/file-storage";
import { parseStudentFormData } from "@/lib/student-form-data";
import {
  deleteStudent,
  getStudentById,
  toStudentDTO,
  updateStudent,
} from "@/lib/student-repository";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireFirebaseAuth(_request);
    const { id } = await params;
    const student = await getStudentById(parseId(id));
    if (!student) {
      return jsonResponse({ error: "Student not found" }, 404);
    }
    return jsonResponse({ student: toStudentDTO(student) });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireFirebaseAuth(request);
    const { id } = await params;
    const studentId = parseId(id);
    const { parsed, photoFile, removePhoto } = await parseStudentFormData(request);
    const photoUrl = removePhoto ? null : photoFile ? await savePhoto(photoFile) : undefined;
    const updated = await updateStudent(studentId, parsed, photoUrl);

    if (!updated) {
      return jsonResponse({ error: "Student not found" }, 404);
    }

    return jsonResponse({
      message: "Student updated successfully",
      student: toStudentDTO(updated),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireFirebaseAuth(_request);
    const { id } = await params;
    const deleted = await deleteStudent(parseId(id));
    if (!deleted) {
      return jsonResponse({ error: "Student not found" }, 404);
    }
    return jsonResponse({ message: "Student deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
