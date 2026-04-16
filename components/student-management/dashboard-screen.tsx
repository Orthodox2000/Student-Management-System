"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminActionPanel, DashboardHero, DashboardStats, EditStudentModal, StudentFormPanel, StudentListPanel } from "@/components/student-management/dashboard-panels";
import { ManagementNavbar } from "@/components/student-management/management-navbar";
import { SectionCard, SectionEyebrow } from "@/components/student-management/ui";
import type { HealthStatus, Student, StudentFormState } from "@/components/student-management/types";
import { useAdminSession } from "@/components/student-management/use-admin-session";
import { useThemeMode } from "@/components/student-management/use-theme-mode";
import { COURSE_OPTIONS, normalizeCourseLabel } from "@/lib/student-options";
import { studentFormSchema } from "@/lib/student-schema";
import { sanitizeDate, sanitizeEmail, sanitizeMultilineText, sanitizePhone, sanitizeText } from "@/lib/sanitize";

const initialForm: StudentFormState = {
  name: "",
  course: "",
  year: "1",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  gender: "Male",
  address: "",
};

const adminAccount = {
  email: process.env.NEXT_PUBLIC_ADMIN_LOGIN_EMAIL ?? "Configured on server",
};
const SESSION_STORAGE_KEY = "pillai_admin_session_token";

type FormErrors = Partial<Record<keyof StudentFormState | "photo", string>>;

function sanitizeFormValue(field: keyof StudentFormState, value: string) {
  switch (field) {
    case "email":
      return sanitizeEmail(value);
    case "mobileNumber":
      return sanitizePhone(value);
    case "dateOfBirth":
      return sanitizeDate(value);
    case "address":
      return sanitizeMultilineText(value);
    default:
      return sanitizeText(value);
  }
}

function mapZodErrors(form: StudentFormState) {
  const result = studentFormSchema.safeParse(form);
  if (result.success) {
    return { parsed: result.data, errors: {} as FormErrors };
  }

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof StudentFormState] = issue.message;
    }
  }

  return { parsed: null, errors };
}

