import type { InferInsertModel } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const userRoleEnum = pgEnum("user_role", ["client", "stylist", "brand"]);
export const tierEnum = pgEnum("tier", ["New", "Active", "Rising", "Pro", "Elite"]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  handle: text("handle").notNull().unique(),
  location: text("location").notNull().default("South Africa"),
  bio: text("bio").notNull().default(""),
  repScore: integer("rep_score").notNull().default(0),
  jobsCount: integer("jobs_count").notNull().default(0),
  referrals: integer("referrals").notNull().default(0),
  earnings: integer("earnings").notNull().default(0),
  tier: tierEnum("tier").notNull().default("New"),
  verified: boolean("verified").notNull().default(false),
  available: boolean("available").notNull().default(false),
  specialties: text("specialties").array(),
  avatarUrl: text("avatar_url"),
  province: text("province"),
  city: text("city"),
  dayRate: integer("day_rate"),
  halfDayRate: integer("half_day_rate"),
  instantBook: boolean("instant_book").notNull().default(false),
  houseCallsEnabled: boolean("house_calls_enabled").notNull().default(false),
  callOutBase: integer("call_out_base"),
  callOutRate: integer("call_out_rate"),
  studioAvailable: boolean("studio_available").notNull().default(false),
  foundingMember: boolean("founding_member").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = InferInsertModel<typeof usersTable>;
