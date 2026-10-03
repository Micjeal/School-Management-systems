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
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) {
  console.error("Missing Supabase URL or anon key");
  process.exit(1);
}

console.log("Using project:", new URL(url).hostname.split(".")[0]);

// Use anon key with regular client to test login
const client = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function testLogin(email, password) {
  console.log(`\n=== Testing login for ${email} ===`);
  
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("LOGIN FAILED");
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    return null;
  }

  console.log("LOGIN SUCCESS");
  console.log("User ID:", data.user.id);
  console.log("Email confirmed:", data.user.email_confirmed_at ? "YES" : "NO");
  
  // Try to get profile and roles using the session
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();
  
  if (profileError) {
    console.error('Profile error:', profileError.message);
  } else if (profile) {
    console.log('Profile found:', profile.id);
    console.log('Active:', profile.is_active);
    console.log('Must change password:', profile.must_change_password);
  } else {
    console.log('Profile NOT found');
  }
  
  const { data: roles, error: rolesError } = await client
    .from('platform_user_roles')
    .select('roles(code)')
    .eq('user_id', data.user.id);
  
  if (rolesError) {
    console.error('Roles error:', rolesError.message);
  } else {
    console.log('Platform roles:', roles.map(r => r.roles?.code).join(', '));
  }
  
  const { data: memberships, error: membershipError } = await client
    .from('school_memberships')
    .select('school_id, status, schools(name)')
    .eq('user_id', data.user.id)
    .eq('status', 'active');
  
  if (membershipError) {
    console.error('Memberships error:', membershipError.message);
  } else {
    console.log('Active school memberships:', memberships.length);
    memberships.forEach(m => {
      console.log(`  - ${m.schools?.name} (${m.school_id})`);
    });
  }
  
  await client.auth.signOut();
  return data.user;
}

// Test with the known temporary password from reset script
console.log("\n=== Testing with known temporary password ===");
const result1 = await testLogin("micknick168@gmail.com", "Micknick12@");
const result2 = await testLogin("mugishamicheal24@gmail.com", "Micknick12@");

if (!result1 && !result2) {
  console.log("\n=== DIAGNOSIS ===");
  console.log("Both login attempts failed with invalid_credentials.");
  console.log("This suggests:");
  console.log("1. Users may not exist in this Supabase project");
  console.log("2. Users exist but have different passwords");
  console.log("3. Users exist but email is not confirmed");
  console.log("4. Wrong Supabase project");
  console.log("\nCurrent project: vtdjjvdnlgdvtrecamuu");
  console.log("Current URL: https://vtdjjvdnlgdvtrecamuu.supabase.co");
}