"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSE_OPTIONS, YEAR_OPTIONS } from "@/lib/student-options";
import { InputField, SectionCard, SectionEyebrow, SelectField, StatCard, TextareaField } from "@/components/student-management/ui";
import type { HealthStatus, Student, StudentFormState } from "@/components/student-management/types";

type FormErrors = Partial<Record<keyof StudentFormState | "photo", string>>;

export function DashboardHero({
  studentCount,
  adminEmail,
}: {
  studentCount: number;
  adminEmail: string;
}) {
  return (
    <SectionCard className="panel-spotlight">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <SectionEyebrow>Student Management Dashboard</SectionEyebrow>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground-strong)] sm:text-4xl">
            Secure operations for admissions, updates, and student records
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--foreground-muted)] sm:text-base">
            The dashboard is focused only on student management. System checks and connection testing now live on a separate page for cleaner day-to-day operations.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface-soft rounded-[1.5rem] p-4">
            <p className="eyebrow">Student Records</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--foreground-strong)]">{studentCount}</p>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">Records loaded for admin actions.</p>
          </div>
          <div className="surface-soft rounded-[1.5rem] p-4">
            <p className="eyebrow">Admin Account</p>
            <p className="mt-3 text-base font-semibold text-[var(--foreground-strong)]">{adminEmail}</p>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">Local autofill can be enabled with optional public demo env variables. Production credentials should stay server-only.</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function DashboardStats({
  students,
  health,
}: {
  students: Student[];
  health: HealthStatus | null;
}) {
  return (
    <section id="api-connections" className="dashboard-grid">
      <StatCard label="Total Students" value={String(students.length)} note="Loaded from secured API" />
      <StatCard label="API Status" value={health?.status ?? "..."} note="Health route visibility" />
      <StatCard label="Supabase" value={health?.database?.status ?? "unknown"} note="Supabase Postgres + storage" />
      <StatCard label="Courses Offered" value={String(COURSE_OPTIONS.length)} note="Controlled options for consistent formatting" />
    </section>
  );
}

export function AdminActionPanel({
  editingId,
  seedLoading,
  onAddNew,
  onScrollToForm,
  onScrollToStudents,
  onOpenChecks,
  onSeedStudents,
}: {
  editingId: string | null;
  seedLoading: boolean;
  onAddNew: () => void;
  onScrollToForm: () => void;
  onScrollToStudents: () => void;
  onOpenChecks: () => void;
  onSeedStudents: () => void;
}) {
  return (
    <SectionCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <SectionEyebrow>Admin Actions</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]">
            Choose what you want to manage next
          </h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={onAddNew} className="action-primary min-h-16 px-5 py-4 text-sm font-semibold">
          Add New Student
        </button>
        <button type="button" onClick={onScrollToForm} className="action-secondary min-h-16 px-5 py-4 text-sm font-semibold">
          {editingId ? "Continue Editing" : "Open Student Form"}
        </button>
        <button type="button" onClick={onScrollToStudents} className="action-secondary min-h-16 px-5 py-4 text-sm font-semibold">
          Click Here To Edit Existing Data
        </button>
        <button type="button" onClick={onOpenChecks} className="action-secondary min-h-16 px-5 py-4 text-sm font-semibold">
          Open System Checks
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={onSeedStudents} className="action-secondary px-5 py-3 text-sm font-semibold">
          {seedLoading ? "Loading Samples..." : "Load Dummy Students"}
        </button>
      </div>
    </SectionCard>
  );
}

