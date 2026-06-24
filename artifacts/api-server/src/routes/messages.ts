import { Router } from "express";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { db, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// helper — find the "other" participant in a conversation
function otherParticipantId(conv: { participant1Id: string; participant2Id: string }, myId: string) {
  return conv.participant1Id === myId ? conv.participant2Id : conv.participant1Id;
}

// GET /api/messages/threads — all conversations for current user
router.get("/threads", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const convs = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.participant1Id, myId),
        eq(conversationsTable.participant2Id, myId),
      ),
    )
    .orderBy(desc(conversationsTable.updatedAt));

  const threads = await Promise.all(
    convs.map(async (conv: typeof convs[number]) => {
      const otherId = otherParticipantId(conv, myId);

      const [other] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, otherId))
        .limit(1);

      const [lastMsg] = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conv.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      const [{ unread }] = await db
        .select({ unread: sql<number>`cast(count(*) as int)` })
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.conversationId, conv.id),
            eq(messagesTable.status, "sent"),
            sql`${messagesTable.senderId} != ${myId}`,
          ),
        );

      return {
        id: conv.id,
        participantId: otherId,
        participantName: other?.name ?? "Unknown",
        participantHandle: other?.handle ?? "",
        participantRole: other?.specialties?.[0] ?? other?.role ?? "",
        participantType: other?.role === "stylist" ? "artist" : "model",
        participantAvatarUrl: other?.avatarUrl ?? null,
        lastMessage: lastMsg?.content ?? "",
        lastTimestamp: lastMsg?.createdAt ? new Date(lastMsg.createdAt).getTime() : new Date(conv.createdAt).getTime(),
        unreadCount: unread ?? 0,
        updatedAt: conv.updatedAt,
      };
    }),
  );

  res.json({ threads });
});

// POST /api/messages/threads — get or create a conversation with another user
router.post("/threads", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;
  const { participantId, bookingContext } = req.body;

  if (!participantId) {
    res.status(400).json({ error: "participantId is required" });
    return;
  }

  if (participantId === myId) {
    res.status(400).json({ error: "Cannot message yourself" });
    return;
  }

  // Check if conversation already exists (either direction)
  const existing = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        and(
          eq(conversationsTable.participant1Id, myId),
          eq(conversationsTable.participant2Id, participantId),
        ),
        and(
          eq(conversationsTable.participant1Id, participantId),
          eq(conversationsTable.participant2Id, myId),
        ),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    res.json({ conversationId: existing[0].id, created: false });
    return;
  }

  const [conv] = await db
    .insert(conversationsTable)
    .values({ participant1Id: myId, participant2Id: participantId })
    .returning();

  res.status(201).json({ conversationId: conv.id, created: true });
});

// GET /api/messages/threads/:id — messages in a thread
router.get("/threads/:id", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, (req.params.id as string)))
    .limit(1);

  if (!conv) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  if (conv.participant1Id !== myId && conv.participant2Id !== myId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, (req.params.id as string)))
    .orderBy(messagesTable.createdAt);

  res.json({
    messages: msgs.map((m: typeof msgs[number]) => ({
      id: m.id,
      threadId: m.conversationId,
      senderId: m.senderId,
      text: m.content,
      timestamp: new Date(m.createdAt).getTime(),
      read: m.status !== "sent",
    })),
  });
});

// POST /api/messages/threads/:id/messages — send a message
router.post("/threads/:id/messages", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;
  const { text } = req.body;

  if (!text?.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, (req.params.id as string)))
    .limit(1);

  if (!conv) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  if (conv.participant1Id !== myId && conv.participant2Id !== myId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({
      conversationId: (req.params.id as string),
      senderId: myId,
      content: text.trim(),
      status: "sent",
    })
    .returning();

  // Bump conversation updatedAt
  await db
    .update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, (req.params.id as string)));

  res.status(201).json({
    message: {
      id: msg.id,
      threadId: msg.conversationId,
      senderId: msg.senderId,
      text: msg.content,
      timestamp: new Date(msg.createdAt).getTime(),
      read: false,
    },
  });
});

// PATCH /api/messages/threads/:id/read — mark all messages in thread as read
router.patch("/threads/:id/read", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, (req.params.id as string)))
    .limit(1);

  if (!conv) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  if (conv.participant1Id !== myId && conv.participant2Id !== myId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Mark all messages NOT sent by me as read
  await db
    .update(messagesTable)
    .set({ status: "read" })
    .where(
      and(
        eq(messagesTable.conversationId, (req.params.id as string)),
        eq(messagesTable.status, "sent"),
        sql`${messagesTable.senderId} != ${myId}`,
      ),
    );

  res.json({ success: true });
});

export default router;
