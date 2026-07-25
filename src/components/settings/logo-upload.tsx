"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/primitives";
import { saveLogoUrl } from "@/app/actions";

export function LogoUpload({ currentLogo }: { currentLogo: string | null }) {
  const [logo, setLogo] = useState<string | null>(currentLogo);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/blob/logo?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });
      if (!res.ok) {
        setMsg("Uploads need Vercel Blob configured (BLOB_READ_WRITE_TOKEN).");
        setLoading(false);
        return;
      }
      const { url } = await res.json();
      await saveLogoUrl(url);
      setLogo(url);
    } catch {
      setMsg("Upload failed.");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-bg/40">
        {logo ? (
          <Image src={logo} alt="Logo" width={64} height={64} className="object-contain" />
        ) : (
          <span className="text-xs text-muted">No logo</span>
        )}
      </div>
      <div>
        <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-border px-3 text-sm text-text hover:bg-surface-2">
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={loading} />
          {loading ? "Uploading…" : "Upload logo"}
        </label>
        {logo && <Badge tone="success" className="ml-2">Active on reports</Badge>}
        {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
      </div>
    </div>
  );
}
