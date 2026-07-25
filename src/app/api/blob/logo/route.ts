import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isBlobConfigured, uploadBlob } from "@/lib/blob";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "Blob not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename") ?? "logo.png";
  const contentType = req.headers.get("content-type") ?? "image/png";
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.byteLength > 2_000_000) {
    return NextResponse.json({ error: "Max 2MB" }, { status: 413 });
  }

  const url = await uploadBlob(`logos/${session.user.id}/${filename}`, buf, contentType);
  return NextResponse.json({ url });
}
