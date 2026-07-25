"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/primitives";
import { seedDemoAction } from "@/app/actions";

export function SeedDemoButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button size={size} disabled={pending} onClick={() => startTransition(() => seedDemoAction())}>
      {pending ? "Seeding demo…" : "Load demo data"}
    </Button>
  );
}
