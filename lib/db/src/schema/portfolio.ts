import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const JOB_TYPES = ["editorial", "commercial", "events", "social", "campaign", "film", "runway"] as const;
export type JobType = typeof JOB_TYPES[number];

export const portfolioItemsTable = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  talentId: uuid("talent_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  jobType: text("job_type").notNull(),          // editorial | commercial | events | social | campaign | film | runway
  title: text("title").notNull(),               // e.g. "Nando's Summer Campaign 2025"
  brandCredit: text("brand_credit"),            // e.g. "Nando's South Africa"
  agencyCredit: text("agency_credit"),          // e.g. "Ogilvy JHB"
  shootDate: text("shoot_date"),                // "2025-03", free text (month/year)
  description: text("description"),
  imageUrl: text("image_url"),                  // optional external URL (Instagram, Dropbox, etc.)
  isHighlight: text("is_highlight").default("false"), // pinned to top of profile
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
