"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/demo";
import { applyScale } from "@/lib/platform";
import { Metric } from "@prisma/client";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertOwnsEvent(userId: string, eventId: string) {
  const event = await prisma.automationEvent.findFirst({
    where: { id: eventId, adAccount: { userId } },
    include: { adAccount: true },
  });
  if (!event) throw new Error("Not found");
  return event;
}

/** Approve a pending scale proposal — applies the budget increase (real or demo). */
export async function approveScale(eventId: string) {
  const userId = await requireUserId();
  const event = await assertOwnsEvent(userId, eventId);
  if (event.type !== "SCALE_PROPOSAL" || event.status !== "PENDING") return;

  const pct = event.proposedPct ?? 20;
  await applyScale(event.adAccount, pct);

  await prisma.$transaction([
    prisma.automationEvent.update({
      where: { id: event.id },
      data: { status: "EXECUTED", resolvedAt: new Date() },
    }),
    prisma.automationEvent.create({
      data: {
        adAccountId: event.adAccountId,
        type: "SCALE_APPLIED",
        status: "LOGGED",
        reason: `Budget increased +${pct}% on your approval.`,
        metric: event.metric,
        proposedPct: pct,
      },
    }),
  ]);
  revalidatePath("/dashboard");
}

/** Dismiss a pending scale proposal. */
export async function dismissScale(eventId: string) {
  const userId = await requireUserId();
  const event = await assertOwnsEvent(userId, eventId);
  if (event.type !== "SCALE_PROPOSAL" || event.status !== "PENDING") return;
  await prisma.automationEvent.update({
    where: { id: event.id },
    data: { status: "DISMISSED", resolvedAt: new Date() },
  });
  revalidatePath("/dashboard");
}

/** Manually resume a paused account. */
export async function resumeAccount(accountId: string) {
  const userId = await requireUserId();
  const account = await prisma.adAccount.findFirst({ where: { id: accountId, userId } });
  if (!account || account.status !== "PAUSED") return;
  await prisma.$transaction([
    prisma.adAccount.update({ where: { id: account.id }, data: { status: "ACTIVE" } }),
    prisma.automationEvent.create({
      data: {
        adAccountId: account.id,
        type: "RESUME",
        status: "LOGGED",
        reason: "Manually resumed by you.",
      },
    }),
  ]);
  revalidatePath("/dashboard");
}

/** Onboarding step 1: alerts (phone + email confirmation). */
export async function saveAlertPrefs(formData: FormData) {
  const userId = await requireUserId();
  const phone = String(formData.get("phone") ?? "").trim();
  await prisma.user.update({ where: { id: userId }, data: { phone: phone || null } });
}

/** Onboarding "Skip → seed demo data". */
export async function seedDemoAction() {
  const userId = await requireUserId();
  await seedDemoData(userId);
  revalidatePath("/dashboard");
}

/** Disconnect (and delete) an ad account per platform data-deletion terms. */
export async function disconnectAccount(accountId: string) {
  const userId = await requireUserId();
  const account = await prisma.adAccount.findFirst({ where: { id: accountId, userId } });
  if (!account) return;
  await prisma.adAccount.delete({ where: { id: account.id } });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

/** Save Agency logo URL (already uploaded to Blob) into BrandSetting. */
export async function saveLogoUrl(logoUrl: string) {
  const userId = await requireUserId();
  await prisma.brandSetting.upsert({
    where: { userId },
    create: { userId, logoUrl },
    update: { logoUrl },
  });
  revalidatePath("/settings");
}

/** Onboarding steps 3+4: set target metric + thresholds per account. */
export async function saveTargets(
  accountId: string,
  metric: Metric,
  targetValue: number,
  pauseThreshold: number,
  scaleThreshold: number,
) {
  const userId = await requireUserId();
  const account = await prisma.adAccount.findFirst({
    where: { id: accountId, userId },
    include: { targets: true },
  });
  if (!account) throw new Error("Not found");
  const data = { metric, targetValue, pauseThreshold, scaleThreshold };
  if (account.targets[0]) {
    await prisma.target.update({ where: { id: account.targets[0].id }, data });
  } else {
    await prisma.target.create({ data: { adAccountId: accountId, ...data } });
  }
  revalidatePath("/dashboard");
}
