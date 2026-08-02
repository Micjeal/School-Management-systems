import type { ReactNode } from "react";

import { AppShellClient } from "@/components/layout/app-shell-client";
import type { UserContext } from "@/types/context";
import type { SchoolSwitcherOption } from "@/lib/auth/get-school-switcher-options";

type AppShellProps = {
  context: UserContext;
  schoolOptions: SchoolSwitcherOption[];
  children: ReactNode;
};

export function AppShell({ context, schoolOptions, children }: AppShellProps) {
  return (
    <AppShellClient context={context} schoolOptions={schoolOptions}>
      {children}
    </AppShellClient>
  );
}