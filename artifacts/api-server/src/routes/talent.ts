import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

// South African cities GlamNet currently targets
export const SA_CITIES = [
  "Cape Town",
  "Johannesburg",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "Bloemfontein",
  "East London",
  "Nelspruit",
  "Polokwane",
  "Kimberley",
] as const;

export type SaCity = typeof SA_CITIES[number];

const router = Router();

// GET /api/talent/cities — list of active SA cities
router.get("/cities", (_req, res) => {
  res.json({ cities: SA_CITIES });
});

// GET /api/talent — browse stylist profiles
// Query params: ?province= ?city= ?specialty= ?available= ?search= ?role=
router.get("/", async (req, res) => {
  const { province, city, specialty, available, search, role } = req.query as Record<string, string>;

  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      handle: usersTable.handle,
      location: usersTable.location,
      city: usersTable.city,
      province: usersTable.province,
      bio: usersTable.bio,
      repScore: usersTable.repScore,
      jobsCount: usersTable.jobsCount,
      referrals: usersTable.referrals,
      earnings: usersTable.earnings,
      tier: usersTable.tier,
      verified: usersTable.verified,
      available: usersTable.available,
      specialties: usersTable.specialties,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
      foundingMember: usersTable.foundingMember,
    })
    .from(usersTable)
    .where(eq(usersTable.role, (role as any) ?? "stylist"))
    .orderBy(desc(usersTable.repScore));

  let results: typeof rows = rows;

  if (city) {
    results = results.filter((r: any) =>
      r.city?.toLowerCase() === city.toLowerCase() ||
      r.location?.toLowerCase().includes(city.toLowerCase())
    );
  }
  if (province) {
    results = results.filter((r: any) =>
      r.province?.toLowerCase() === province.toLowerCase() ||
      r.location?.toLowerCase().includes(province.toLowerCase())
    );
  }
  if (specialty) {
    const q = specialty.toLowerCase();
    results = results.filter((r: any) => r.specialties?.some((s: any) => s.toLowerCase().includes(q)));
  }
  if (available === "true") {
    results = results.filter((r: any) => r.available);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r: any) =>
        r.name.toLowerCase().includes(q) ||
        r.handle.toLowerCase().includes(q) ||
        r.bio.toLowerCase().includes(q) ||
        r.specialties?.some((s: any) => s.toLowerCase().includes(q))
    );
  }

  res.json({ talent: results });
});

// GET /api/talent/:id — single stylist profile
router.get("/:id", async (req, res) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      handle: usersTable.handle,
      location: usersTable.location,
      bio: usersTable.bio,
      repScore: usersTable.repScore,
      jobsCount: usersTable.jobsCount,
      referrals: usersTable.referrals,
      earnings: usersTable.earnings,
      tier: usersTable.tier,
      verified: usersTable.verified,
      available: usersTable.available,
      specialties: usersTable.specialties,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
      foundingMember: usersTable.foundingMember,
    })
    .from(usersTable)
    .where(eq(usersTable.id, (req.params.id as string)))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "Talent not found" });
    return;
  }

  res.json({ talent: user });
});

export default router;
