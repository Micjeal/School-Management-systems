"use client";
import { RouteError } from "@/components/layout/route-error";
export default function ErrorBoundary(props: { error: Error & { digest?: string }; reset: () => void }) { return <RouteError {...props} title="Module data could not be loaded" />; }
