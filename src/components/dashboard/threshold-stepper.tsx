"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateThreshold } from "@/app/actions";

type Field = "targetValue" | "pauseThreshold" | "scaleThreshold";

const TONE: Record<Field, string> = {
  targetValue: "text-text",
  pauseThreshold: "text-error",
  scaleThreshold: "text-success",
};

/**
 * Inline ±0.1 stepper for a guardrail value. Optimistic UI: every click updates
 * instantly; the save is debounced so rapid clicks collapse into one write.
 */
export function ThresholdStepper({
  accountId,
  field,
  metric,
  value,
  size = "md",
}: {
  accountId: string;
  field: Field;
  metric: "CPC" | "CPA" | "ROAS";
  value: number;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [local, setLocal] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when the server value changes (e.g. after router.refresh()).
  useEffect(() => setLocal(value), [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (flash.current) clearTimeout(flash.current);
    },
    [],
  );

  function commit(next: number) {
    const v = Math.max(0.1, Math.round(next * 10) / 10);
    setLocal(v);
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await updateThreshold(accountId, field, v);
        setState("saved");
        router.refresh();
        if (flash.current) clearTimeout(flash.current);
        flash.current = setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
        setLocal(value); // roll back to last known-good server value
      }
    }, 650);
  }

  const display = metric === "ROAS" ? `${local.toFixed(2)}x` : `$${local.toFixed(2)}`;
  const big = size === "md";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`font-display font-semibold tabular-nums ${TONE[field]} ${
          big ? "text-xl" : "text-sm"
        }`}
      >
        {display}
      </span>
      <span className="flex flex-col">
        <StepBtn dir="up" big={big} onClick={() => commit(local + 0.1)} />
        <StepBtn dir="down" big={big} onClick={() => commit(local - 0.1)} />
      </span>
      <span
        aria-live="polite"
        className={`w-8 text-[10px] ${
          state === "error" ? "text-error" : "text-muted"
        } ${state === "idle" ? "opacity-0" : "opacity-100"} transition-opacity`}
      >
        {state === "saving" ? "…" : state === "saved" ? "Saved" : state === "error" ? "Failed" : ""}
      </span>
    </span>
  );
}

function StepBtn({
  dir,
  big,
  onClick,
}: {
  dir: "up" | "down";
  big: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "up" ? "Increase by 0.1" : "Decrease by 0.1"}
      onClick={onClick}
      className={`flex items-center justify-center rounded border border-white/10 bg-white/5 leading-none text-muted transition-colors hover:border-primary/50 hover:text-text active:bg-primary/20 ${
        big ? "h-4 w-6 text-[9px]" : "h-3.5 w-5 text-[8px]"
      } ${dir === "up" ? "rounded-b-none" : "rounded-t-none border-t-0"}`}
    >
      {dir === "up" ? "▲" : "▼"}
    </button>
  );
}
