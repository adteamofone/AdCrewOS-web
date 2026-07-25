"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Card, Input, Label, Badge } from "@/components/ui/primitives";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { saveAlertPrefs, seedDemoAction, saveTargets } from "@/app/actions";
import type { Metric } from "@prisma/client";

type Acct = {
  id: string;
  name: string;
  platform: string;
  isDemo: boolean;
  metric: Metric;
  targetValue: number;
  pauseThreshold: number;
  scaleThreshold: number;
};

const STEPS = ["Alerts", "Connect", "Targets", "Thresholds"];

export function OnboardingWizard({
  email,
  phone: initialPhone,
  accounts,
}: {
  email: string;
  phone: string | null;
  accounts: Acct[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [pending, startTransition] = useTransition();

  const hasAccounts = accounts.length > 0;

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div className="relative mx-auto max-w-xl px-5 py-10">
        <Logo className="mb-8" />
        <Stepper step={step} />

        <Card className="mt-6 p-6">
          {step === 0 && (
            <StepAlerts
              email={email}
              phone={phone}
              setPhone={setPhone}
              onNext={() =>
                startTransition(async () => {
                  const fd = new FormData();
                  fd.set("phone", phone);
                  await saveAlertPrefs(fd);
                  setStep(1);
                })
              }
              pending={pending}
            />
          )}

          {step === 1 && (
            <StepConnect
              hasAccounts={hasAccounts}
              onSeed={() =>
                startTransition(async () => {
                  await seedDemoAction();
                  router.refresh();
                  setStep(2);
                })
              }
              onContinue={() => setStep(2)}
              pending={pending}
            />
          )}

          {step === 2 && (
            <StepTargets accounts={accounts} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}

          {step === 3 && (
            <StepThresholds
              accounts={accounts}
              onFinish={() => router.push("/dashboard")}
              onBack={() => setStep(2)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              i <= step ? "bg-primary text-text-invert" : "bg-surface-2 text-muted",
            )}
          >
            {i + 1}
          </div>
          <span className={cn("text-xs", i <= step ? "text-text" : "text-muted")}>{label}</span>
          {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function StepAlerts({
  email,
  phone,
  setPhone,
  onNext,
  pending,
}: {
  email: string;
  phone: string;
  setPhone: (v: string) => void;
  onNext: () => void;
  pending: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text">Where should we reach you?</h2>
      <p className="mt-1 text-sm text-muted">
        Protective pauses and scale proposals go out instantly by SMS + email.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <Label>Alert email</Label>
          <Input value={email} disabled />
        </div>
        <div>
          <Label htmlFor="phone">Mobile number (SMS)</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={pending}>Continue</Button>
      </div>
    </div>
  );
}

function StepConnect({
  hasAccounts,
  onSeed,
  onContinue,
  pending,
}: {
  hasAccounts: boolean;
  onSeed: () => void;
  onContinue: () => void;
  pending: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text">Connect your ad accounts</h2>
      <p className="mt-1 text-sm text-muted">
        Secure OAuth. No live account handy? Skip and explore on realistic demo data — same engine, same cadence.
      </p>
      <div className="mt-5 grid gap-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-bg/40 text-sm text-text hover:bg-surface-2"
        >
          Connect Google Ads
        </button>
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/onboarding" })}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-bg/40 text-sm text-text hover:bg-surface-2"
        >
          Connect Meta
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex items-center justify-between">
        {hasAccounts ? (
          <>
            <Badge tone="success">Accounts ready</Badge>
            <Button onClick={onContinue}>Continue</Button>
          </>
        ) : (
          <>
            <span className="text-sm text-muted">No account? </span>
            <Button variant="outline" onClick={onSeed} disabled={pending}>
              {pending ? "Loading demo…" : "Skip → use demo data"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function StepTargets({
  accounts,
  onNext,
  onBack,
}: {
  accounts: Acct[];
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text">Set your targets</h2>
      <p className="mt-1 text-sm text-muted">Pick the metric that matters per account, and your goal.</p>
      <div className="mt-5 space-y-4">
        {accounts.map((a) => (
          <TargetRow key={a.id} account={a} />
        ))}
        {accounts.length === 0 && <p className="text-sm text-muted">No accounts to configure yet.</p>}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

function TargetRow({ account }: { account: Acct }) {
  const [metric, setMetric] = useState<Metric>(account.metric);
  const [value, setValue] = useState(String(account.targetValue));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(next?: Partial<{ metric: Metric; value: string }>) {
    const m = next?.metric ?? metric;
    const v = Number(next?.value ?? value);
    startTransition(async () => {
      await saveTargets(account.id, m, v, account.pauseThreshold, account.scaleThreshold);
      setSaved(true);
    });
  }

  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text">{account.name}</span>
        {saved && <Badge tone="success">Saved</Badge>}
      </div>
      <div className="flex gap-2">
        {(["CPC", "CPA", "ROAS"] as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMetric(m);
              save({ metric: m });
            }}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm",
              metric === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted",
            )}
          >
            {m}
          </button>
        ))}
        <Input
          className="w-28"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => save()}
          disabled={pending}
        />
      </div>
    </div>
  );
}

function StepThresholds({
  accounts,
  onFinish,
  onBack,
}: {
  accounts: Acct[];
  onFinish: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text">Set your thresholds</h2>
      <p className="mt-1 text-sm text-muted">
        A protective floor (auto-pause) and a scale trigger (one-tap approval).
      </p>
      <div className="mt-5 space-y-4">
        {accounts.map((a) => (
          <ThresholdRow key={a.id} account={a} />
        ))}
        {accounts.length === 0 && <p className="text-sm text-muted">No accounts to configure yet.</p>}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onFinish}>Enter cockpit →</Button>
      </div>
    </div>
  );
}

function ThresholdRow({ account }: { account: Acct }) {
  const [pause, setPause] = useState(String(account.pauseThreshold));
  const [scale, setScale] = useState(String(account.scaleThreshold));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveTargets(account.id, account.metric, account.targetValue, Number(pause), Number(scale));
      setSaved(true);
    });
  }

  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text">{account.name}</span>
        {saved && <Badge tone="success">Saved</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Pause floor ({account.metric})</Label>
          <Input value={pause} onChange={(e) => setPause(e.target.value)} onBlur={save} disabled={pending} />
        </div>
        <div>
          <Label>Scale trigger ({account.metric})</Label>
          <Input value={scale} onChange={(e) => setScale(e.target.value)} onBlur={save} disabled={pending} />
        </div>
      </div>
    </div>
  );
}
