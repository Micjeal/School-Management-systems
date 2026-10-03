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
const adminKey = envVars.SUPABASE_SECRET_KEY;

if (!url || !adminKey) {
  console.error("Missing Supabase URL or admin key");
  process.exit(1);
}

console.log("Using project:", new URL(url).hostname.split(".")[0]);
console.log("Admin key format check:", adminKey.startsWith("sb_secret_") || adminKey.startsWith("eyJ"));

const admin = createClient(url, adminKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function listUsers() {
  console.log("\n=== Listing users ===");
  
  const { data, error } = await admin.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error.message);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return;
  }
  
  console.log(`Total users: ${data.users.length}`);
  
  const targetEmails = ["micknick168@gmail.com", "mugishamicheal24@gmail.com"];
  
  for (const user of data.users) {
    if (targetEmails.includes(user.email)) {
      console.log(`\nFound user: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email confirmed: ${user.email_confirmed_at ? "YES" : "NO"}`);
      console.log(`  Created at: ${user.created_at}`);
      console.log(`  Last sign in: ${user.last_sign_in_at}`);
    }
  }
}

listUsers();