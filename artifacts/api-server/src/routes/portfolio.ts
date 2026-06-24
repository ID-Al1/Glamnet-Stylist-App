import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, portfolioItemsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /api/portfolio/:talentId — public portfolio for a creator
router.get("/:talentId", async (req, res) => {
  const items = await db
    .select()
    .from(portfolioItemsTable)
    .where(eq(portfolioItemsTable.talentId, (req.params.talentId as string)))
    .orderBy(desc(portfolioItemsTable.createdAt));

  // highlights first, then everything else sorted by date
  const highlights = items.filter((i) => i.isHighlight === "true");
  const rest = items.filter((i) => i.isHighlight !== "true");

  res.json({ portfolio: [...highlights, ...rest] });
});

// POST /api/portfolio — creator adds a portfolio item
router.post("/", requireAuth, async (req, res) => {
  const { jobType, title, brandCredit, agencyCredit, shootDate, description, imageUrl, isHighlight } = req.body;

  if (!jobType || !title?.trim()) {
    res.status(400).json({ error: "jobType and title are required" });
    return;
  }

  const [item] = await db
    .insert(portfolioItemsTable)
    .values({
      talentId: req.auth!.userId,
      jobType,
      title: title.trim(),
      brandCredit: brandCredit?.trim() ?? null,
      agencyCredit: agencyCredit?.trim() ?? null,
      shootDate: shootDate?.trim() ?? null,
      description: description?.trim() ?? null,
      imageUrl: imageUrl?.trim() ?? null,
      isHighlight: isHighlight ? "true" : "false",
    })
    .returning();

  res.status(201).json({ item });
});

// PATCH /api/portfolio/:id — creator edits their item
router.patch("/:id", requireAuth, async (req, res) => {
  const { jobType, title, brandCredit, agencyCredit, shootDate, description, imageUrl, isHighlight } = req.body;

  const [existing] = await db
    .select()
    .from(portfolioItemsTable)
    .where(eq(portfolioItemsTable.id, (req.params.id as string)))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Item not found" }); return; }
  if (existing.talentId !== req.auth!.userId) { res.status(403).json({ error: "Not yours" }); return; }

  const [updated] = await db
    .update(portfolioItemsTable)
    .set({
      ...(jobType && { jobType }),
      ...(title && { title: title.trim() }),
      ...(brandCredit !== undefined && { brandCredit: brandCredit?.trim() ?? null }),
      ...(agencyCredit !== undefined && { agencyCredit: agencyCredit?.trim() ?? null }),
      ...(shootDate !== undefined && { shootDate: shootDate?.trim() ?? null }),
      ...(description !== undefined && { description: description?.trim() ?? null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() ?? null }),
      ...(isHighlight !== undefined && { isHighlight: isHighlight ? "true" : "false" }),
    })
    .where(eq(portfolioItemsTable.id, (req.params.id as string)))
    .returning();

  res.json({ item: updated });
});

// DELETE /api/portfolio/:id — creator removes their item
router.delete("/:id", requireAuth, async (req, res) => {
  const [existing] = await db
    .select()
    .from(portfolioItemsTable)
    .where(eq(portfolioItemsTable.id, (req.params.id as string)))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Item not found" }); return; }
  if (existing.talentId !== req.auth!.userId) { res.status(403).json({ error: "Not yours" }); return; }

  await db.delete(portfolioItemsTable).where(eq(portfolioItemsTable.id, (req.params.id as string)));
  res.json({ success: true });
});

export default router;
