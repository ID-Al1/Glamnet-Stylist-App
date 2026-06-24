import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Supported African currencies.
 * ZAR = South Africa, NGN = Nigeria, KES = Kenya
 */
export const SUPPORTED_CURRENCIES = ["ZAR", "NGN", "KES", "USD"] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Each row is a Paystack payment initiation.
 * reference = Paystack's unique transaction reference.
 * status mirrors Paystack: pending | success | failed | abandoned
 */
export const paymentsTable = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id"),  // optional — links payment to a booking
  paystackReference: text("paystack_reference").notNull().unique(),
  paystackAccessCode: text("paystack_access_code"),
  amountKobo: integer("amount_kobo").notNull(),  // in smallest currency unit (kobo/cents)
  currency: text("currency").notNull().default("ZAR"),
  status: text("status").notNull().default("pending"), // pending | success | failed | abandoned
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * FX snapshot — rates are fetched and cached daily from ExchangeRate-API.
 * Base currency is ZAR.
 */
export const fxRatesTable = pgTable("fx_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  baseCurrency: text("base_currency").notNull().default("ZAR"),
  targetCurrency: text("target_currency").notNull(),
  rate: text("rate").notNull(),   // stored as string to avoid float precision issues
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});
