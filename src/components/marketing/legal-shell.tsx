import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="text-sm text-muted hover:text-text">← Home</Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-display text-3xl font-bold text-text">{title}</h1>
        <p className="mt-1 text-sm text-muted">{updated}</p>
        <div className="legal mt-8 space-y-4 text-sm leading-relaxed text-muted [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text">
          {children}
        </div>
      </main>
    </div>
  );
}
