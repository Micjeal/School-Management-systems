import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

const password = process.env.TEST_LOGIN_PASSWORD;

if (!url || !key || !password) {
  throw new Error("Missing Supabase URL, client key, or TEST_LOGIN_PASSWORD");
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log("Project:", new URL(url).hostname.split(".")[0]);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "micknick168@gmail.com",
  password,
});

if (error) {
  console.error("DIRECT AUTH FAILED");
  console.error("Status:", error.status);
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  process.exit(1);
}

console.log("DIRECT AUTH SUCCESS");
console.log("User:", data.user.email);

await supabase.auth.signOut();