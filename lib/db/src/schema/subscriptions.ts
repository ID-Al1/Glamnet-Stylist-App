import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Creator Pro subscriptions.
 * GlamNet charges a monthly fee (R 149/mo) for Pro features:
 *   - Unlimited portfolio items (free = 5)
 *   - Priority placement in search
 *   - Verified badge application
 *   - Analytics access
 *   - Direct message priority
 */
export const PRO_PRICE_ZAR = 149;
export const PRO_PLATFORM_FEE_PERCENT = 5;    // 5% on bookings (vs 10% for free tier)
export const FREE_PLATFORM_FEE_PERCENT = 10;  // 10% on bookings for free tier

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  tier: text("tier").notNull().default("free"), // free | pro
  status: text("status").notNull().default("active"), // active | cancelled | expired
  paystackSubscriptionCode: text("paystack_subscription_code"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
