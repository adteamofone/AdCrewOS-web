import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildReportData } from "@/lib/report-data";
import { renderReportPdf } from "@/lib/report-pdf";
import { isBlobConfigured, uploadBlob } from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const accountId = String(form.get("accountId") ?? "");
  const startStr = String(form.get("start") ?? "");
  const endStr = String(form.get("end") ?? "");

  const now = new Date();
  const end = endStr ? new Date(endStr) : now;
  const start = startStr ? new Date(startStr) : new Date(now.getTime() - 30 * 864e5);
  if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });

  const data = await buildReportData(session.user.id, accountId, start, end);
  const pdf = await renderReportPdf(data);

  // Persist to Blob when configured (spec: reports stored in Vercel Blob).
  if (isBlobConfigured()) {
    try {
      const url = await uploadBlob(
        `reports/${session.user.id}/${accountId}-${Date.now()}.pdf`,
        pdf,
        "application/pdf",
      );
      await prisma.report.create({
        data: {
          userId: session.user.id,
          adAccountId: accountId,
          periodStart: start,
          periodEnd: end,
          pdfUrl: url,
        },
      });
    } catch (e) {
      console.error("report persist failed", e);
    }
  }

  const filename = `${data.accountName.replace(/\W+/g, "-")}-report.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
