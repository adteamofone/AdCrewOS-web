"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button, Card, Input, Label } from "@/components/ui/primitives";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("That email/password combo didn't match. Try again.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold text-text">Log in to your cockpit</h2>
      <p className="mt-1 text-sm text-muted">
        New to AdCrewOS?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg/40 text-sm text-text hover:bg-surface-2"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg/40 text-sm text-text hover:bg-surface-2"
        >
          Continue with Meta
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
