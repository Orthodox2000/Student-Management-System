import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

function normalizeEnvValue(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, "") ?? "";
}

function ensureServerKeyLooksValid(value: string) {
  if (value.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is using a publishable key. Use the server-side secret or service-role key instead.",
    );
  }

  return value;
}

function requiredEnv(name: string) {
  const value = normalizeEnvValue(process.env[name]);
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  if (name === "SUPABASE_SERVICE_ROLE_KEY") {
    return ensureServerKeyLooksValid(value);
  }
  return value;
}

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

export function getSupabaseBucketName() {
  return requiredEnv("SUPABASE_STORAGE_BUCKET");
}

export function getSupabaseUrl() {
  return requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}
