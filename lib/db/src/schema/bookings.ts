import type { InferInsertModel } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";
import { teamsTable } from "./teams";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "accepted", "declined", "completed", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  talentId: uuid("talent_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  isHouseCall: boolean("is_house_call").notNull().default(false),
  notes: text("notes").notNull().default(""),
  totalCost: integer("total_cost").notNull().default(0),
  teamId: uuid("team_id").references(() => teamsTable.id, { onDelete: "set null" }),
  agreedRate: integer("agreed_rate"),
  talentRole: text("talent_role"),
  city: text("city"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = InferInsertModel<typeof bookingsTable>;
