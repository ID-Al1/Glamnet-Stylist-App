import { Router } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, teamsTable, teamMembersTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

async function buildTeamPayload(team: typeof teamsTable.$inferSelect) {
  const [owner] = await db
    .select({ name: usersTable.name, handle: usersTable.handle })
    .from(usersTable)
    .where(eq(usersTable.id, team.ownerId))
    .limit(1);

  const memberRows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      handle: usersTable.handle,
      avatarUrl: usersTable.avatarUrl,
    })
    .from(teamMembersTable)
    .leftJoin(usersTable, eq(teamMembersTable.talentId, usersTable.id))
    .where(eq(teamMembersTable.teamId, team.id));

  return {
    id: team.id,
    name: team.name,
    description: team.description ?? null,
    dayRate: team.dayRate ?? null,
    isPublic: team.isPublic,
    memberCount: memberRows.length,
    members: memberRows.slice(0, 4),
    ownerName: owner?.name ?? "Unknown",
    ownerHandle: owner?.handle ?? "",
    ownerId: team.ownerId,
    createdAt: new Date(team.createdAt).getTime(),
  };
}

// GET /api/teams — discover all public teams
router.get("/", async (_req, res) => {
  const teams = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.isPublic, true))
    .orderBy(desc(teamsTable.createdAt));

  const payload = await Promise.all(teams.map(buildTeamPayload));
  res.json({ teams: payload });
});

// GET /api/teams/mine — teams owned by the current user
router.get("/mine", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const teams = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.ownerId, myId))
    .orderBy(desc(teamsTable.createdAt));

  const payload = await Promise.all(teams.map(buildTeamPayload));
  res.json({ teams: payload });
});

// POST /api/teams — create a team
router.post("/", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;
  const { name, description, dayRate, memberIds, isPublic } = req.body;

  if (!name?.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const [team] = await db
    .insert(teamsTable)
    .values({
      ownerId: myId,
      name: name.trim(),
      description: description?.trim() ?? null,
      dayRate: dayRate ? Math.round(Number(dayRate)) : null,
      isPublic: isPublic !== false,
    })
    .returning();

  if (Array.isArray(memberIds) && memberIds.length > 0) {
    const validIds = (memberIds as string[]).filter((id) => id !== myId);
    if (validIds.length > 0) {
      await db.insert(teamMembersTable).values(
        validIds.map((talentId) => ({ teamId: team.id, talentId }))
      );
    }
  }

  const payload = await buildTeamPayload(team);
  res.status(201).json({ team: payload });
});

// GET /api/teams/:id — full team detail with all members
router.get("/:id", async (req, res) => {
  const [team] = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, (req.params.id as string)))
    .limit(1);

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  const [[owner], memberRows] = await Promise.all([
    db
      .select({ name: usersTable.name, handle: usersTable.handle, avatarUrl: usersTable.avatarUrl })
      .from(usersTable)
      .where(eq(usersTable.id, team.ownerId))
      .limit(1),
    db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        handle: usersTable.handle,
        avatarUrl: usersTable.avatarUrl,
        role: usersTable.role,
        specialties: usersTable.specialties,
        tier: usersTable.tier,
      })
      .from(teamMembersTable)
      .leftJoin(usersTable, eq(teamMembersTable.talentId, usersTable.id))
      .where(eq(teamMembersTable.teamId, team.id)),
  ]);

  res.json({
    team: {
      id: team.id,
      name: team.name,
      description: team.description ?? null,
      dayRate: team.dayRate ?? null,
      isPublic: team.isPublic,
      memberCount: memberRows.length,
      members: memberRows,
      ownerName: owner?.name ?? "Unknown",
      ownerHandle: owner?.handle ?? "",
      ownerAvatarUrl: owner?.avatarUrl ?? null,
      ownerId: team.ownerId,
      createdAt: new Date(team.createdAt).getTime(),
    },
  });
});

// POST /api/teams/:id/join — join a public team
router.post("/:id/join", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const [team] = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, (req.params.id as string)))
    .limit(1);

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }
  if (!team.isPublic) {
    res.status(403).json({ error: "This team is private" });
    return;
  }
  if (team.ownerId === myId) {
    res.status(400).json({ error: "You are the owner of this team" });
    return;
  }

  const existing = await db
    .select()
    .from(teamMembersTable)
    .where(and(eq(teamMembersTable.teamId, team.id), eq(teamMembersTable.talentId, myId)))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "Already a member" });
    return;
  }

  await db.insert(teamMembersTable).values({ teamId: team.id, talentId: myId });
  const payload = await buildTeamPayload(team);
  res.json({ team: payload });
});

// DELETE /api/teams/:id/leave — leave a team (non-owner)
router.delete("/:id/leave", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const [team] = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, (req.params.id as string)))
    .limit(1);

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }
  if (team.ownerId === myId) {
    res.status(400).json({ error: "Owner cannot leave — delete the team instead" });
    return;
  }

  await db
    .delete(teamMembersTable)
    .where(and(eq(teamMembersTable.teamId, team.id), eq(teamMembersTable.talentId, myId)));

  res.json({ success: true });
});

// DELETE /api/teams/:id — owner deletes their team
router.delete("/:id", requireAuth, async (req, res) => {
  const myId = req.auth!.userId;

  const [team] = await db
    .select()
    .from(teamsTable)
    .where(and(eq(teamsTable.id, (req.params.id as string)), eq(teamsTable.ownerId, myId)))
    .limit(1);

  if (!team) {
    res.status(404).json({ error: "Team not found or not yours" });
    return;
  }

  await db.delete(teamsTable).where(eq(teamsTable.id, (req.params.id as string)));
  res.json({ success: true });
});

export default router;
