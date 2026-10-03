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

async function checkDatabaseFunctions() {
  console.log("\n=== Checking database functions ===");
  
  // Try to call is_platform_admin directly (should fail if function doesn't exist)
  const { data: adminResult, error: adminError } = await client.rpc('is_platform_admin');
  
  if (adminError) {
    console.log("is_platform_admin function check:", adminError.message);
    if (adminError.message.includes('function') && adminError.message.includes('does not exist')) {
      console.log("❌ CRITICAL: private.is_platform_admin() function does not exist in database");
      console.log("This means baseline migrations 001-010 are missing");
    }
  } else {
    console.log("is_platform_admin function exists (result:", adminResult, ")");
  }
  
  // Check if get_my_context exists
  const { data: contextResult, error: contextError } = await client.rpc('get_my_context');
  
  if (contextError) {
    console.log("get_my_context function check:", contextError.message);
  } else {
    console.log("get_my_context function exists");
  }
  
  // Check if private schema exists by trying to query it
  const { data: schemaCheck, error: schemaError } = await client
    .rpc('check_private_schema') || {};
  
  console.log("\nAttempting to check available schemas...");
  
  // Try a direct query to information_schema
  const { data: schemas, error: schemasError } = await client
    .from('information_schema.schemata')
    .select('schema_name')
    .ilike('schema_name', '%private%');
  
  if (schemasError) {
    console.log("Cannot query information_schema:", schemasError.message);
  } else {
    console.log("Schemas containing 'private':", schemas?.map(s => s.schema_name));
  }
}

checkDatabaseFunctions();