import { requireUserContext } from "@/lib/auth/context";
import { getSchoolSwitcherOptions } from "@/lib/auth/get-school-switcher-options";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const context = await requireUserContext();
  const schoolOptions = await getSchoolSwitcherOptions(context);
  return <AppShell context={context} schoolOptions={schoolOptions}>{children}</AppShell>;
}
