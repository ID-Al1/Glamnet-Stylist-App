import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, contractsTable, bookingsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { sendNotification, NotifyTemplates } from "../services/notifications";

const router = Router();

// ─── Create contract on booking confirmation ──────────────────────────────────

// POST /api/contracts — auto-called when a booking is confirmed
router.post("/", requireAuth, async (req, res) => {
  const {
    bookingId, jobTitle, jobDate, location, callTime,
    agreedRateZar, usageRights, cancellationPolicy, additionalTerms,
  } = req.body;

  if (!bookingId || !jobTitle || !jobDate || !agreedRateZar) {
    res.status(400).json({ error: "bookingId, jobTitle, jobDate, and agreedRateZar are required" });
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

  const [contract] = await db
    .insert(contractsTable)
    .values({
      bookingId,
      clientId: booking.clientId,
      talentId: booking.talentId,
      jobTitle,
      jobDate,
      location: location ?? null,
      callTime: callTime ?? null,
      agreedRateZar: String(agreedRateZar),
      usageRights: usageRights ?? null,
      cancellationPolicy: cancellationPolicy ?? null,
      additionalTerms: additionalTerms ?? null,
    })
    .returning();

  // Notify both parties
  const [client, talent] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, booking.clientId)).limit(1),
    db.select().from(usersTable).where(eq(usersTable.id, booking.talentId)).limit(1),
  ]);

  await Promise.allSettled([
    sendNotification({
      to: { phone: (talent[0] as any)?.phone ?? undefined },
      subject: "Booking confirmed",
      body: NotifyTemplates.bookingRequest(client[0]?.name ?? "A client", jobDate),
    }),
    sendNotification({
      to: { phone: (client[0] as any)?.phone ?? undefined },
      subject: "Booking confirmed",
      body: NotifyTemplates.bookingConfirmed(talent[0]?.name ?? "Your talent", jobDate),
    }),
  ]);

  res.status(201).json({ contract });
});

// GET /api/contracts/:bookingId — fetch contract for a booking
router.get("/:bookingId", requireAuth, async (req, res) => {
  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.bookingId, (req.params.bookingId as string)))
    .limit(1);

  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }
  if (contract.clientId !== req.auth!.userId && contract.talentId !== req.auth!.userId) {
    res.status(403).json({ error: "Not your contract" }); return;
  }

  res.json({ contract });
});

// POST /api/contracts/:id/sign — digital sign-off by one party
router.post("/:id/sign", requireAuth, async (req, res) => {
  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, (req.params.id as string)))
    .limit(1);

  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }

  const isClient = contract.clientId === req.auth!.userId;
  const isTalent = contract.talentId === req.auth!.userId;

  if (!isClient && !isTalent) { res.status(403).json({ error: "Not your contract" }); return; }

  const updates: Record<string, unknown> = {};
  if (isClient) { updates.clientSigned = true; updates.clientSignedAt = new Date(); }
  if (isTalent) { updates.talentSigned = true; updates.talentSignedAt = new Date(); }

  const [updated] = await db
    .update(contractsTable)
    .set(updates)
    .where(eq(contractsTable.id, (req.params.id as string)))
    .returning();

  res.json({ contract: updated });
});

// GET /api/contracts/:id/text — plaintext contract for offline sharing (WhatsApp copy-paste)
router.get("/:id/text", requireAuth, async (req, res) => {
  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.id, (req.params.id as string)))
    .limit(1);

  if (!contract) { res.status(404).json({ error: "Contract not found" }); return; }
  if (contract.clientId !== req.auth!.userId && contract.talentId !== req.auth!.userId) {
    res.status(403).json({ error: "Not your contract" }); return;
  }

  const [client, talent] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, contract.clientId)).limit(1),
    db.select().from(usersTable).where(eq(usersTable.id, contract.talentId)).limit(1),
  ]);

  const text = `
GLAMNET BOOKING AGREEMENT
=========================
Job: ${contract.jobTitle}
Date: ${contract.jobDate}
${contract.callTime ? `Call time: ${contract.callTime}` : ""}
${contract.location ? `Location: ${contract.location}` : ""}

Client: ${client[0]?.name ?? "—"} (${client[0]?.email ?? ""})
Talent: ${talent[0]?.name ?? "—"} (${talent[0]?.email ?? ""})

Agreed rate: R ${contract.agreedRateZar}
${contract.usageRights ? `Usage rights: ${contract.usageRights}` : ""}
${contract.cancellationPolicy ? `Cancellation: ${contract.cancellationPolicy}` : ""}
${contract.additionalTerms ? `Additional terms:\n${contract.additionalTerms}` : ""}

Client signed: ${contract.clientSigned ? "Yes" : "Pending"}
Talent signed: ${contract.talentSigned ? "Yes" : "Pending"}

Contract ID: ${contract.id}
Generated by GlamNet — glamnet.co.za
`.trim();

  res.type("text/plain").send(text);
});

export default router;
