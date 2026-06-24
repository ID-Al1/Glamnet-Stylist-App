import { Router } from "express";
import { eq, or, desc, sql } from "drizzle-orm";
import { db, bookingsTable, usersTable, teamsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// POST /api/bookings — client creates a booking request for a stylist
router.post("/", requireAuth, async (req, res) => {
  const { talentId, jobType, date, location, isHouseCall, notes, totalCost, teamId } = req.body;

  if (!talentId || !jobType || !date || !location) {
    res.status(400).json({ error: "talentId, jobType, date and location are required" });
    return;
  }

  if (req.auth!.userId === talentId) {
    res.status(400).json({ error: "Cannot book yourself" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      clientId: req.auth!.userId,
      talentId,
      jobType,
      date,
      location,
      isHouseCall: isHouseCall ?? false,
      notes: notes ?? "",
      totalCost: totalCost ?? 0,
      teamId: teamId ?? null,
      status: "pending",
    })
    .returning();

  const [[talent], [client], teamRow] = await Promise.all([
    db.select({ name: usersTable.name, handle: usersTable.handle, avatarUrl: usersTable.avatarUrl })
      .from(usersTable).where(eq(usersTable.id, talentId)).limit(1),
    db.select({ name: usersTable.name, handle: usersTable.handle, avatarUrl: usersTable.avatarUrl })
      .from(usersTable).where(eq(usersTable.id, req.auth!.userId)).limit(1),
    teamId
      ? db.select({ name: teamsTable.name }).from(teamsTable).where(eq(teamsTable.id, teamId)).limit(1)
      : Promise.resolve([] as { name: string }[]),
  ]);

  res.status(201).json({
    booking: {
      ...booking,
      talentName: talent?.name ?? null,
      talentHandle: talent?.handle ?? null,
      talentAvatarUrl: talent?.avatarUrl ?? null,
      clientName: client?.name ?? null,
      clientHandle: client?.handle ?? null,
      clientAvatarUrl: client?.avatarUrl ?? null,
      teamName: teamRow[0]?.name ?? null,
    },
  });
});

// GET /api/bookings — returns all bookings where current user is client or talent
router.get("/", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const rows = await db
    .select({
      booking: bookingsTable,
      talentName: usersTable.name,
      talentHandle: usersTable.handle,
      talentAvatarUrl: usersTable.avatarUrl,
      teamName: teamsTable.name,
    })
    .from(bookingsTable)
    .leftJoin(usersTable, eq(bookingsTable.talentId, usersTable.id))
    .leftJoin(teamsTable, eq(bookingsTable.teamId, teamsTable.id))
    .where(or(eq(bookingsTable.clientId, myId), eq(bookingsTable.talentId, myId)))
    .orderBy(desc(bookingsTable.createdAt));

  const result = await Promise.all(
    rows.map(async (r: typeof rows[number]) => {
      const [client] = await db
        .select({ name: usersTable.name, handle: usersTable.handle, avatarUrl: usersTable.avatarUrl })
        .from(usersTable)
        .where(eq(usersTable.id, r.booking.clientId))
        .limit(1);
      return {
        ...r.booking,
        talentName: r.talentName,
        talentHandle: r.talentHandle,
        talentAvatarUrl: r.talentAvatarUrl,
        clientName: client?.name ?? null,
        clientHandle: client?.handle ?? null,
        clientAvatarUrl: client?.avatarUrl ?? null,
        teamName: r.teamName ?? null,
      };
    }),
  );

  res.json({ bookings: result });
});

// PATCH /api/bookings/:id/status — talent accepts/declines; client cancels; talent marks complete
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body;
  const myId = req.auth!.userId;

  if (!["accepted", "declined", "cancelled", "completed"].includes(status)) {
    res.status(400).json({ error: "status must be accepted, declined, cancelled, or completed" });
    return;
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, (req.params.id as string)))
    .limit(1);

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if ((status === "accepted" || status === "declined" || status === "completed") && booking.talentId !== myId) {
    res.status(403).json({ error: "Only the talent can accept, decline, or complete a booking" });
    return;
  }
  if (status === "cancelled" && booking.clientId !== myId) {
    res.status(403).json({ error: "Only the client can cancel a booking" });
    return;
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(bookingsTable.id, (req.params.id as string)))
    .returning();

  // On acceptance: credit talent earnings (totalCost) + R500 referral bonus
  if (status === "accepted") {
    await db
      .update(usersTable)
      .set({
        earnings: sql`${usersTable.earnings} + ${booking.totalCost + 500}`,
        referrals: sql`${usersTable.referrals} + 1`,
      })
      .where(eq(usersTable.id, booking.talentId));
  }

  res.json({ booking: updated });
});

export default router;
