import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, Button } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports — AdCrewOS" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const [accounts, reports] = await Promise.all([
    prisma.adAccount.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } }),
    prisma.report.findMany({
      where: { userId: session.user.id },
      include: { adAccount: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Reports</h1>
        <p className="text-sm text-muted">
          Branded PDF exports. Agency plans use your uploaded logo; Solo shows the AdCrewOS mark.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-text">Generate a report</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted">Connect or load an account first.</p>
        ) : (
          <form method="POST" action="/api/reports" className="grid gap-4 sm:grid-cols-4 sm:items-end">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-text/90">Account</label>
              <select
                name="accountId"
                className="h-11 w-full rounded-lg border border-border bg-bg/60 px-3 text-sm text-text"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text/90">From</label>
              <input type="date" name="start" defaultValue={monthAgo} className="h-11 w-full rounded-lg border border-border bg-bg/60 px-3 text-sm text-text" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-text/90">To</label>
              <input type="date" name="end" defaultValue={today} className="h-11 w-full rounded-lg border border-border bg-bg/60 px-3 text-sm text-text" />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit">Download PDF</Button>
            </div>
          </form>
        )}
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-text">Recent reports</h2>
        {reports.length === 0 ? (
          <Card className="p-6 text-sm text-muted">No saved reports yet. Generated PDFs are stored here when Vercel Blob is configured.</Card>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <Card key={r.id} className="flex items-center justify-between p-4">
                <div className="text-sm text-text">
                  {r.adAccount.name}
                  <span className="text-muted">
                    {" "}· {r.periodStart.toLocaleDateString()} – {r.periodEnd.toLocaleDateString()}
                  </span>
                </div>
                <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                  Open PDF
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
