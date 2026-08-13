"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { resumeAccount } from "@/app/actions";

export function ResumeButton({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => resumeAccount(accountId))}
    >
      {pending ? "Resuming…" : "Resume"}
    </Button>
  );
}
