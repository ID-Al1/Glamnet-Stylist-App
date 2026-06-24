import type { InferInsertModel } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";

export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  participant1Id: uuid("participant1_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  participant2Id: uuid("participant2_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversationsTable.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  status: messageStatusEnum("status").notNull().default("sent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversationsTable.$inferSelect;
export type InsertConversation = InferInsertModel<typeof conversationsTable>;
export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = InferInsertModel<typeof messagesTable>;
