import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, verificationsTable, escrowTable, disputesTable, bookingsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// ─── VERIFICATION ────────────────────────────────────────────────────────────

// GET /api/trust/verifications/mine — creator checks their verification status
router.get("/verifications/mine", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(verificationsTable)
    .where(eq(verificationsTable.userId, req.auth!.userId))
    .orderBy(desc(verificationsTable.submittedAt));

  res.json({ verifications: rows });
});

// POST /api/trust/verifications — creator submits a verification request
router.post("/verifications", requireAuth, async (req, res) => {
  const { type, evidenceUrl, notes } = req.body;

  const VALID_TYPES = ["identity", "portfolio", "skill", "agency"];
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: "type must be identity, portfolio, skill, or agency" });
    return;
  }

  // Prevent duplicate pending submissions for the same type
  const [existing] = await db
    .select()
    .from(verificationsTable)
    .where(eq(verificationsTable.userId, req.auth!.userId))
    .limit(100);

  const pending = existing && (existing as any).type === type && (existing as any).status === "pending";
  if (pending) {
    res.status(409).json({ error: "You already have a pending verification request for this type" });
    return;
  }

  const [row] = await db
    .insert(verificationsTable)
    .values({ userId: req.auth!.userId, type, evidenceUrl: evidenceUrl ?? null, notes: notes ?? null })
    .returning();

  res.status(201).json({ verification: row });
});

// ─── ESCROW ──────────────────────────────────────────────────────────────────

// POST /api/trust/escrow — client holds funds for a booking
router.post("/escrow", requireAuth, async (req, res) => {
  const { bookingId, amountZar, currency } = req.body;

  if (!bookingId || !amountZar) {
    res.status(400).json({ error: "bookingId and amountZar are required" });
    return;
  }

  // Verify booking belongs to this client
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, bookingId))
    .limit(1);

  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  if (booking.clientId !== req.auth!.userId) { res.status(403).json({ error: "Not your booking" }); return; }

  const [escrow] = await db
    .insert(escrowTable)
    .values({
      bookingId,
      clientId: booking.clientId,
      talentId: booking.talentId,
      amountZar: String(amountZar),
      currency: currency ?? "ZAR",
    })
    .returning();

  res.status(201).json({ escrow });
});

// PATCH /api/trust/escrow/:id/release — talent completes job, client releases funds
router.patch("/escrow/:id/release", requireAuth, async (req, res) => {
  const [escrow] = await db
    .select()
    .from(escrowTable)
    .where(eq(escrowTable.id, (req.params.id as string)))
    .limit(1);

  if (!escrow) { res.status(404).json({ error: "Escrow not found" }); return; }
  if (escrow.clientId !== req.auth!.userId && escrow.talentId !== req.auth!.userId) {
    res.status(403).json({ error: "Not your escrow" }); return;
  }
  if (escrow.status !== "held") {
    res.status(400).json({ error: "Escrow is not in held state" }); return;
  }

  const [updated] = await db
    .update(escrowTable)
    .set({ status: "released", releasedAt: new Date() })
    .where(eq(escrowTable.id, (req.params.id as string)))
    .returning();

  res.json({ escrow: updated });
});

// ─── DISPUTES ─────────────────────────────────────────────────────────────────

// POST /api/trust/disputes — raise a dispute on a booking
router.post("/disputes", requireAuth, async (req, res) => {
  const { bookingId, reason } = req.body;

  if (!bookingId || !reason?.trim()) {
    res.status(400).json({ error: "bookingId and reason are required" });
    return;
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, bookingId))
    .limit(1);

  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  if (booking.clientId !== req.auth!.userId && booking.talentId !== req.auth!.userId) {
    res.status(403).json({ error: "Not your booking" }); return;
  }

  // Freeze any related escrow
  await db
    .update(escrowTable)
    .set({ status: "disputed", disputeReason: reason.trim() })
    .where(eq(escrowTable.bookingId, bookingId));

  const [dispute] = await db
    .insert(disputesTable)
    .values({ bookingId, raisedBy: req.auth!.userId, reason: reason.trim() })
    .returning();

  res.status(201).json({ dispute });
});

// GET /api/trust/disputes/mine — see disputes you're involved in
router.get("/disputes/mine", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(disputesTable)
    .where(eq(disputesTable.raisedBy, req.auth!.userId))
    .orderBy(desc(disputesTable.createdAt));

  res.json({ disputes: rows });
});

export default router;
