import { getAdminDataConnect } from "@/lib/dataconnect";
import { buildAdmissionNumber } from "@/lib/admission-number";
import type { StudentInput } from "@/lib/types";

type StudentDC = {
  id: string;
  admissionNumber: string;
  name: string;
  course: string;
  year: number;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

type StudentCreateVars = {
  admissionNumber: string;
  name: string;
  course: string;
  year: number;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  photoUrl?: string | null;
};

type StudentUpdateVars = StudentCreateVars & { id: string };

function mapInputToVars(input: StudentInput, photoUrl: string | null | undefined): StudentCreateVars {
  return {
    admissionNumber: buildAdmissionNumber(),
    name: input.name,
    course: input.course,
    year: input.year,
    dateOfBirth: input.dateOfBirth,
    email: input.email,
    mobileNumber: input.mobileNumber,
    gender: input.gender,
    address: input.address,
    photoUrl: photoUrl ?? null,
  };
}

export async function listStudents(search?: string) {
  const dc = getAdminDataConnect();

  if (!search?.trim()) {
    const res = await dc.executeQuery<{ students: StudentDC[] }>("ListStudents");
    return res.data.students ?? [];
  }

  const res = await dc.executeQuery<{ students: StudentDC[] }, { query: string }>(
    "SearchStudents",
    { query: search.trim() },
    undefined,
  );
  return res.data.students ?? [];
}

export async function getStudentById(id: string) {
  const dc = getAdminDataConnect();
  const res = await dc.executeQuery<{ student?: StudentDC | null }, { id: string }>(
    "GetStudentById",
    { id },
    undefined,
  );
  return res.data.student ?? null;
}

export async function createStudent(input: StudentInput, photoUrl: string | null) {
  const dc = getAdminDataConnect();
  const vars = mapInputToVars(input, photoUrl);
  await dc.executeMutation<unknown, StudentCreateVars>("CreateStudent", vars, undefined);

  const created = await findStudentByAdmission(vars.admissionNumber);
  if (!created) {
    throw new Error("Student created but could not be reloaded.");
  }
  return created;
}

export async function updateStudent(
  id: string,
  input: StudentInput,
  photoUrl: string | null | undefined,
) {
  const existing = await getStudentById(id);
  if (!existing) {
    return null;
  }

  const dc = getAdminDataConnect();
  const vars: StudentUpdateVars = {
    ...mapInputToVars(input, photoUrl === undefined ? existing.photoUrl ?? null : photoUrl),
    id,
    admissionNumber: existing.admissionNumber,
  };

  await dc.executeMutation<unknown, StudentUpdateVars>("UpdateStudent", vars, undefined);
  return getStudentById(id);
}

export async function deleteStudent(id: string) {
  const existing = await getStudentById(id);
  if (!existing) {
    return null;
  }

  const dc = getAdminDataConnect();
  await dc.executeMutation<unknown, { id: string }>("DeleteStudent", { id }, undefined);
  return existing;
}

async function findStudentByAdmission(admissionNumber: string) {
  const students = await listStudents(admissionNumber);
  return students.find((item) => item.admissionNumber === admissionNumber) ?? null;
}

export function toStudentDTO(student: StudentDC) {
  return {
    id: student.id,
    admissionNumber: student.admissionNumber,
    name: student.name,
    course: student.course,
    year: student.year,
    dateOfBirth: student.dateOfBirth,
    email: student.email,
    mobileNumber: student.mobileNumber,
    gender: student.gender,
    address: student.address,
    photoUrl: student.photoUrl ?? null,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}
