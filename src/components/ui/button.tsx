import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "default" | "destructive"; 
  size?: "sm" | "md";
  asChild?: boolean;
};

export function Button({ className, variant = "primary", size = "md", asChild = false, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm", (variant === "primary" || variant === "default") && "bg-blue-600 text-white hover:bg-blue-700", variant === "secondary" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50", (variant === "danger" || variant === "destructive") && "bg-red-600 text-white hover:bg-red-700", variant === "ghost" && "text-slate-700 hover:bg-slate-100", variant === "outline" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50", className)} {...props} />;
}
