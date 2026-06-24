import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { bookingsTable } from "./bookings";

export const ratingsTable = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookingsTable.id, { onDelete: "set null" }),
  reviewerId: uuid("reviewer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  revieweeId: uuid("reviewee_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Rating = typeof ratingsTable.$inferSelect;
