import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-text-invert hover:bg-primary/90 shadow-[0_8px_30px_-8px_rgba(14,165,233,0.55)]",
  secondary: "bg-secondary text-text-invert hover:bg-secondary/90",
  ghost: "text-text hover:bg-surface-2",
  outline: "border border-border text-text hover:bg-surface-2",
  danger: "bg-error text-white hover:bg-error/90",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
}: {
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant ?? "primary"], sizes[size ?? "md"], className)}
    >
      {children}
    </Link>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface/80 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "success" | "warn" | "error" | "primary";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    muted: "bg-surface-2 text-muted border-border",
    success: "bg-success/10 text-success border-success/30",
    warn: "bg-warn/10 text-warn border-warn/30",
    error: "bg-error/10 text-error border-error/30",
    primary: "bg-primary/10 text-primary border-primary/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-bg/60 px-3.5 text-sm text-text placeholder:text-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-text/90", className)} {...props} />
  );
}
