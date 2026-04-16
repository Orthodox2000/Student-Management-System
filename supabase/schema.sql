create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  admission_number varchar(24) not null unique,
  name varchar(160) not null,
  course varchar(120) not null,
  year integer not null check (year between 1 and 8),
  date_of_birth date not null,
  email varchar(180) not null unique,
  mobile_number varchar(20) not null,
  gender varchar(12) not null check (gender in ('Male', 'Female', 'Other')),
  address text not null,
  photo_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_students_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row
execute function public.set_students_updated_at();

create index if not exists students_name_idx on public.students (name);
create index if not exists students_course_idx on public.students (course);
create index if not exists students_created_at_idx on public.students (created_at desc);
