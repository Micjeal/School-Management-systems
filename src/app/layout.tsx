import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SchoolDB", template: "%s | SchoolDB" },
  description: "Secure multi-school administration, academics, finance, HR and operations.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
