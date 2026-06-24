import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import {
  db,
  referralCodesTable,
  referralUsesTable,
  photographerCastingsTable,
  castingApplicationsTable,
  usersTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import crypto from "crypto";

const router = Router();

// ─── REFERRAL CODES ───────────────────────────────────────────────────────────

// GET /api/flywheel/referral/mine — get (or create) my referral code
router.get("/referral/mine", requireAuth, async (req, res) => {
  let [code] = await db
    .select()
    .from(referralCodesTable)
    .where(eq(referralCodesTable.ownerId, req.auth!.userId))
    .limit(1);

  if (!code) {
    // Auto-generate a code on first access
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    const handle = req.auth!.email.split("@")[0].slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const uniqueCode = `${handle}${raw}`.slice(0, 10);

    [code] = await db
      .insert(referralCodesTable)
      .values({ ownerId: req.auth!.userId, code: uniqueCode })
      .returning();
  }

  res.json({ referralCode: code });
});

// GET /api/flywheel/referral/:code/uses — how many people used my code
router.get("/referral/:code/uses", requireAuth, async (req, res) => {
  const [code] = await db
    .select()
    .from(referralCodesTable)
    .where(eq(referralCodesTable.code, (req.params.code as string)))
    .limit(1);

  if (!code) { res.status(404).json({ error: "Code not found" }); return; }
  if (code.ownerId !== req.auth!.userId) { res.status(403).json({ error: "Not your code" }); return; }

  const uses = await db
    .select()
    .from(referralUsesTable)
    .where(eq(referralUsesTable.codeId, code.id))
    .orderBy(desc(referralUsesTable.usedAt));

  res.json({ code, uses });
});

// POST /api/flywheel/referral/apply — apply a referral code at signup (or post-signup)
router.post("/referral/apply", requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) { res.status(400).json({ error: "code is required" }); return; }

  const [referralCode] = await db
    .select()
    .from(referralCodesTable)
    .where(eq(referralCodesTable.code, code.trim().toUpperCase()))
    .limit(1);

  if (!referralCode) { res.status(404).json({ error: "Invalid referral code" }); return; }
  if (referralCode.ownerId === req.auth!.userId) {
    res.status(400).json({ error: "You cannot use your own referral code" }); return;
  }

  // Check if they've already used a code
  const [existing] = await db
    .select()
    .from(referralUsesTable)
    .where(eq(referralUsesTable.newUserId, req.auth!.userId))
    .limit(1);

  if (existing) { res.status(409).json({ error: "You have already used a referral code" }); return; }

  // Record the use and increment the counter
  const [use] = await db
    .insert(referralUsesTable)
    .values({ codeId: referralCode.id, newUserId: req.auth!.userId })
    .returning();

  await db
    .update(referralCodesTable)
    .set({ usesCount: sql`${referralCodesTable.usesCount} + 1` })
    .where(eq(referralCodesTable.id, referralCode.id));

  res.status(201).json({ use });
});

// ─── PHOTOGRAPHER CASTINGS ────────────────────────────────────────────────────

// GET /api/flywheel/castings — public feed of open casting calls
router.get("/castings", async (req, res) => {
  const rows = await db
    .select()
    .from(photographerCastingsTable)
    .where(eq(photographerCastingsTable.status, "open"))
    .orderBy(desc(photographerCastingsTable.createdAt))
    .limit(50);

  res.json({ castings: rows });
});

// GET /api/flywheel/castings/mine — photographer's own casting calls
router.get("/castings/mine", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(photographerCastingsTable)
    .where(eq(photographerCastingsTable.photographerId, req.auth!.userId))
    .orderBy(desc(photographerCastingsTable.createdAt));

  res.json({ castings: rows });
});

// GET /api/flywheel/castings/:id — single casting detail with applications
router.get("/castings/:id", async (req, res) => {
  const [casting] = await db
    .select()
    .from(photographerCastingsTable)
    .where(eq(photographerCastingsTable.id, (req.params.id as string)))
    .limit(1);

  if (!casting) { res.status(404).json({ error: "Casting not found" }); return; }

  const applications = await db
    .select()
    .from(castingApplicationsTable)
    .where(eq(castingApplicationsTable.castingId, casting.id))
    .orderBy(desc(castingApplicationsTable.createdAt));

  res.json({ casting, applications });
});

