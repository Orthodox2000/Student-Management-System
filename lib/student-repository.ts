import { getSupabaseAdmin } from "@/lib/supabase";
import { buildAdmissionNumber } from "@/lib/admission-number";
import { formatIndianPhoneForStorage, sanitizePhone } from "@/lib/sanitize";
import type { StudentInput } from "@/lib/types";

type StudentRow = {
  id: string;
  admission_number: string;
  name: string;
  course: string;
  year: number;
  date_of_birth: string;
  email: string;
  mobile_number: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

type StudentInsert = {
  admission_number: string;
  name: string;
  course: string;
  year: number;
  date_of_birth: string;
  email: string;
  mobile_number: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  photo_url: string | null;
};

function mapInputToInsert(input: StudentInput, photoUrl: string | null | undefined): StudentInsert {
  return {
    admission_number: buildAdmissionNumber(),
    name: input.name,
    course: input.course,
    year: input.year,
    date_of_birth: input.dateOfBirth,
    email: input.email,
    mobile_number: formatIndianPhoneForStorage(input.mobileNumber),
    gender: input.gender,
    address: input.address,
    photo_url: photoUrl ?? null,
  };
}

function mapRow(row: StudentRow) {
  return {
    id: row.id,
    admissionNumber: row.admission_number,
    name: row.name,
    course: row.course,
    year: row.year,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    mobileNumber: sanitizePhone(row.mobile_number),
    gender: row.gender,
    address: row.address,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listStudents(search?: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    const pattern = `%${normalizedSearch}%`;
    query = query.or([
      `name.ilike.${pattern}`,
      `course.ilike.${pattern}`,
      `email.ilike.${pattern}`,
      `admission_number.ilike.${pattern}`,
      `mobile_number.ilike.${pattern}`,
    ].join(","));
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getStudentById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as StudentRow) : null;
}

export async function createStudent(input: StudentInput, photoUrl: string | null) {
  const supabase = getSupabaseAdmin();
  const payload = mapInputToInsert(input, photoUrl);
  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as StudentRow);
}

export async function updateStudent(id: string, input: StudentInput, photoUrl: string | null | undefined) {
  const existing = await getStudentById(id);
  if (!existing) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const nextPhotoUrl = photoUrl === undefined ? existing.photoUrl : photoUrl;
  const { data, error } = await supabase
    .from("students")
    .update({
      name: input.name,
      course: input.course,
      year: input.year,
      date_of_birth: input.dateOfBirth,
      email: input.email,
      mobile_number: formatIndianPhoneForStorage(input.mobileNumber),
      gender: input.gender,
      address: input.address,
      photo_url: nextPhotoUrl,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as StudentRow);
}

export async function deleteStudent(id: string) {
  const existing = await getStudentById(id);
  if (!existing) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
  return existing;
}

export function toStudentDTO(student: ReturnType<typeof mapRow>) {
  return student;
}
