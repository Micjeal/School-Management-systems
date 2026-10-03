"use client";
import { RouteError } from "@/components/layout/route-error";
export default function ErrorBoundary(props: { error: Error & { digest?: string }; reset: () => void }) { return <RouteError {...props} title="Platform administration could not be loaded" />; }
