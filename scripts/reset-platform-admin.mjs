import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;

const adminKey = envVars.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !adminKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY"
  );
}

const admin = createClient(supabaseUrl, adminKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const userId = "6475bf66-51d8-4ac1-9ea5-3ce7db5ca772";

const temporaryPassword = "Micknick12@";

const { data, error } = await admin.auth.admin.updateUserById(userId, {
  password: temporaryPassword,
});

if (error) {
  console.error("Password reset failed:", error.message);
  process.exit(1);
}

console.log("Password reset successfully");
console.log("Account:", data.user.email);
console.log("");
console.log("TEMPORARY PASSWORD:");
console.log(temporaryPassword);
console.log("");
console.log("Save it now. It will not be shown again.");