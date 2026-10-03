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

async function checkBaseline() {
  console.log("\n=== BASELINE MIGRATION CHECK ===");
  
  // Check critical baseline functions that should exist
  const criticalFunctions = [
    'is_platform_admin',
    'is_school_member', 
    'has_permission',
    'can'
  ];
  
  console.log("\nChecking critical baseline functions:");
  for (const funcName of criticalFunctions) {
    const { data, error } = await client.rpc(funcName);
    if (error) {
      console.log(`❌ ${funcName}: MISSING (${error.message})`);
    } else {
      console.log(`✓ ${funcName}: EXISTS`);
    }
  }
  
  // Check critical baseline tables
  const criticalTables = [
    'schools',
    'roles', 
    'permissions',
    'school_memberships',
    'platform_user_roles'
  ];
  
  console.log("\nChecking critical baseline tables:");
  for (const tableName of criticalTables) {
    const { data, error } = await client
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${tableName}: MISSING (${error.message})`);
    } else {
      console.log(`✓ ${tableName}: EXISTS`);
    }
  }
  
  console.log("\n=== DIAGNOSIS ===");
  console.log("If baseline functions are missing, the database does not have");
  console.log("baseline migrations 001-010 applied. This is a critical infrastructure");
  console.log("issue that must be resolved before the application can function.");
  console.log("");
  console.log("The current Supabase project appears to be missing the baseline schema.");
  console.log("This explains:");
  console.log("- Authorization failures (is_platform_admin missing)");
  console.log("- Context resolution failures (get_my_context may call missing functions)");
  console.log("- School membership checks failing");
  console.log("");
  console.log("Required action: Apply baseline migrations 001-010 to this Supabase project");
  console.log("before any application-specific functionality can work.");
}

checkBaseline();