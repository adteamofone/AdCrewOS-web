import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui/primitives";
import { SeedDemoButton } from "@/components/dashboard/seed-demo-button";
import { BillingPortalButton } from "@/components/settings/billing-portal-button";
import { AlertsForm } from "@/components/settings/alerts-form";
import { ConnectedAccounts } from "@/components/settings/connected-accounts";
import { LogoUpload } from "@/components/settings/logo-upload";
import { planForTier } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — AdCrewOS" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: {
      subscription: true,
      brandSetting: true,
      adAccounts: { orderBy: { createdAt: "asc" } },
    },
  });

  const tier = user.subscription?.tier ?? "SOLO";
  const plan = planForTier(tier);
  const isAgency = tier === "AGENCY";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-muted">Profile, alerts, connected accounts, billing.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-text">Plan &amp; billing</h2>
            <p className="text-sm text-muted">
              {plan.name} · {plan.priceLabel}/mo
            </p>
          </div>
          <Badge tone={user.subscription?.status === "ACTIVE" || user.subscription?.status === "TRIALING" ? "success" : "muted"}>
            {(user.subscription?.status ?? "PENDING").toLowerCase()}
          </Badge>
        </div>
        <div className="mt-4">
          <BillingPortalButton />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-text">Alerts</h2>
        <p className="mb-4 text-sm text-muted">SMS + email for pauses and scale proposals.</p>
        <AlertsForm email={user.email} phone={user.phone} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-text">Connected accounts</h2>
            <p className="text-sm text-muted">
              Cap: {plan.accountsPerPlatform} per platform ({plan.name}).
            </p>
          </div>
          <SeedDemoButton size="sm" />
        </div>
        <div className="mt-4">
          <ConnectedAccounts
            accounts={user.adAccounts.map((a) => ({
              id: a.id,
              name: a.name,
              platform: a.platform,
              isDemo: a.isDemo,
              status: a.status,
            }))}
          />
        </div>
      </Card>

      {isAgency && (
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-text">Agency branding</h2>
          <p className="mb-4 text-sm text-muted">Your logo appears on white-labeled client reports.</p>
          <LogoUpload currentLogo={user.brandSetting?.logoUrl ?? null} />
        </Card>
      )}
    </div>
  );
}
