import { Router } from "express";
import { eq, desc, avg, count } from "drizzle-orm";
import { db, ratingsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// POST /api/ratings — submit a rating for a talent
router.post("/", requireAuth, async (req, res) => {
  const { revieweeId, score, comment, bookingId } = req.body;
  const reviewerId = req.auth!.userId;

  if (!revieweeId || !score) {
    res.status(400).json({ error: "revieweeId and score are required" });
    return;
  }

  if (typeof score !== "number" || score < 1 || score > 5) {
    res.status(400).json({ error: "score must be an integer between 1 and 5" });
    return;
  }

  if (reviewerId === revieweeId) {
    res.status(400).json({ error: "Cannot rate yourself" });
    return;
  }

  const [rating] = await db
    .insert(ratingsTable)
    .values({
      reviewerId,
      revieweeId,
      score: Math.round(score),
      comment: comment ?? null,
      bookingId: bookingId ?? null,
    })
    .returning();

  res.status(201).json({ rating });
});

// GET /api/ratings/talent/:talentId — get ratings for a talent
router.get("/talent/:talentId", async (req, res) => {
  const { talentId } = req.params;

  const [stats] = await db
    .select({
      averageScore: avg(ratingsTable.score),
      count: count(ratingsTable.id),
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.revieweeId, talentId));

  const rows = await db
    .select({
      id: ratingsTable.id,
      score: ratingsTable.score,
      comment: ratingsTable.comment,
      createdAt: ratingsTable.createdAt,
      reviewerName: usersTable.name,
      reviewerHandle: usersTable.handle,
    })
    .from(ratingsTable)
    .leftJoin(usersTable, eq(ratingsTable.reviewerId, usersTable.id))
    .where(eq(ratingsTable.revieweeId, talentId))
    .orderBy(desc(ratingsTable.createdAt))
    .limit(20);

  res.json({
    averageScore: stats?.averageScore ? parseFloat(Number(stats.averageScore).toFixed(1)) : null,
    count: Number(stats?.count ?? 0),
    ratings: rows,
  });
});

export default router;
