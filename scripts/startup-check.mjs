import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";

const checks = [];
const failures = [];
const warnings = [];

function loadDotEnv() {
  const paths = [".env", ".env.local"];
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
      const value = line.slice(eq + 1).trim();
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

function routeHasMethod(filePath, method) {
  const content = fs.readFileSync(filePath, "utf8");
  return new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`).test(content);
}

function getPrivateKey() {
  return (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
}

function buildAdmissionNumber(sequence = Number(String(Date.now()).slice(-5)), year = 2026) {
  return `PU${year}${String(sequence).padStart(5, "0")}`;
}

loadDotEnv();

assertCheck(/^PU\d{9}$/.test(buildAdmissionNumber(42)), "Admission number format check passed");
assertCheck(fs.existsSync(path.join(process.cwd(), ".env.example")), ".env.example exists");

const requiredFirebaseEnv = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "ADMIN_LOGIN_EMAIL",
  "ADMIN_LOGIN_PASSWORD",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];

for (const key of requiredFirebaseEnv) {
  assertCheck(Boolean(process.env[key]), `${key} is configured`);
}

const requiredRoutes = [
  { file: "app/api/auth/admin-login/route.ts", methods: ["POST"], label: "/api/auth/admin-login" },
  { file: "app/api/auth/me/route.ts", methods: ["GET"], label: "/api/auth/me" },
  { file: "app/api/auth/demo/route.ts", methods: ["POST"], label: "/api/auth/demo" },
  { file: "app/api/health/firebase/route.ts", methods: ["GET"], label: "/api/health/firebase" },
  { file: "app/api/health/route.ts", methods: ["GET"], label: "/api/health" },
  { file: "app/api/students/route.ts", methods: ["GET", "POST"], label: "/api/students" },
  { file: "app/api/students/seed/route.ts", methods: ["POST"], label: "/api/students/seed" },
  {
    file: "app/api/students/[id]/route.ts",
    methods: ["GET", "PUT", "DELETE"],
    label: "/api/students/:id",
  },
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

async function checkDataConnect() {
  if (String(process.env.SKIP_DATACONNECT_CHECK ?? "").toLowerCase() === "true") {
    warnings.push("Skipped Data Connect startup check (`SKIP_DATACONNECT_CHECK=true`)");
    return;
  }

  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: getPrivateKey(),
        }),
      });
    }

    const dc = getDataConnect(
      {
        connector: "example",
        serviceId: "student-management-system",
        location: "us-west4",
      },
      getApps()[0],
    );

    await dc.executeQuery("ListStudents");
    checks.push("Firebase Data Connect query check passed");
  } catch (error) {
    failures.push(
      `Firebase Data Connect check failed (${error instanceof Error ? error.message : "unknown error"}). Start emulator or configure cloud Data Connect.`,
    );
  }
}

await checkDataConnect();

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
  process.exit(1);
}

console.log("Startup checks passed:");
for (const line of checks) console.log(`- ${line}`);
for (const line of warnings) console.log(`- ${line}`);
console.log("System ready. Starting Next.js app...");