// POST /api/flywheel/castings — photographer posts a new casting call
router.post("/castings", requireAuth, async (req, res) => {
  const { title, concept, location, shootDate, compensation, rolesNeeded, expiresAt } = req.body;

  if (!title?.trim() || !concept?.trim() || !rolesNeeded?.trim()) {
    res.status(400).json({ error: "title, concept, and rolesNeeded are required" }); return;
  }

  const [casting] = await db
    .insert(photographerCastingsTable)
    .values({
      photographerId: req.auth!.userId,
      title: title.trim(),
      concept: concept.trim(),
      location: location?.trim() ?? null,
      shootDate: shootDate?.trim() ?? null,
      compensation: compensation?.trim() ?? null,
      rolesNeeded: rolesNeeded.trim(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  res.status(201).json({ casting });
});

// PATCH /api/flywheel/castings/:id — photographer updates or closes their call
router.patch("/castings/:id", requireAuth, async (req, res) => {
  const [casting] = await db
    .select()
    .from(photographerCastingsTable)
    .where(eq(photographerCastingsTable.id, (req.params.id as string)))
    .limit(1);

  if (!casting) { res.status(404).json({ error: "Casting not found" }); return; }
  if (casting.photographerId !== req.auth!.userId) { res.status(403).json({ error: "Not your casting" }); return; }

  const allowed = ["title", "concept", "location", "shootDate", "compensation", "rolesNeeded", "status", "expiresAt"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const [updated] = await db
    .update(photographerCastingsTable)
    .set(updates)
    .where(eq(photographerCastingsTable.id, (req.params.id as string)))
    .returning();

  res.json({ casting: updated });
});

// ─── CASTING APPLICATIONS ─────────────────────────────────────────────────────

// POST /api/flywheel/castings/:id/apply — model/stylist applies to a casting
router.post("/castings/:id/apply", requireAuth, async (req, res) => {
  const { role, message } = req.body;
  if (!role?.trim()) { res.status(400).json({ error: "role is required" }); return; }

  const [casting] = await db
    .select()
    .from(photographerCastingsTable)
    .where(eq(photographerCastingsTable.id, (req.params.id as string)))
    .limit(1);

  if (!casting) { res.status(404).json({ error: "Casting not found" }); return; }
  if (casting.status !== "open") { res.status(400).json({ error: "This casting is no longer open" }); return; }
  if (casting.photographerId === req.auth!.userId) {
    res.status(400).json({ error: "You cannot apply to your own casting" }); return;
  }

  // Prevent duplicate applications for the same role
  const [existing] = await db
    .select()
    .from(castingApplicationsTable)
    .where(eq(castingApplicationsTable.castingId, casting.id))
    .limit(100);

  // Note: simple dup check — in prod use compound unique index
  const dup = existing &&
    (existing as any).applicantId === req.auth!.userId &&
    (existing as any).role === role.trim();

  if (dup) { res.status(409).json({ error: "You have already applied to this casting for this role" }); return; }

  const [application] = await db
    .insert(castingApplicationsTable)
    .values({
      castingId: casting.id,
      applicantId: req.auth!.userId,
      role: role.trim(),
      message: message?.trim() ?? null,
    })
    .returning();

  res.status(201).json({ application });
});

// PATCH /api/flywheel/castings/:id/applications/:appId — photographer accepts/rejects
router.patch("/castings/:id/applications/:appId", requireAuth, async (req, res) => {
  const [casting] = await db
    .select()
    .from(photographerCastingsTable)
    .where(eq(photographerCastingsTable.id, (req.params.id as string)))
    .limit(1);

  if (!casting) { res.status(404).json({ error: "Casting not found" }); return; }
  if (casting.photographerId !== req.auth!.userId) { res.status(403).json({ error: "Not your casting" }); return; }

  const { status } = req.body;
  if (!["accepted", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be accepted or rejected" }); return;
  }

  const [updated] = await db
    .update(castingApplicationsTable)
    .set({ status })
    .where(eq(castingApplicationsTable.id, (req.params.appId as string)))
    .returning();

  res.json({ application: updated });
});

export default router;
