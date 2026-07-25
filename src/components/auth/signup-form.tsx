"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Card, Input, Label, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Tier = "SOLO" | "AGENCY";

const PLAN_META: Record<Tier, { name: string; price: string; note: string }> = {
  SOLO: { name: "Solo", price: "$97/mo", note: "1 account per platform" },
  AGENCY: { name: "Agency", price: "$297/mo", note: "Up to 10 client accounts" },
};

export function SignupForm({
  defaultTier,
  canceled,
}: {
  defaultTier: Tier;
  canceled?: boolean;
}) {
  const [tier, setTier] = useState<Tier>(defaultTier);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const reg = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined, tier }),
      });
      if (!reg.ok) {
        const data = await reg.json().catch(() => ({}));
        throw new Error(data.error || "Could not create your account.");
      }

      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("Signed up, but sign-in failed. Try logging in.");

      // Kick off Stripe Checkout. If billing isn't configured (dev/sandbox),
      // fall through to onboarding so the product is fully usable.
      const checkout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (checkout.ok) {
        const { url } = await checkout.json();
        window.location.href = url;
        return;
      }
      window.location.href = "/onboarding";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      {canceled && (
        <div className="mb-4 rounded-lg border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
          Checkout canceled — no charge was made. Pick up where you left off below.
        </div>
      )}
      <h2 className="font-display text-xl font-bold text-text">Create your account</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["SOLO", "AGENCY"] as Tier[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              tier === t
                ? "border-primary bg-primary/10"
                : "border-border bg-bg/40 hover:border-border/80",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text">{PLAN_META[t].name}</span>
              {tier === t && <Badge tone="primary">Selected</Badge>}
            </div>
            <div className="mt-1 font-display text-lg font-bold text-text">{PLAN_META[t].price}</div>
            <div className="text-xs text-muted">{PLAN_META[t].note}</div>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg/40 text-sm text-text hover:bg-surface-2"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signIn("facebook", { callbackUrl: "/onboarding" })}
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Setting up…" : "Start 7-day free trial"}
        </Button>
        <p className="text-center text-xs text-muted">
          By continuing you agree to our{" "}
          <a href="/legal/terms" className="underline hover:text-text">Terms</a> and{" "}
          <a href="/legal/privacy" className="underline hover:text-text">Privacy Policy</a>.
        </p>
      </form>
    </Card>
  );
}
