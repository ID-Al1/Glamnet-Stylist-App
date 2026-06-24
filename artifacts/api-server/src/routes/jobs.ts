import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, jobsTable, applicationsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /api/jobs — public job board with optional filters
router.get("/", async (req, res) => {
  const { type, province, role, search } = req.query as Record<string, string>;

  const rows = await db
    .select({
      job: jobsTable,
      posterName: usersTable.name,
      posterHandle: usersTable.handle,
      applicantCount: sql<number>`cast(count(${applicationsTable.id}) as int)`,
    })
    .from(jobsTable)
    .leftJoin(usersTable, eq(jobsTable.postedBy, usersTable.id))
    .leftJoin(applicationsTable, eq(applicationsTable.jobId, jobsTable.id))
    .groupBy(jobsTable.id, usersTable.name, usersTable.handle)
    .orderBy(desc(jobsTable.featured), desc(jobsTable.createdAt));

  let results: typeof rows = rows;

  if (type && type !== "all") {
    results = results.filter((r: any) => r.job.type === type);
  }
  if (province) {
    results = results.filter((r: any) => r.job.province === province);
  }
  if (role) {
    results = results.filter((r: any) => r.job.roles?.includes(role));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r: any) =>
        r.job.title.toLowerCase().includes(q) ||
        r.job.client.toLowerCase().includes(q) ||
        r.job.city.toLowerCase().includes(q),
    );
  }

  res.json({
    jobs: results.map((r: any) => ({
      ...r.job,
      posterName: r.posterName,
      posterHandle: r.posterHandle,
      applicantCount: r.applicantCount,
    })),
  });
});

// GET /api/jobs/mine — jobs posted by the authenticated user
router.get("/mine", requireAuth, async (req, res) => {
  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.postedBy, req.auth!.userId))
    .orderBy(desc(jobsTable.createdAt));

  const jobsWithApplicants = await Promise.all(
    jobs.map(async (job: typeof jobs[number]) => {
      const applicants = await db
        .select({
          application: applicationsTable,
          talentName: usersTable.name,
          talentHandle: usersTable.handle,
          talentRepScore: usersTable.repScore,
          talentTier: usersTable.tier,
          talentLocation: usersTable.location,
          talentSpecialties: usersTable.specialties,
          talentAvatarUrl: usersTable.avatarUrl,
        })
        .from(applicationsTable)
        .leftJoin(usersTable, eq(applicationsTable.talentId, usersTable.id))
        .where(eq(applicationsTable.jobId, job.id))
        .orderBy(desc(applicationsTable.appliedAt));

      return {
        ...job,
        applicants: applicants.map((a: typeof applicants[number]) => ({
          ...a.application,
          name: a.talentName,
          handle: a.talentHandle,
          repScore: a.talentRepScore,
          tier: a.talentTier,
          location: a.talentLocation,
          specialties: a.talentSpecialties,
          avatarUrl: a.talentAvatarUrl,
        })),
      };
    }),
  );

  res.json({ jobs: jobsWithApplicants });
});

// GET /api/jobs/:id — single job detail
router.get("/:id", async (req, res) => {
  const [row] = await db
    .select({
      job: jobsTable,
      posterName: usersTable.name,
      posterHandle: usersTable.handle,
      posterAvatarUrl: usersTable.avatarUrl,
    })
    .from(jobsTable)
    .leftJoin(usersTable, eq(jobsTable.postedBy, usersTable.id))
    .where(eq(jobsTable.id, (req.params.id as string)))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    job: {
      ...row.job,
      posterName: row.posterName,
      posterHandle: row.posterHandle,
      posterAvatarUrl: row.posterAvatarUrl,
    },
  });
});

// POST /api/jobs — create a casting call
router.post("/", requireAuth, async (req, res) => {
  const {
    title, client, clientType, brief, type, province, city,
    date, deadline, rate, rateNum, urgent, roles, spotsTotal,
    requirements, tags,
  } = req.body;

  if (!title || !client || !clientType || !brief || !type || !province || !city || !date || !deadline || !rate || !roles?.length) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [job] = await db
    .insert(jobsTable)
    .values({
      title,
      client,
      clientType,
      brief,
      type,
      province,
      city,
      date,
      deadline,
      rate,
      rateNum: rateNum ?? 0,
      urgent: urgent ?? false,
      featured: false,
      roles,
      spotsTotal: spotsTotal ?? 1,
      spotsFilled: 0,
      requirements: requirements ?? [],
      tags: tags ?? [],
      postedBy: req.auth!.userId,
    })
    .returning();

  res.status(201).json({ job });
});

// DELETE /api/jobs/:id — delete own casting
router.delete("/:id", requireAuth, async (req, res) => {
  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, (req.params.id as string)))
    .limit(1);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.postedBy !== req.auth!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(jobsTable).where(eq(jobsTable.id, (req.params.id as string)));
  res.json({ success: true });
});

// POST /api/jobs/:id/apply — apply to a job
router.post("/:id/apply", requireAuth, async (req, res) => {
  const { role, message } = req.body;

  if (!role) {
    res.status(400).json({ error: "role is required" });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, (req.params.id as string)))
    .limit(1);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.postedBy === req.auth!.userId) {
    res.status(400).json({ error: "Cannot apply to your own casting" });
    return;
  }

  const existing = await db
    .select()
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.jobId, (req.params.id as string)),
        eq(applicationsTable.talentId, req.auth!.userId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Already applied to this job" });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({
      jobId: (req.params.id as string),
      talentId: req.auth!.userId,
      role,
      message: message ?? "",
      status: "pending",
    })
    .returning();

  res.status(201).json({ application });
});

// PATCH /api/jobs/:id/applications/:applicationId/status — shortlist / decline / reset
router.patch("/:id/applications/:applicationId/status", requireAuth, async (req, res) => {
  const { status } = req.body;

  if (!["pending", "shortlisted", "declined"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, (req.params.id as string)))
    .limit(1);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.postedBy !== req.auth!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db
    .update(applicationsTable)
    .set({ status })
    .where(
      and(
        eq(applicationsTable.id, (req.params.applicationId as string)),
        eq(applicationsTable.jobId, (req.params.id as string)),
      ),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json({ application: updated });
});

export default router;
