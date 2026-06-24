import type { InferInsertModel } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";

export const clientTypeEnum = pgEnum("client_type", ["Brand", "Agency", "Private"]);

export const jobsTable = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  clientType: clientTypeEnum("client_type").notNull(),
  brief: text("brief").notNull(),
  type: text("type").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  date: text("date").notNull(),
  deadline: text("deadline").notNull(),
  rate: text("rate").notNull(),
  rateNum: integer("rate_num").notNull().default(0),
  urgent: boolean("urgent").notNull().default(false),
  roles: text("roles").array().notNull(),
  spotsTotal: integer("spots_total").notNull().default(1),
  spotsFilled: integer("spots_filled").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  requirements: text("requirements").array(),
  tags: text("tags").array(),
  postedBy: uuid("posted_by")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({
  id: true,
  createdAt: true,
});

export type Job = typeof jobsTable.$inferSelect;
export type InsertJob = InferInsertModel<typeof jobsTable>;
