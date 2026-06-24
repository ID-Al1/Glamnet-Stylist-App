import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, paymentsTable, fxRatesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { initializePayment, verifyPayment } from "../services/paystack";
import crypto from "crypto";

const router = Router();

const SUPPORTED_CURRENCIES = ["ZAR", "NGN", "KES", "USD"];

// ─── FX RATES ─────────────────────────────────────────────────────────────────

// GET /api/payments/fx — public, returns latest ZAR-based rates
router.get("/fx", async (_req, res) => {
  const rows = await db
    .select()
    .from(fxRatesTable)
    .orderBy(desc(fxRatesTable.fetchedAt))
    .limit(10);

  res.json({ rates: rows });
});

// POST /api/payments/fx/refresh — internal/admin; refreshes FX rates from ExchangeRate-API
router.post("/fx/refresh", requireAuth, async (_req, res) => {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) { res.status(503).json({ error: "FX service not configured" }); return; }

  const endpoint = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/ZAR`;
  const r = await fetch(endpoint);
  const data = await r.json() as any;

  if (data.result !== "success") {
    res.status(502).json({ error: "FX API returned an error" }); return;
  }

  const targets = ["NGN", "KES", "USD", "EUR", "GBP"];
  const inserts = targets.map((t) => ({
    baseCurrency: "ZAR",
    targetCurrency: t,
    rate: String(data.conversion_rates[t] ?? 0),
  }));

  await db.insert(fxRatesTable).values(inserts);
  res.json({ message: "Rates refreshed", rates: inserts });
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

// POST /api/payments/initialize — start a Paystack checkout
// Body: { amountZar: number, currency?: "ZAR"|"NGN"|"KES"|"USD", bookingId?: string }
router.post("/initialize", requireAuth, async (req, res) => {
  const { amountZar, currency = "ZAR", bookingId } = req.body;

  if (!amountZar || typeof amountZar !== "number" || amountZar <= 0) {
    res.status(400).json({ error: "amountZar must be a positive number" }); return;
  }
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    res.status(400).json({ error: `currency must be one of ${SUPPORTED_CURRENCIES.join(", ")}` }); return;
  }

  // Convert ZAR to target currency using latest cached rate if needed
  let amountInCurrency = amountZar;
  if (currency !== "ZAR") {
    const [rate] = await db
      .select()
      .from(fxRatesTable)
      .where(eq(fxRatesTable.targetCurrency, currency))
      .orderBy(desc(fxRatesTable.fetchedAt))
      .limit(1);

    if (!rate) {
      res.status(503).json({ error: `No FX rate found for ${currency}. Run /api/payments/fx/refresh first.` });
      return;
    }
    amountInCurrency = amountZar * parseFloat(rate.rate);
  }

  // Paystack expects smallest unit (cents/kobo)
  const amountKobo = Math.round(amountInCurrency * 100);

  // Generate a unique reference
  const reference = `glamnet_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const result = await initializePayment({
    email: req.auth!.email,
    amountSmallestUnit: amountKobo,
    currency,
    reference,
    metadata: { bookingId: bookingId ?? null, userId: req.auth!.userId },
  });

  // Persist pending record
  const [payment] = await db
    .insert(paymentsTable)
    .values({
      userId: req.auth!.userId,
      bookingId: bookingId ?? null,
      paystackReference: result.reference,
      paystackAccessCode: result.accessCode,
      amountKobo,
      currency,
    })
    .returning();

  res.status(201).json({
    payment,
    checkoutUrl: result.authorizationUrl,
    accessCode: result.accessCode,
  });
});

// GET /api/payments/verify/:reference — verify & update status
router.get("/verify/:reference", requireAuth, async (req, res) => {
  const reference = req.params.reference as string;

  const [existing] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.paystackReference, reference))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Payment not found" }); return; }
  if (existing.userId !== req.auth!.userId) { res.status(403).json({ error: "Not your payment" }); return; }

  const result = await verifyPayment(reference);

  const [updated] = await db
    .update(paymentsTable)
    .set({
      status: result.status,
      paidAt: result.paidAt ? new Date(result.paidAt) : null,
    })
    .where(eq(paymentsTable.paystackReference, reference))
    .returning();

  res.json({ payment: updated, paystackStatus: result.status });
});

// GET /api/payments/history — authenticated user's payment history
router.get("/history", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, req.auth!.userId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(50);

  res.json({ payments: rows });
});

// POST /api/payments/webhook — Paystack webhook (no auth; verify signature)
router.post("/webhook", async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    res.status(401).send("Invalid signature");
    return;
  }

  const event = req.body as any;

  if (event.event === "charge.success") {
    const ref = event.data?.reference;
    if (ref) {
      await db
        .update(paymentsTable)
        .set({ status: "success", paidAt: new Date(event.data.paid_at) })
        .where(eq(paymentsTable.paystackReference, ref));
    }
  }

  res.sendStatus(200);
});

export default router;
