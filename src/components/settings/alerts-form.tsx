"use client";

import { useState, useTransition } from "react";
import { Button, Input, Label, Badge } from "@/components/ui/primitives";
import { saveAlertPrefs } from "@/app/actions";

export function AlertsForm({ email, phone: initial }: { email: string; phone: string | null }) {
  const [phone, setPhone] = useState(initial ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Alert email</Label>
        <Input value={email} disabled />
      </div>
      <div>
        <Label htmlFor="phone">Mobile (SMS)</Label>
        <div className="flex gap-2">
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const fd = new FormData();
                fd.set("phone", phone);
                await saveAlertPrefs(fd);
                setSaved(true);
              })
            }
          >
            Save
          </Button>
        </div>
        {saved && <Badge tone="success" className="mt-2">Saved</Badge>}
      </div>
    </div>
  );
}
