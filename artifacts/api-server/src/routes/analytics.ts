/**
 * Platform analytics — network effects metrics.
 *
 * These endpoints power the moat dashboard for internal use and
 * optionally surface aggregate stats to users ("X stylists joined this week").
 *
 * Admin-only routes require ADMIN_SECRET header.
 */
import { Router } from "express";
import { count, desc, sql, gte } from "drizzle-orm";
import {
  db, usersTable, bookingsTable, referralCodesTable, referralUsesTable,
  photographerCastingsTable, castingApplicationsTable,
} from "@workspace/db";

const router = Router();

function requireAdmin(req: any, res: any, next: () => void) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers["x-admin-secret"] !== secret) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

// ─── PUBLIC: platform pulse (non-sensitive aggregate stats) ───────────────────

// GET /api/analytics/pulse — publicly visible social proof numbers
router.get("/pulse", async (_req, res) => {
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [bookingCount] = await db
    .select({ count: count() })
    .from(bookingsTable)
    .where(sql`${bookingsTable.status} IN ('confirmed', 'completed')`);
  const [castingCount] = await db
    .select({ count: count() })
    .from(photographerCastingsTable)
    .where(sql`${photographerCastingsTable.status} = 'open'`);

  res.json({
    totalCreators: Number(userCount?.count ?? 0),
    totalBookings: Number(bookingCount?.count ?? 0),
    openCastingCalls: Number(castingCount?.count ?? 0),
  });
});

// ─── ADMIN: full network metrics ──────────────────────────────────────────────

// GET /api/analytics/growth — weekly signup trend
router.get("/growth", requireAdmin, async (_req, res) => {
  // Signups per week for last 12 weeks
  const rows = await db.execute(sql`
    SELECT
      date_trunc('week', created_at) AS week,
      count(*) AS signups
    FROM users
    WHERE created_at >= now() - interval '12 weeks'
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  res.json({ weeklySignups: rows.rows });
});

// GET /api/analytics/referral-network — k-factor and top referrers
router.get("/referral-network", requireAdmin, async (_req, res) => {
  const [totalUses] = await db.select({ total: count() }).from(referralUsesTable);
  const [totalCodes] = await db.select({ total: count() }).from(referralCodesTable);

  // Top 10 referrers
  const topReferrers = await db
    .select({
      ownerId: referralCodesTable.ownerId,
      code: referralCodesTable.code,
      usesCount: referralCodesTable.usesCount,
    })
    .from(referralCodesTable)
    .orderBy(desc(referralCodesTable.usesCount))
    .limit(10);

  const kFactor = Number(totalCodes?.total ?? 1) > 0
    ? (Number(totalUses?.total ?? 0) / Number(totalCodes?.total ?? 1)).toFixed(2)
    : "0";

  res.json({ kFactor, topReferrers, totalReferrals: totalUses?.total });
});

// GET /api/analytics/bookings-funnel — how many jobs posted → confirmed → completed
router.get("/bookings-funnel", requireAdmin, async (_req, res) => {
  const statuses = ["pending", "confirmed", "completed", "cancelled"];
  const rows = await db.execute(sql`
    SELECT status, count(*) AS count
    FROM bookings
    GROUP BY status
  `);

  const map: Record<string, number> = {};
  for (const row of rows.rows as any[]) {
    map[row.status] = Number(row.count);
  }

  res.json({
    funnel: statuses.map((s) => ({ status: s, count: map[s] ?? 0 })),
  });
});

// GET /api/analytics/casting-adoption — castings posted and applications
router.get("/casting-adoption", requireAdmin, async (_req, res) => {
  const [castings] = await db.select({ total: count() }).from(photographerCastingsTable);
  const [applications] = await db.select({ total: count() }).from(castingApplicationsTable);

  const avgAppsPerCasting = Number(castings?.total ?? 1) > 0
    ? (Number(applications?.total ?? 0) / Number(castings?.total ?? 1)).toFixed(1)
    : "0";

  res.json({
    totalCastings: castings?.total ?? 0,
    totalApplications: applications?.total ?? 0,
    avgApplicationsPerCasting: avgAppsPerCasting,
  });
});

// GET /api/analytics/city-breakdown — where our creators are
router.get("/city-breakdown", requireAdmin, async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT city, count(*) AS count
    FROM users
    WHERE city IS NOT NULL
    GROUP BY city
    ORDER BY count DESC
    LIMIT 20
  `);

  res.json({ cities: rows.rows });
});

export default router;
