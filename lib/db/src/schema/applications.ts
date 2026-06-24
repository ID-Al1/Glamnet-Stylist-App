import type { InferInsertModel } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";
import { jobsTable } from "./jobs";

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "shortlisted",
  "declined",
]);

export const applicationsTable = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobsTable.id, { onDelete: "cascade" }),
  talentId: uuid("talent_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  message: text("message").notNull().default(""),
  status: applicationStatusEnum("status").notNull().default("pending"),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({
  id: true,
  appliedAt: true,
});

export type Application = typeof applicationsTable.$inferSelect;
export type InsertApplication = InferInsertModel<typeof applicationsTable>;