function getSessionHeaders() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const token = window.localStorage.getItem(SESSION_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function DashboardScreen() {
  const router = useRouter();
  const { user, loading, error } = useAdminSession("protected");
  const { darkMode, toggleTheme } = useThemeMode();

  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const studentSectionRef = useRef<HTMLDivElement | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([...COURSE_OPTIONS]);
  const [query, setQuery] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [message, setMessage] = useState(error ?? "");
  const [addForm, setAddForm] = useState<StudentFormState>(initialForm);
  const [addFormErrors, setAddFormErrors] = useState<FormErrors>({});
  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StudentFormState>(initialForm);
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const editingStudent = useMemo(
    () => students.find((student) => student.id === editingId) ?? null,
    [editingId, students],
  );

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return students;
    }

    return students.filter((student) => {
      const haystack = [
        student.name,
        student.course,
        student.email,
        student.admissionNumber,
        student.mobileNumber,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, students]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadHealth();
    void loadStudents();
  }, [user]);

  useEffect(() => {
    if (!editingStudent) return;
    setEditForm({
      name: editingStudent.name,
      course: editingStudent.course,
      year: String(editingStudent.year),
      dateOfBirth: editingStudent.dateOfBirth.slice(0, 10),
      email: editingStudent.email,
      mobileNumber: editingStudent.mobileNumber,
      gender: editingStudent.gender,
      address: editingStudent.address,
    });
    setEditFormErrors({});
  }, [editingStudent]);

  async function loadStudents() {
    if (!user) return;
    setListLoading(true);
    try {
      const res = await fetch("/api/students", {
        cache: "no-store",
        credentials: "include",
        headers: getSessionHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load students");
      setStudents(data.students ?? []);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to load students");
    } finally {
      setListLoading(false);
    }
  }

  async function loadHealth() {
    try {
      const res = await fetch("/api/health", {
        cache: "no-store",
        credentials: "include",
        headers: getSessionHeaders(),
      });
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ status: "degraded", database: { status: "unavailable", provider: "supabase" } });
    }
  }

  function handleAddFormChange(field: keyof StudentFormState, value: string) {
    setAddForm((previous) => ({ ...previous, [field]: sanitizeFormValue(field, value) }));
    setAddFormErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleEditFormChange(field: keyof StudentFormState, value: string) {
    setEditForm((previous) => ({ ...previous, [field]: sanitizeFormValue(field, value) }));
    setEditFormErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleAddCourse() {
    const entered = window.prompt("Enter the new course name");
    if (!entered) return;
    const nextCourse = normalizeCourseLabel(sanitizeText(entered));

    if (nextCourse.length < 2) {
      setMessage("Course name must be at least 2 characters.");
      return;
    }

    if (!/^[A-Za-z0-9&/().+\-\s]+$/.test(nextCourse)) {
      setMessage("Course name contains invalid characters.");
      return;
    }

    setCourseOptions((previous) => {
      if (previous.includes(nextCourse)) {
        return previous;
      }
      return [...previous, nextCourse];
    });
    setAddForm((previous) => ({ ...previous, course: nextCourse }));
    setMessage(`Course ${nextCourse} added to the available options.`);
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
  }

  async function handleAddSubmit(event: FormEvent) {
    event.preventDefault();
    setFormLoading(true);
    setMessage("");

    const sanitizedForm: StudentFormState = {
      name: sanitizeText(addForm.name),
      course: addForm.course,
      year: sanitizeText(addForm.year),
      dateOfBirth: sanitizeDate(addForm.dateOfBirth),
      email: sanitizeEmail(addForm.email),
      mobileNumber: sanitizePhone(addForm.mobileNumber),
      gender: addForm.gender,
      address: sanitizeMultilineText(addForm.address),
    };

    const { parsed, errors } = mapZodErrors(sanitizedForm);
    const nextErrors: FormErrors = { ...errors };

    if (addPhotoFile && addPhotoFile.size > 5 * 1024 * 1024) {
      nextErrors.photo = "Photo must be 5MB or smaller.";
    }

    if (Object.keys(nextErrors).length > 0 || !parsed) {
      setAddFormErrors(nextErrors);
      setFormLoading(false);
      setMessage("Please correct the highlighted fields before saving.");
      return;
    }

    const payload = new FormData();
    payload.set("name", parsed.name);
    payload.set("course", parsed.course);
    payload.set("year", String(parsed.year));
    payload.set("dateOfBirth", parsed.dateOfBirth);
    payload.set("email", parsed.email);
    payload.set("mobileNumber", parsed.mobileNumber);
    payload.set("gender", parsed.gender);
    payload.set("address", parsed.address);
    if (addPhotoFile) payload.set("photo", addPhotoFile);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        body: payload,
        credentials: "include",
        headers: getSessionHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not save student");
        return;
      }

      setMessage("Student added successfully.");
      clearAddForm();
      await loadStudents();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unexpected error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(studentId: string) {
    if (!window.confirm("Delete this student record?")) return;
    const res = await fetch(`/api/students/${studentId}`, {
      method: "DELETE",
      credentials: "include",
      headers: getSessionHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage("Student deleted.");
      await loadStudents();
      return;
    }
    setMessage(data.error ?? "Could not delete student");
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setFormLoading(true);
    setMessage("");

    const sanitizedForm: StudentFormState = {
      name: sanitizeText(editForm.name),
      course: editForm.course,
      year: sanitizeText(editForm.year),
      dateOfBirth: sanitizeDate(editForm.dateOfBirth),
      email: sanitizeEmail(editForm.email),
      mobileNumber: sanitizePhone(editForm.mobileNumber),
      gender: editForm.gender,
      address: sanitizeMultilineText(editForm.address),
    };

    const { parsed, errors } = mapZodErrors(sanitizedForm);
    const nextErrors: FormErrors = { ...errors };

    if (editPhotoFile && editPhotoFile.size > 5 * 1024 * 1024) {
      nextErrors.photo = "Photo must be 5MB or smaller.";
    }

    if (Object.keys(nextErrors).length > 0 || !parsed) {
      setEditFormErrors(nextErrors);
      setFormLoading(false);
      setMessage("Please correct the highlighted fields before saving.");
      return;
    }

    if (!window.confirm("Save changes to this student record?")) {
      setFormLoading(false);
      return;
    }

    const payload = new FormData();
    payload.set("name", parsed.name);
    payload.set("course", parsed.course);
    payload.set("year", String(parsed.year));
    payload.set("dateOfBirth", parsed.dateOfBirth);
    payload.set("email", parsed.email);
    payload.set("mobileNumber", parsed.mobileNumber);
    payload.set("gender", parsed.gender);
    payload.set("address", parsed.address);
    if (editPhotoFile) payload.set("photo", editPhotoFile);
    if (removePhoto) payload.set("removePhoto", "true");

    try {
      const res = await fetch(`/api/students/${editingId}`, {
        method: "PUT",
        body: payload,
        credentials: "include",
        headers: getSessionHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not save student");
        return;
      }

      setMessage("Student updated successfully.");
      closeEditModal();
      await loadStudents();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unexpected error");
    } finally {
      setFormLoading(false);
    }
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setEditPhotoFile(null);
    setRemovePhoto(false);
    setEditOpen(true);
  }

  function clearAddForm() {
    setAddForm(initialForm);
    setAddFormErrors({});
    setAddPhotoFile(null);
  }

  function closeEditModal() {
    setEditOpen(false);
    setEditingId(null);
    setEditForm(initialForm);
    setEditFormErrors({});
    setEditPhotoFile(null);
    setRemovePhoto(false);
  }

  async function seedDummyStudents() {
    setSeedLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/students/seed", {
        method: "POST",
        credentials: "include",
        headers: getSessionHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Unable to add dummy students");
      }
      setMessage(data.message ?? "Dummy students loaded.");
      await loadStudents();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to load dummy students");
    } finally {
      setSeedLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: getSessionHeaders(),
    });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  if (loading) {
    return (
      <div className="app-shell student-scene">
        <div className="section-shell flex min-h-dvh items-center justify-center px-4 py-10">
          <SectionCard className="max-w-md text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--accent-strong)]" />
            <SectionEyebrow>Loading Dashboard</SectionEyebrow>
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">Verifying the admin session before opening the student management dashboard.</p>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell student-scene">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <ManagementNavbar
        darkMode={darkMode}
        email={user?.email ?? null}
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard#student-list", label: "Edit Students" },
          { href: "/checks", label: "System Checks" },
        ]}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <main className="section-shell px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-6">
        <DashboardHero studentCount={students.length} adminEmail={adminAccount.email} />
        <div className="mt-6">
          <DashboardStats students={students} health={health} />
        </div>
        <div className="mt-6">
          <AdminActionPanel
            editingId={editingId}
            seedLoading={seedLoading}
            onAddNew={() => {
              clearAddForm();
              formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onScrollToForm={() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            onScrollToStudents={() => studentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            onOpenChecks={() => router.push("/checks")}
            onSeedStudents={() => void seedDummyStudents()}
          />
        </div>
        <section className="mt-6 space-y-6">
          <div ref={formSectionRef}>
            <StudentFormPanel
              courseOptions={courseOptions}
              form={addForm}
              errors={addFormErrors}
              formLoading={formLoading}
              message={message}
              removePhoto={false}
              onClear={clearAddForm}
              onAddCourse={handleAddCourse}
              onSubmit={handleAddSubmit}
              onChange={handleAddFormChange}
              onGenderChange={(value) => {
                setAddForm((previous) => ({ ...previous, gender: value }));
                setAddFormErrors((previous) => ({ ...previous, gender: undefined }));
              }}
              onPhotoChange={(file) => {
                setAddPhotoFile(file);
                setAddFormErrors((previous) => ({ ...previous, photo: undefined }));
              }}
              onRemovePhotoChange={() => {}}
            />
          </div>
          <div ref={studentSectionRef} id="student-list">
            <StudentListPanel
              query={query}
              students={filteredStudents}
              totalStudents={students.length}
              loading={listLoading}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              onEdit={startEdit}
              onDelete={(id) => void handleDelete(id)}
            />
          </div>
        </section>
        <EditStudentModal
          open={editOpen}
          studentName={editingStudent?.name ?? null}
          courseOptions={courseOptions}
          form={editForm}
          errors={editFormErrors}
          formLoading={formLoading}
          message={message}
          removePhoto={removePhoto}
          onClose={closeEditModal}
          onSubmit={handleEditSubmit}
          onChange={handleEditFormChange}
          onGenderChange={(value) => {
            setEditForm((previous) => ({ ...previous, gender: value }));
            setEditFormErrors((previous) => ({ ...previous, gender: undefined }));
          }}
          onPhotoChange={(file) => {
            setEditPhotoFile(file);
            setEditFormErrors((previous) => ({ ...previous, photo: undefined }));
          }}
          onRemovePhotoChange={setRemovePhoto}
        />
      </main>
    </div>
  );
}
