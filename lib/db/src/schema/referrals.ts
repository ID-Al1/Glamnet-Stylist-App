import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Each user gets one referral code on signup.
 * usesCount tracks how many people have signed up with it.
 */
export const referralCodesTable = pgTable("referral_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  code: text("code").notNull().unique(),
  usesCount: integer("uses_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Records each time a referred user signs up.
 */
export const referralUsesTable = pgTable("referral_uses", {
  id: uuid("id").defaultRandom().primaryKey(),
  codeId: uuid("code_id").notNull().references(() => referralCodesTable.id, { onDelete: "cascade" }),
  newUserId: uuid("new_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

/**
 * Photographer casting calls — open briefs where models & stylists apply.
 * This is the cold-start flywheel: photographers post first, attracting talent.
 */
export const photographerCastingsTable = pgTable("photographer_castings", {
  id: uuid("id").defaultRandom().primaryKey(),
  photographerId: uuid("photographer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  concept: text("concept").notNull(),          // shoot concept / mood
  location: text("location"),
  shootDate: text("shoot_date"),
  compensation: text("compensation"),          // e.g. "TFP" | "R 500" | "negotiable"
  // Comma-separated role types they need: "model,stylist,makeup_artist"
  rolesNeeded: text("roles_needed").notNull(),
  status: text("status").notNull().default("open"),  // open | filled | closed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

/**
 * Applications to a photographer casting call.
 */
export const castingApplicationsTable = pgTable("casting_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  castingId: uuid("casting_id").notNull().references(() => photographerCastingsTable.id, { onDelete: "cascade" }),
  applicantId: uuid("applicant_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),                // the role they're applying for
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending | accepted | rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
