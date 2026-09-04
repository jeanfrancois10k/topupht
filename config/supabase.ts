import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type Database } from "@/types/database";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.warn("NEXT_PUBLIC_SUPABASE_URL is not configured. Using placeholder. Set it in .env.local for production.");
    return "https://xyzcompanyid.supabase.co";
  }
  return url;
}

function getAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Using placeholder. Set it in .env.local for production.");
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5einjb21wYW55aWQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY1OTQ5NTAwMCwiZXhwIjoyMDc1MDk1MDAwfQ.placeholder";
  }
  return key;
}

export const supabaseClient = createClient<Database>(
  getSupabaseUrl(),
  getAnonKey(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    db: {
      schema: "public",
    },
  }
);

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}

export { type Database };