export function StudentFormPanel({
  courseOptions,
  form,
  errors,
  formLoading,
  message,
  removePhoto,
  onClear,
  onAddCourse,
  onSubmit,
  onChange,
  onGenderChange,
  onPhotoChange,
  onRemovePhotoChange,
}: {
  courseOptions: readonly string[];
  form: StudentFormState;
  errors: FormErrors;
  formLoading: boolean;
  message: string;
  removePhoto: boolean;
  onClear: () => void;
  onAddCourse: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (field: keyof StudentFormState, value: string) => void;
  onGenderChange: (value: Student["gender"]) => void;
  onPhotoChange: (file: File | null) => void;
  onRemovePhotoChange: (value: boolean) => void;
}) {
  return (
    <SectionCard>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <SectionEyebrow>Add Student</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]">
            Capture student information
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAddCourse} className="action-secondary px-4 py-2 text-sm font-semibold">
            Add Course
          </button>
          <button type="button" onClick={onClear} className="action-secondary px-4 py-2 text-sm font-semibold">
            Clear Form
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="surface-soft rounded-[1.5rem] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">Available Courses</p>
          <p className="mt-2 text-sm text-[var(--foreground-strong)]">
            {courseOptions.length} controlled course options are available for consistent formatting.
          </p>
        </div>
        <div className="surface-soft rounded-[1.5rem] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">Photo Reference</p>
          <p className="mt-2 text-sm text-[var(--foreground-strong)]">
            Stored in a Supabase storage bucket and linked with the student record.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <InputField label="Full Name" value={form.name} onChange={(value) => onChange("name", value)} required placeholder="Enter student name" error={errors.name} className="sm:col-span-2" />
        <SelectField label="Course" value={form.course} onChange={(value) => onChange("course", value)} error={errors.course}>
          <option value="">Select a course</option>
          {courseOptions.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </SelectField>
        <SelectField label="Year" value={form.year} onChange={(value) => onChange("year", value)} error={errors.year}>
          <option value="">Select year</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={String(year)}>
              Year {year}
            </option>
          ))}
        </SelectField>
        <InputField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => onChange("dateOfBirth", value)} required error={errors.dateOfBirth} />
        <InputField label="Email" type="email" value={form.email} onChange={(value) => onChange("email", value)} required placeholder="student@example.com" error={errors.email} maxLength={180} />
        <InputField label="Mobile Number" value={form.mobileNumber} onChange={(value) => onChange("mobileNumber", value)} required placeholder="+91 9876543210" error={errors.mobileNumber} maxLength={14} inputMode="numeric" />

        <SelectField label="Gender" value={form.gender} onChange={(value) => onGenderChange(value as Student["gender"])} error={errors.gender}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </SelectField>

        <label className="field-label">
          Student Photo
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={(event) => onPhotoChange(event.target.files?.[0] ?? null)}
            className={`field-input mt-2 ${errors.photo ? "field-input-error" : ""}`}
          />
          {errors.photo ? <span className="mt-2 block text-xs text-[var(--danger)]">{errors.photo}</span> : null}
        </label>

        <TextareaField label="Address" value={form.address} onChange={(value) => onChange("address", value)} required placeholder="Full student address" error={errors.address} className="sm:col-span-2" />

        <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={formLoading} className="action-primary justify-center px-5 py-3 text-sm font-semibold disabled:opacity-50">
            {formLoading ? "Saving..." : "Add Student"}
          </button>
          {message ? <p className="text-sm text-[var(--success-strong)] dark:text-[var(--success)]">{message}</p> : null}
        </div>
      </form>
    </SectionCard>
  );
}

