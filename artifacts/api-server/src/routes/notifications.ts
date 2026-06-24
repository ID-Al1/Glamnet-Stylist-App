import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /api/notifications — all notifications for the current user
router.get("/", requireAuth, async (req, res) => {
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.auth!.userId))
    .orderBy(desc(notificationsTable.createdAt));

  res.json({
    notifications: rows.map((n: typeof rows[number]) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      timestamp: new Date(n.createdAt).getTime(),
      data: n.data ? JSON.parse(n.data) : {},
    })),
  });
});

// PATCH /api/notifications/:id/read — mark one notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  const [updated] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(
      and(
        eq(notificationsTable.id, (req.params.id as string)),
        eq(notificationsTable.userId, req.auth!.userId)
      )
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json({ success: true });
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", requireAuth, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, req.auth!.userId));

  res.json({ success: true });
});

// DELETE /api/notifications/:id — delete one notification
router.delete("/:id", requireAuth, async (req, res) => {
  await db
    .delete(notificationsTable)
    .where(
      and(
        eq(notificationsTable.id, (req.params.id as string)),
        eq(notificationsTable.userId, req.auth!.userId)
      )
    );

  res.json({ success: true });
});

// DELETE /api/notifications — clear all notifications
router.delete("/", requireAuth, async (req, res) => {
  await db
    .delete(notificationsTable)
    .where(eq(notificationsTable.userId, req.auth!.userId));

  res.json({ success: true });
});

export default router;
