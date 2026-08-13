"use client";

import { useState } from "react";
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

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/accounts");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar({ email, name }: { email: string; name: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-border bg-surface/60 px-4 py-5 md:flex">
      <Link href="/dashboard" className="px-2"><Logo /></Link>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            <span className="text-xs opacity-70">{item.icon}</span>
            {item.label}
          </Link>
        ))}
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

/** Top bar + slide-down menu for < md screens (the sidebar is hidden there). */
export function MobileNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 top-0 z-30 border-b border-border bg-surface/90 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" onClick={() => setOpen(false)}><Logo /></Link>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text"
        >
          {open ? (
            <span className="text-lg leading-none">✕</span>
          ) : (
            <span className="flex flex-col gap-[5px]">
              <span className="block h-0.5 w-5 bg-text" />
              <span className="block h-0.5 w-5 bg-text" />
              <span className="block h-0.5 w-5 bg-text" />
            </span>
          )}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border px-4 pb-4 pt-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm",
                isActive(pathname, item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-border pt-3">
            <div className="truncate px-3 text-xs text-muted">{email}</div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm text-muted hover:bg-surface-2 hover:text-text"
            >
              Sign out
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
