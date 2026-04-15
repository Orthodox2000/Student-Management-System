export const COURSE_OPTIONS = [
  "BCA",
  "BBA",
  "BCom",
  "BSc IT",
  "BAF",
  "BMS",
  "MBA",
  "MCA",
] as const;

export const YEAR_OPTIONS = [1, 2, 3, 4] as const;

export type CourseOption = (typeof COURSE_OPTIONS)[number];
export type YearOption = (typeof YEAR_OPTIONS)[number];

export function isCourseOption(value: string): value is CourseOption {
  return COURSE_OPTIONS.includes(value as CourseOption);
}

export function isYearOption(value: number): value is YearOption {
  return YEAR_OPTIONS.includes(value as YearOption);
}

export function normalizeCourseLabel(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
