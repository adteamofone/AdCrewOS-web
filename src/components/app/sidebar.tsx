"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Cockpit", icon: "▮" },
  { href: "/dashboard/reports", label: "Reports", icon: "▤" },
  { href: "/settings", label: "Settings", icon: "◐" },
];

export function AppSidebar({ email, name }: { email: string; name: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border bg-surface/60 px-4 py-5 md:flex">
      <Link href="/dashboard" className="px-2"><Logo /></Link>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border pt-4">
        <div className="px-3 text-sm text-text">{name ?? "Account"}</div>
        <div className="truncate px-3 text-xs text-muted">{email}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-text"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
