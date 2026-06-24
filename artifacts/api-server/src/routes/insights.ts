/**
 * Career insights & rate benchmarking.
 *
 * Data is derived from completed bookings in the platform:
 *   - What is the average rate for a given role/city?
 *   - How does my rate compare to others?
 *   - Which job types get the most bookings?
 *
 * No external AI model is needed — the "AI" here is aggregate maths
 * on real platform data, which is the authentic moat.
 */
import { Router } from "express";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { db, bookingsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// ─── PUBLIC: rate benchmarks ──────────────────────────────────────────────────

/**
 * GET /api/insights/rates?role=model&city=Cape+Town
 * Returns aggregate stats for a role (optionally filtered by city).
 * Only uses confirmed / completed bookings to keep data meaningful.
 */
router.get("/rates", async (req, res) => {
  const { role, city } = req.query as { role?: string; city?: string };

  // Build the base query across bookings joined to talent profiles
  // We approximate "rate" as bookings.budgetMin (stored on the job posting)
  // In a v2 we would store per-booking agreed rate.
  const rows = await db
    .select({
      avgRate: avg(bookingsTable.agreedRate),
      bookingCount: count(bookingsTable.id),
    })
    .from(bookingsTable)
    .where(
      sql`${bookingsTable.status} IN ('confirmed', 'completed')
          ${role ? sql`AND ${bookingsTable.talentRole} = ${role}` : sql``}
          ${city ? sql`AND ${bookingsTable.city} = ${city}` : sql``}`
    )
    .limit(1);

  const stat = rows[0];
  res.json({
    role: role ?? "all",
    city: city ?? "all",
    avgRateZar: stat?.avgRate ? Math.round(parseFloat(String(stat.avgRate))) : null,
    bookingCount: Number(stat?.bookingCount ?? 0),
    note: "Based on confirmed/completed bookings on GlamNet",
  });
});

/**
 * GET /api/insights/top-roles
 * Returns the roles with the most bookings on the platform — useful for
 * showing a talent which direction demand is flowing.
 */
router.get("/top-roles", async (_req, res) => {
  const rows = await db
    .select({
      role: bookingsTable.talentRole,
      bookingCount: count(bookingsTable.id),
    })
    .from(bookingsTable)
    .where(sql`${bookingsTable.status} IN ('confirmed', 'completed')`)
    .groupBy(bookingsTable.talentRole)
    .orderBy(sql`count(${bookingsTable.id}) DESC`)
    .limit(10);

  res.json({ topRoles: rows });
});

// ─── AUTHENTICATED: personal career insights ──────────────────────────────────

/**
 * GET /api/insights/mine
 * Returns a personalised snapshot:
 *   - Total bookings (confirmed + completed)
 *   - Average agreed rate
 *   - Most frequent client / job type
 *   - Rate vs platform average for their role
 */
router.get("/mine", requireAuth, async (req, res) => {
  const userId = req.auth!.userId;

  // Get the talent's role from their user record
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  // Personal booking stats
  const [personal] = await db
    .select({
      totalBookings: count(bookingsTable.id),
      avgRate: avg(bookingsTable.agreedRate),
    })
    .from(bookingsTable)
    .where(
      sql`(${bookingsTable.talentId} = ${userId} OR ${bookingsTable.clientId} = ${userId})
          AND ${bookingsTable.status} IN ('confirmed', 'completed')`
    );

  // Platform average for same role
  const myRole = (user as any).role ?? null;
  const [platformAvg] = await db
    .select({ avgRate: avg(bookingsTable.agreedRate) })
    .from(bookingsTable)
    .where(
      sql`${bookingsTable.status} IN ('confirmed', 'completed')
          ${myRole ? sql`AND ${bookingsTable.talentRole} = ${myRole}` : sql``}`
    );

  const myAvg = personal?.avgRate ? parseFloat(String(personal.avgRate)) : null;
  const platformAvgVal = platformAvg?.avgRate ? parseFloat(String(platformAvg.avgRate)) : null;

  const rateVsAverage =
    myAvg && platformAvgVal
      ? Math.round(((myAvg - platformAvgVal) / platformAvgVal) * 100)
      : null;

  // Recent 5 bookings
  const recent = await db
    .select()
    .from(bookingsTable)
    .where(
      sql`(${bookingsTable.talentId} = ${userId} OR ${bookingsTable.clientId} = ${userId})`
    )
    .orderBy(desc(bookingsTable.createdAt))
    .limit(5);

  res.json({
    totalBookings: Number(personal?.totalBookings ?? 0),
    avgRateZar: myAvg ? Math.round(myAvg) : null,
    platformAvgRateZar: platformAvgVal ? Math.round(platformAvgVal) : null,
    rateVsPlatformPercent: rateVsAverage,
    role: myRole,
    recentBookings: recent,
  });
});

export default router;
