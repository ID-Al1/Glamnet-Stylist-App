import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Offline / WhatsApp-shareable booking contracts.
 *
 * A contract is generated when a booking is confirmed.
 * It holds all the agreed terms as structured data so we can:
 *   - Render a PDF to share via WhatsApp
 *   - Function as the legal record if there's a dispute
 *   - Work offline (the talent can screenshot / download)
 */
export const contractsTable = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").notNull(),
  clientId: uuid("client_id").notNull().references(() => usersTable.id),
  talentId: uuid("talent_id").notNull().references(() => usersTable.id),

  // Agreed terms — captured at booking confirmation time
  jobTitle: text("job_title").notNull(),
  jobDate: text("job_date").notNull(),
  location: text("location"),
  callTime: text("call_time"),
  agreedRateZar: text("agreed_rate_zar").notNull(),
  usageRights: text("usage_rights"),         // e.g. "1 year digital, South Africa only"
  cancellationPolicy: text("cancellation_policy"),
  additionalTerms: text("additional_terms"),

  // Signature state
  clientSigned: boolean("client_signed").notNull().default(false),
  talentSigned: boolean("talent_signed").notNull().default(false),
  clientSignedAt: timestamp("client_signed_at"),
  talentSignedAt: timestamp("talent_signed_at"),

  // PDF storage — URL to the generated PDF in your file store
  pdfUrl: text("pdf_url"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