export function EditStudentModal({
  open,
  studentName,
  courseOptions,
  form,
  errors,
  formLoading,
  message,
  removePhoto,
  onClose,
  onSubmit,
  onChange,
  onGenderChange,
  onPhotoChange,
  onRemovePhotoChange,
}: {
  open: boolean;
  studentName: string | null;
  courseOptions: readonly string[];
  form: StudentFormState;
  errors: FormErrors;
  formLoading: boolean;
  message: string;
  removePhoto: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (field: keyof StudentFormState, value: string) => void;
  onGenderChange: (value: Student["gender"]) => void;
  onPhotoChange: (file: File | null) => void;
  onRemovePhotoChange: (value: boolean) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="flex min-h-full items-start justify-center">
        <SectionCard className="my-4 w-full max-w-4xl overflow-visible">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <SectionEyebrow>Update Student</SectionEyebrow>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]">
                Edit existing student details
              </h2>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                {studentName ? `Updating ${studentName}` : "Update the selected student and confirm before saving."}
              </p>
            </div>
            <button type="button" onClick={onClose} className="action-secondary px-4 py-2 text-sm font-semibold">
              Close
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Full Name" value={form.name} onChange={(value) => onChange("name", value)} required placeholder="Enter student name" error={errors.name} className="sm:col-span-2" />
              <SelectField label="Course" value={form.course} onChange={(value) => onChange("course", value)} error={errors.course}>
                <option value="">Select a course</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Year" value={form.year} onChange={(value) => onChange("year", value)} error={errors.year}>
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={String(year)}>
                    Year {year}
                  </option>
                ))}
              </SelectField>
              <InputField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => onChange("dateOfBirth", value)} required error={errors.dateOfBirth} />
              <InputField label="Email" type="email" value={form.email} onChange={(value) => onChange("email", value)} required placeholder="student@example.com" error={errors.email} maxLength={180} />
              <InputField label="Mobile Number" value={form.mobileNumber} onChange={(value) => onChange("mobileNumber", value)} required placeholder="+91 9876543210" error={errors.mobileNumber} maxLength={14} inputMode="numeric" />

              <SelectField label="Gender" value={form.gender} onChange={(value) => onGenderChange(value as Student["gender"])} error={errors.gender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </SelectField>

              <label className="field-label">
                Student Photo
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(event) => onPhotoChange(event.target.files?.[0] ?? null)}
                  className={`field-input mt-2 ${errors.photo ? "field-input-error" : ""}`}
                />
                {errors.photo ? <span className="mt-2 block text-xs text-[var(--danger)]">{errors.photo}</span> : null}
              </label>

              <TextareaField label="Address" value={form.address} onChange={(value) => onChange("address", value)} required placeholder="Full student address" error={errors.address} className="sm:col-span-2" />

              <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <input type="checkbox" checked={removePhoto} onChange={(event) => onRemovePhotoChange(event.target.checked)} />
                Remove existing photo
              </label>
            </div>

            <div className="sticky bottom-0 mt-6 rounded-[1.25rem] border border-[var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {message ? <p className="text-sm text-[var(--success-strong)] dark:text-[var(--success)]">{message}</p> : <span />}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="button" onClick={onClose} className="action-secondary px-5 py-3 text-sm font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={formLoading} className="action-primary justify-center px-5 py-3 text-sm font-semibold disabled:opacity-50">
                    {formLoading ? "Saving..." : "Update Student"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

export function StudentListPanel({
  query,
  students,
  totalStudents,
  loading,
  onQueryChange,
  onSearch,
  onEdit,
  onDelete,
}: {
  query: string;
  students: Student[];
  totalStudents: number;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: (event: React.FormEvent) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}) {
  const [showTable, setShowTable] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(students.length / 30));

  useEffect(() => {
    setPage(1);
  }, [query, students.length]);

  const pagedStudents = useMemo(() => {
    const start = (page - 1) * 30;
    return students.slice(start, start + 30);
  }, [page, students]);

  return (
    <SectionCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow>Student Directory</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground-strong)]">
            Structured student list with quick actions
          </h2>
        </div>
        <div className="surface-soft rounded-[1.25rem] px-4 py-3 text-sm text-[var(--foreground-muted)]">
          {loading ? "Syncing records..." : `${totalStudents} total record(s) in database`}
        </div>
      </div>

      <div className="mt-5">
        {!showTable ? (
          <button type="button" onClick={() => setShowTable(true)} className="action-primary px-5 py-3 text-sm font-semibold">
            Click Here To Edit Existing Data
          </button>
        ) : (
          <>
            <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
              <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search by name, course, email, admission number..." className="field-input w-full" />
              <button className="action-primary justify-center px-5 py-3 text-sm font-semibold">Search</button>
            </form>

            {loading ? (
              <p className="mt-5 text-sm text-[var(--foreground-muted)]">Loading students...</p>
            ) : students.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-[var(--border-soft)] px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
                No students found. Add a student or widen your search.
              </div>
            ) : (
              <>
                <div className="mt-5 overflow-x-auto rounded-[1.5rem] border border-[var(--border-soft)]">
                  <table className="min-w-full text-left text-sm">
                    <thead className="surface-soft text-[var(--foreground-strong)]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">Admission No.</th>
                        <th className="px-4 py-3 font-semibold">Course</th>
                        <th className="px-4 py-3 font-semibold">Year</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Mobile</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedStudents.map((student) => (
                        <tr key={student.id} className="border-t border-[var(--border-soft)]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={student.photoUrl ?? "/placeholder-student.svg"} alt={student.name} className="h-12 w-12 rounded-[1rem] object-cover" />
                              <div>
                                <p className="font-semibold text-[var(--foreground-strong)]">{student.name}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">{student.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--foreground-muted)]">{student.admissionNumber}</td>
                          <td className="px-4 py-3 text-[var(--foreground-muted)]">{student.course}</td>
                          <td className="px-4 py-3 text-[var(--foreground-muted)]">Year {student.year}</td>
                          <td className="px-4 py-3 text-[var(--foreground-muted)]">{student.email}</td>
                          <td className="px-4 py-3 text-[var(--foreground-muted)]">{student.mobileNumber}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => onEdit(student)} className="action-secondary px-4 py-2 text-xs font-semibold">
                                Edit
                              </button>
                              <button type="button" onClick={() => onDelete(student.id)} className="danger-button px-4 py-2 text-xs font-semibold">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Showing {pagedStudents.length} of {students.length} filtered students. Total database records: {totalStudents}. Max 30 per page.
                  </p>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPage((previous) => Math.max(1, previous - 1))} disabled={page === 1} className="action-secondary px-4 py-2 text-sm font-semibold disabled:opacity-50">
                      Previous
                    </button>
                    <span className="surface-soft rounded-full px-4 py-2 text-sm text-[var(--foreground-strong)]">
                      Page {page} of {totalPages}
                    </span>
                    <button type="button" onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))} disabled={page === totalPages} className="action-secondary px-4 py-2 text-sm font-semibold disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </SectionCard>
  );
}


