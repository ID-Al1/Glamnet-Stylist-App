import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const teamsTable = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  dayRate: integer("day_rate"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamMembersTable = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teamsTable.id, { onDelete: "cascade" }),
  talentId: uuid("talent_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});
