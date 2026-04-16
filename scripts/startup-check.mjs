import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const checks = [];
const failures = [];
const warnings = [];

function normalizeEnvValue(value) {
  return String(value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function loadDotEnv() {
  const paths = [".env.local"];
  for (const relativePath of paths) {
    const envPath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const value = normalizeEnvValue(line.slice(eq + 1));
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function assertCheck(condition, message) {
  if (condition) {
    checks.push(message);
  } else {
    failures.push(message);
  }
}

function assertConfigured(name) {
  if (requiredEnv(name)) {
    checks.push(`${name} is configured`);
  } else {
    failures.push(`${name} is missing`);
  }
}

function routeHasMethod(filePath, method) {
  const content = fs.readFileSync(filePath, "utf8");
  return new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`).test(content);
}

function buildAdmissionNumber(sequence = Number(String(Date.now()).slice(-5)), year = 2026) {
  return `PU${year}${String(sequence).padStart(5, "0")}`;
}

function requiredEnv(name) {
  const value = normalizeEnvValue(process.env[name]);
  return value;
}

loadDotEnv();

assertCheck(/^PU\d{9}$/.test(buildAdmissionNumber(42)), "Admission number format check passed");
assertCheck(fs.existsSync(path.join(process.cwd(), ".env.example")), ".env.example exists");

const requiredEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "ADMIN_LOGIN_EMAIL",
  "ADMIN_LOGIN_PASSWORD",
  "AUTH_SESSION_SECRET",
];

for (const key of requiredEnvKeys) {
  assertConfigured(key);
}

if (requiredEnv("SUPABASE_SERVICE_ROLE_KEY").startsWith("sb_publishable_")) {
  failures.push(
    "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Replace it with the Supabase secret or service-role key.",
  );
} else {
  checks.push("SUPABASE_SERVICE_ROLE_KEY is using a server-side secret key");
}

const requiredRoutes = [
  { file: "app/api/auth/admin-login/route.ts", methods: ["POST"], label: "/api/auth/admin-login" },
  { file: "app/api/auth/logout/route.ts", methods: ["POST"], label: "/api/auth/logout" },
  { file: "app/api/auth/me/route.ts", methods: ["GET"], label: "/api/auth/me" },
  { file: "app/api/health/supabase/route.ts", methods: ["GET"], label: "/api/health/supabase" },
  { file: "app/api/health/route.ts", methods: ["GET"], label: "/api/health" },
  { file: "app/api/students/route.ts", methods: ["GET", "POST"], label: "/api/students" },
  { file: "app/api/students/seed/route.ts", methods: ["POST"], label: "/api/students/seed" },
  { file: "app/api/students/[id]/route.ts", methods: ["GET", "PUT", "DELETE"], label: "/api/students/:id" },
];

for (const route of requiredRoutes) {
  const fullPath = path.join(process.cwd(), route.file);
  assertCheck(fs.existsSync(fullPath), `Route file exists for ${route.label}`);
  if (fs.existsSync(fullPath)) {
    for (const method of route.methods) {
      assertCheck(routeHasMethod(fullPath, method), `${route.label} exports ${method} handler`);
    }
  }
}

async function checkSupabase() {
  if (String(process.env.SKIP_SUPABASE_CHECK ?? "").toLowerCase() === "true") {
    warnings.push("Skipped Supabase startup check (`SKIP_SUPABASE_CHECK=true`)");
    return;
  }

  try {
    const client = createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (requiredEnv("SUPABASE_SERVICE_ROLE_KEY").startsWith("sb_publishable_")) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Replace it with the Supabase secret or service-role key.",
      );
    }

    const [{ error: databaseError }, { data: buckets, error: bucketError }] = await Promise.all([
      client.from("students").select("id", { head: true, count: "exact" }),
      client.storage.listBuckets(),
    ]);

    if (databaseError) {
      throw new Error(databaseError.message);
    }

    if (bucketError) {
      throw new Error(bucketError.message);
    }

    const bucketExists = (buckets ?? []).some((bucket) => bucket.name === requiredEnv("SUPABASE_STORAGE_BUCKET"));
    if (!bucketExists) {
      throw new Error(
        `Storage bucket ${requiredEnv("SUPABASE_STORAGE_BUCKET")} was not found. Create that public bucket in Supabase Storage or update SUPABASE_STORAGE_BUCKET.`,
      );
    }

    checks.push("Supabase database and storage check passed");
  } catch (error) {
    failures.push(`Supabase check failed (${error instanceof Error ? error.message : "unknown error"}).`);
  }
}

await checkSupabase();

if (failures.length > 0) {
  if (checks.length > 0) {
    console.error("Checks completed before failure:");
    for (const line of checks) console.error(`- ${line}`);
  }
  if (warnings.length > 0) {
    console.error("Warnings:");
    for (const line of warnings) console.error(`- ${line}`);
  }
  console.error("Startup checks failed:");
  for (const line of failures) console.error(`- ${line}`);
  process.exitCode = 1;
} else {
  console.log("Startup checks passed:");
  for (const line of checks) console.log(`- ${line}`);
  for (const line of warnings) console.log(`- ${line}`);
  console.log("System ready. Starting Next.js app...");
}
