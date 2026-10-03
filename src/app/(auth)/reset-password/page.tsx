import { redirect } from "next/navigation";

// Preserve old emailed destinations while using the single password form.
export default function ResetPage() {
  redirect("/auth/change-password?recovery=1");
}
