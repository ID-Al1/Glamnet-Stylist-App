/**
 * Notification service — multi-channel delivery.
 *
 * Channel priority:
 *   1. WhatsApp (via Twilio or a Meta-approved provider)
 *   2. SMS fallback (via Twilio Programmable SMS)
 *   3. Push (via Expo Push Notification Service)
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN — Twilio account
 *   TWILIO_WHATSAPP_FROM — e.g. "whatsapp:+14155238886" (Twilio sandbox)
 *   TWILIO_SMS_FROM — e.g. "+27xxxxxxxxxx" (your SA sender)
 *   EXPO_PUSH_URL — default: https://exp.host/--/api/v2/push/send
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotifyPayload {
  to: {
    phone?: string;      // E.164 format, e.g. "+27821234567"
    expoPushToken?: string;
  };
  subject: string;       // short title for push
  body: string;          // message body (shared across channels)
  data?: Record<string, unknown>;  // deep-link data for push
}

export type NotifyResult = {
  channel: "whatsapp" | "sms" | "push" | "none";
  success: boolean;
  error?: string;
};

// ─── WhatsApp via Twilio ──────────────────────────────────────────────────────

async function sendWhatsApp(phone: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) return false;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const form = new URLSearchParams({
    From: from,
    To: `whatsapp:${phone}`,
    Body: body,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
    },
    body: form.toString(),
  });

  return res.ok;
}

// ─── SMS via Twilio ───────────────────────────────────────────────────────────

async function sendSms(phone: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM;

  if (!sid || !token || !from) return false;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const form = new URLSearchParams({ From: from, To: phone, Body: body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
    },
    body: form.toString(),
  });

  return res.ok;
}

// ─── Push via Expo ────────────────────────────────────────────────────────────

async function sendPush(expoPushToken: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
  const url = process.env.EXPO_PUSH_URL ?? "https://exp.host/--/api/v2/push/send";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: data ?? {},
    }),
  });

  if (!res.ok) return false;
  const json = await res.json() as any;
  return json?.data?.status !== "error";
}

// ─── Main dispatch ────────────────────────────────────────────────────────────

/**
 * Send a notification across the best available channel.
 * WhatsApp first → SMS fallback → Push fallback → log only.
 */
export async function sendNotification(payload: NotifyPayload): Promise<NotifyResult> {
  const { to, subject, body, data } = payload;

  // 1. WhatsApp
  if (to.phone) {
    try {
      const ok = await sendWhatsApp(to.phone, `*GlamNet*: ${body}`);
      if (ok) return { channel: "whatsapp", success: true };
    } catch { /* fall through */ }

    // 2. SMS fallback
    try {
      const ok = await sendSms(to.phone, `GlamNet: ${body}`);
      if (ok) return { channel: "sms", success: true };
    } catch { /* fall through */ }
  }

  // 3. Expo push
  if (to.expoPushToken) {
    try {
      const ok = await sendPush(to.expoPushToken, subject, body, data);
      if (ok) return { channel: "push", success: true };
    } catch { /* fall through */ }
  }

  // 4. Nothing worked — log and move on (don't block the booking flow)
  console.warn("[notify] All channels failed for", JSON.stringify(to));
  return { channel: "none", success: false, error: "No channel available" };
}

// ─── Template helpers ─────────────────────────────────────────────────────────

export const NotifyTemplates = {
  bookingConfirmed: (talentName: string, date: string) =>
    `Your booking with ${talentName} is confirmed for ${date}. Open GlamNet for details.`,

  bookingRequest: (clientName: string, date: string) =>
    `${clientName} wants to book you on ${date}. Log into GlamNet to accept or decline.`,

  escrowHeld: (amount: string) =>
    `Payment of ${amount} is held in escrow. Complete the job and request release to get paid.`,

  escrowReleased: (amount: string) =>
    `${amount} has been released from escrow. Check your GlamNet wallet.`,

  newCastingCall: (title: string) =>
    `New casting call: "${title}". Apply now on GlamNet.`,

  verificationApproved: (type: string) =>
    `Your ${type} verification has been approved! Your badge is live on GlamNet.`,
};
