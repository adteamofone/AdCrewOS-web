"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
        return;
      }
      setMsg("Billing isn't configured yet. Add your Stripe keys to enable the portal.");
    } catch {
      setMsg("Could not open billing portal.");
    }
    setLoading(false);
  }

  return (
    <div>
      <Button variant="outline" onClick={open} disabled={loading}>
        {loading ? "Opening…" : "Manage billing"}
      </Button>
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </div>
  );
}
