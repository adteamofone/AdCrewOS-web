import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Get set up — AdCrewOS" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: {
      adAccounts: { include: { targets: true }, orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <OnboardingWizard
      email={user.email}
      phone={user.phone}
      accounts={user.adAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        platform: a.platform,
        isDemo: a.isDemo,
        metric: a.targets[0]?.metric ?? "ROAS",
        targetValue: a.targets[0]?.targetValue ?? 3,
        pauseThreshold: a.targets[0]?.pauseThreshold ?? 1.5,
        scaleThreshold: a.targets[0]?.scaleThreshold ?? 4,
      }))}
    />
  );
}
