import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf8");
const envLines = envContent.split("\n").filter(line => line.trim() && !line.startsWith("#"));
const envVars = {};
for (const line of envLines) {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
}

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing Supabase URL or anon key");
  process.exit(1);
}

console.log("Using project:", new URL(url).hostname.split(".")[0]);

const client = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function checkDatabase() {
  console.log("\n=== Checking database access ===");
  
  // Try to call get_my_context RPC without auth (should fail)
  const { data: contextData, error: contextError } = await client.rpc('get_my_context');
  
  if (contextError) {
    console.log("RPC without auth failed (expected):", contextError.message);
  } else {
    console.log("RPC without auth succeeded (unexpected):", contextData);
  }
  
  // Check if we can read public tables
  const { data: schools, error: schoolsError } = await client
    .from('schools')
    .select('id, name, status')
    .limit(5);
  
  if (schoolsError) {
    console.log("Schools query error:", schoolsError.message);
  } else {
    console.log("Schools accessible (may be empty):", schools?.length);
  }
  
  // Check if roles table exists
  const { data: roles, error: rolesError } = await client
    .from('roles')
    .select('id, code, name')
    .limit(5);
  
  if (rolesError) {
    console.log("Roles query error:", rolesError.message);
  } else {
    console.log("Roles accessible:", roles?.length);
    if (roles && roles.length > 0) {
      console.log("Sample roles:", roles.map(r => r.code));
    }
  }
}

checkDatabase();