export type HealthStatus = {
  status: string;
  database?: { status: string; provider?: string; message?: string };
  storage?: { status: string; provider?: string; message?: string };
};

export type Student = {
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
  photoUrl: string | null;
};

export type AdminUser = {
  email: string | null;
};

export type StudentFormState = {
  name: string;
  course: string;
  year: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  gender: Student["gender"];
  address: string;
};
