import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Verification requests submitted by creators
export const verificationsTable = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  // identity | portfolio | skill | agency
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),                   // admin rejection reason or approval note
  evidenceUrl: text("evidence_url"),      // link to ID scan, portfolio link, etc.
});

// Escrow records — holds payment between booking and completion
export const escrowTable = pgTable("escrow", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull(), // references bookingsTable.id
  clientId: uuid("client_id").notNull().references(() => usersTable.id),
  talentId: uuid("talent_id").notNull().references(() => usersTable.id),
  amountZar: text("amount_zar").notNull(),    // stored as string to avoid float issues
  currency: text("currency").notNull().default("ZAR"),
  status: text("status").notNull().default("held"), // held | released | refunded | disputed
  heldAt: timestamp("held_at").notNull().defaultNow(),
  releasedAt: timestamp("released_at"),
  disputeReason: text("dispute_reason"),
});

// Disputes raised against a booking
export const disputesTable = pgTable("disputes", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull(),
  raisedBy: uuid("raised_by").notNull().references(() => usersTable.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"), // open | resolved | closed
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});
