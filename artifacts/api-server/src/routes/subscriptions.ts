import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, subscriptionsTable, PRO_PRICE_ZAR, PRO_PLATFORM_FEE_PERCENT, FREE_PLATFORM_FEE_PERCENT } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { initializePayment } from "../services/paystack";
import crypto from "crypto";

const router = Router();

// ─── helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateSub(userId: string) {
  let [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(1);

  if (!sub) {
    [sub] = await db
      .insert(subscriptionsTable)
      .values({ userId, tier: "free", status: "active" })
      .returning();
  }
  return sub;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/subscriptions/mine — current user's tier
router.get("/mine", requireAuth, async (req, res) => {
  const sub = await getOrCreateSub(req.auth!.userId);
  const isPro = sub.tier === "pro" && sub.status === "active";

  res.json({
    subscription: sub,
    isPro,
    platformFeePercent: isPro ? PRO_PLATFORM_FEE_PERCENT : FREE_PLATFORM_FEE_PERCENT,
    features: isPro
      ? {
          portfolioLimit: null,   // unlimited
          prioritySearch: true,
          analytics: true,
          verificationAccess: true,
        }
      : {
          portfolioLimit: 5,
          prioritySearch: false,
          analytics: false,
          verificationAccess: false,
        },
  });
});

// POST /api/subscriptions/upgrade — start Paystack checkout to go Pro
router.post("/upgrade", requireAuth, async (req, res) => {
  const sub = await getOrCreateSub(req.auth!.userId);

  if (sub.tier === "pro" && sub.status === "active") {
    res.status(409).json({ error: "You are already on Pro" }); return;
  }

  const reference = `glamnet_pro_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  const result = await initializePayment({
    email: req.auth!.email,
    amountSmallestUnit: PRO_PRICE_ZAR * 100,  // ZAR cents
    currency: "ZAR",
    reference,
    metadata: { purpose: "pro_subscription", userId: req.auth!.userId },
  });

  res.status(201).json({
    checkoutUrl: result.authorizationUrl,
    accessCode: result.accessCode,
    reference: result.reference,
    priceZar: PRO_PRICE_ZAR,
  });
});

// POST /api/subscriptions/activate — called after payment confirmed (or from webhook)
router.post("/activate", requireAuth, async (req, res) => {
  const sub = await getOrCreateSub(req.auth!.userId);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const [updated] = await db
    .update(subscriptionsTable)
    .set({
      tier: "pro",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    })
    .where(eq(subscriptionsTable.id, sub.id))
    .returning();

  res.json({ subscription: updated });
});

// POST /api/subscriptions/cancel — cancels at end of period
router.post("/cancel", requireAuth, async (req, res) => {
  const sub = await getOrCreateSub(req.auth!.userId);

  if (sub.tier !== "pro") {
    res.status(400).json({ error: "You are not on a Pro subscription" }); return;
  }

  const [updated] = await db
    .update(subscriptionsTable)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(subscriptionsTable.id, sub.id))
    .returning();

  res.json({ subscription: updated, message: "Pro cancelled. Your benefits last until the end of the current period." });
});

// ─── Platform fee calculator ─── (no auth, utility endpoint for mobile) ──────

// GET /api/subscriptions/fee-preview?amountZar=1000&tier=pro
router.get("/fee-preview", async (req, res) => {
  const amount = parseFloat(String(req.query.amountZar ?? "0"));
  const tier = String(req.query.tier ?? "free");
  const feePct = tier === "pro" ? PRO_PLATFORM_FEE_PERCENT : FREE_PLATFORM_FEE_PERCENT;
  const fee = Math.round(amount * (feePct / 100) * 100) / 100;
  const payout = Math.round((amount - fee) * 100) / 100;

  res.json({ amountZar: amount, feePercent: feePct, feeZar: fee, payoutZar: payout });
});

export default router;
