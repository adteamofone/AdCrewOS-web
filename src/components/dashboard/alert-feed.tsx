"use client";

import { useTransition } from "react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { approveScale, dismissScale } from "@/app/actions";
import { timeAgo } from "@/lib/utils";

type Event = {
  id: string;
  type: string;
  status: string;
  reason: string;
  proposedPct: number | null;
  createdAt: string;
  accountName: string;
  platform: string;
};

const TONE: Record<string, "error" | "primary" | "success" | "muted" | "warn"> = {
  AUTO_PAUSE: "error",
  SCALE_PROPOSAL: "primary",
  SCALE_APPLIED: "success",
  RESUME: "success",
  POLL_ERROR: "warn",
};

const LABEL: Record<string, string> = {
  AUTO_PAUSE: "Auto-paused",
  SCALE_PROPOSAL: "Scale ready",
  SCALE_APPLIED: "Scaled",
  RESUME: "Resumed",
  POLL_ERROR: "Sync issue",
};

export function AlertFeed({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        All quiet. Alerts and scale proposals will appear here as the engine works.
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {events.map((e) => (
        <AlertRow key={e.id} event={e} />
      ))}
    </div>
  );
}

function AlertRow({ event }: { event: Event }) {
  const [pending, startTransition] = useTransition();
  const isOpenProposal = event.type === "SCALE_PROPOSAL" && event.status === "PENDING";

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Badge tone={TONE[event.type] ?? "muted"}>{LABEL[event.type] ?? event.type}</Badge>
        <div>
          <div className="text-sm text-text">
            <span className="font-medium">{event.accountName}</span>
            <span className="text-muted"> · {event.platform}</span>
          </div>
          <div className="text-sm text-muted">{event.reason}</div>
          <div className="mt-1 text-xs text-muted/70">{timeAgo(event.createdAt)}</div>
        </div>
      </div>

      {isOpenProposal && (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() => startTransition(() => approveScale(event.id))}
          >
            Approve +{event.proposedPct}%
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(() => dismissScale(event.id))}
          >
            Dismiss
          </Button>
        </div>
      )}
      {event.type === "SCALE_PROPOSAL" && event.status !== "PENDING" && (
        <Badge tone="muted">{event.status.toLowerCase()}</Badge>
      )}
    </Card>
  );
}
