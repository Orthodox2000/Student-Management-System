export type Gender = "Male" | "Female" | "Other";

export type StudentInput = {
  name: string;
  course: string;
  year: number;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  gender: Gender;
  address: string;
};
