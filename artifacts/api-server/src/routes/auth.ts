import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, count } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, process.env["JWT_SECRET"]!, { expiresIn: "30d" });
}

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, handle, location, specialties } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "name, email, password and role are required" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const derivedHandle = handle ?? `@${name.toLowerCase().replace(/\s+/g, "")}`;

  let isFoundingMember = false;
  if (role === "stylist") {
    const [{ value: stylistCount }] = await db
      .select({ value: count() })
      .from(usersTable)
      .where(eq(usersTable.role, "stylist"));
    isFoundingMember = stylistCount < 50;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      passwordHash,
      role,
      handle: derivedHandle,
      location: location ?? "South Africa",
      available: role === "stylist",
      specialties: specialties ?? null,
      foundingMember: isFoundingMember,
    })
    .returning();

  res.status(201).json({
    token: signToken(user.id, user.email),
    user: sanitizeUser(user),
  });
});

// POST /api/auth/signin
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({
    token: signToken(user.id, user.email),
    user: sanitizeUser(user),
  });
});

// PATCH /api/auth/me/availability — toggle stylist availability
router.patch("/me/availability", requireAuth, async (req, res) => {
  const { available } = req.body;
  if (typeof available !== "boolean") {
    res.status(400).json({ error: "available must be a boolean" });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ available, updatedAt: new Date() })
    .where(eq(usersTable.id, req.auth!.userId))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

// PATCH /api/auth/me/profile — update profile fields
router.patch("/me/profile", requireAuth, async (req, res) => {
  const {
    province, city, dayRate, halfDayRate,
    instantBook, houseCallsEnabled, callOutBase, callOutRate, studioAvailable,
    bio, location,
  } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (province !== undefined) updates["province"] = province;
  if (city !== undefined) updates["city"] = city;
  if (dayRate !== undefined) updates["dayRate"] = dayRate === null ? null : Math.round(Number(dayRate));
  if (halfDayRate !== undefined) updates["halfDayRate"] = halfDayRate === null ? null : Math.round(Number(halfDayRate));
  if (typeof instantBook === "boolean") updates["instantBook"] = instantBook;
  if (typeof houseCallsEnabled === "boolean") updates["houseCallsEnabled"] = houseCallsEnabled;
  if (callOutBase !== undefined) updates["callOutBase"] = callOutBase === null ? null : Math.round(Number(callOutBase));
  if (callOutRate !== undefined) updates["callOutRate"] = callOutRate === null ? null : Math.round(Number(callOutRate));
  if (typeof studioAvailable === "boolean") updates["studioAvailable"] = studioAvailable;
  if (bio !== undefined) updates["bio"] = bio;
  if (location !== undefined) updates["location"] = location;

  const [user] = await db
    .update(usersTable)
    .set(updates as any)
    .where(eq(usersTable.id, req.auth!.userId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.auth!.userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user: sanitizeUser(user) });
});

export default router;
