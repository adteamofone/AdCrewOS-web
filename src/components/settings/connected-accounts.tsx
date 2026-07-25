"use client";

import { useTransition } from "react";
import { signIn } from "next-auth/react";
import { Badge, Button } from "@/components/ui/primitives";
import { disconnectAccount } from "@/app/actions";

type Acct = { id: string; name: string; platform: string; isDemo: boolean; status: string };

export function ConnectedAccounts({ accounts }: { accounts: Acct[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-3">
      {accounts.length === 0 && (
        <p className="text-sm text-muted">No accounts connected. Connect one below or load demo data.</p>
      )}
      {accounts.map((a) => (
        <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-bg/40 p-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-text">
              {a.name}
              {a.isDemo && <Badge tone="warn">Demo</Badge>}
            </div>
            <div className="text-xs uppercase tracking-wide text-muted">{a.platform} · {a.status.toLowerCase()}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => disconnectAccount(a.id))}
          >
            Disconnect
          </Button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={() => signIn("google", { callbackUrl: "/settings" })}>
          + Google Ads
        </Button>
        <Button variant="outline" size="sm" onClick={() => signIn("facebook", { callbackUrl: "/settings" })}>
          + Meta
        </Button>
      </div>
    </div>
  );
}
