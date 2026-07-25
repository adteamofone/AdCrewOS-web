import { Resend } from "resend";
import twilio from "twilio";
import type { AdAccount, User } from "@prisma/client";
import type { Decision } from "@/lib/engine";

/**
 * Alerting: email via Resend, SMS via Twilio (Resend does not send SMS).
 * Both degrade to no-ops (logged) when unconfigured so the engine never breaks.
 */

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!key || !from) {
    console.log(`[alerts] email skipped (unconfigured): ${subject} -> ${to}`);
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({ from, to, subject, html });
}

async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !tok || !from) {
    console.log(`[alerts] sms skipped (unconfigured): ${body} -> ${to}`);
    return;
  }
  const client = twilio(sid, tok);
  await client.messages.create({ from, to, body });
}

export async function alertPause(
  user: Pick<User, "email" | "phone">,
  account: AdAccount,
  decision: Extract<Decision, { action: "pause" }>,
): Promise<void> {
  const subject = `⛔ Auto-paused: ${account.name}`;
  await Promise.allSettled([
    sendEmail(
      user.email,
      subject,
      `<h2>${account.name} was auto-paused</h2><p>${decision.reason}</p>
       <p><a href="${APP_URL}/dashboard">Open your cockpit →</a></p>`,
    ),
    user.phone
      ? sendSms(user.phone, `AdCrewOS: Auto-paused ${account.name}. ${decision.reason}`)
      : Promise.resolve(),
  ]);
}

export async function alertScaleProposal(
  user: Pick<User, "email" | "phone">,
  account: AdAccount,
  decision: Extract<Decision, { action: "propose_scale" }>,
): Promise<void> {
  const subject = `📈 Scale ready: ${account.name}`;
  await Promise.allSettled([
    sendEmail(
      user.email,
      subject,
      `<h2>${account.name} is beating target</h2><p>${decision.reason}</p>
       <p><a href="${APP_URL}/dashboard">Approve the +${decision.proposedPct}% bump →</a></p>`,
    ),
    user.phone
      ? sendSms(
          user.phone,
          `AdCrewOS: ${account.name} beat target — approve +${decision.proposedPct}%? ${APP_URL}/dashboard`,
        )
      : Promise.resolve(),
  ]);
}
