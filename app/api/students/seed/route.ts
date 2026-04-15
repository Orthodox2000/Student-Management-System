import { handleApiError, jsonResponse } from "@/lib/api";
import { handleAuthError, requireFirebaseAuth } from "@/lib/firebase-auth";
import { createStudent, listStudents } from "@/lib/student-repository";
import { sampleStudents } from "@/lib/sample-students";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireFirebaseAuth(request);

    const existingStudents = await listStudents();
    const existingEmails = new Set(existingStudents.map((student) => student.email.toLowerCase()));

    let created = 0;
    let skipped = 0;

    for (const student of sampleStudents) {
      if (existingEmails.has(student.email.toLowerCase())) {
        skipped += 1;
        continue;
      }

      await createStudent(student, null);
      existingEmails.add(student.email.toLowerCase());
      created += 1;
    }

    return jsonResponse({
      created,
      skipped,
      message:
        created > 0
          ? `${created} dummy student record(s) added successfully.`
          : "All dummy students already exist.",
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unauthorized:")) {
      return handleAuthError(error);
    }
    return handleApiError(error);
  }
}
