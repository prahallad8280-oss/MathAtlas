import { Router } from "express";
import { ExamSession, Role } from "@prisma/client";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import { resolveKnowledgeLinks } from "../lib/content.js";
import { slugify } from "../lib/slug.js";
import { ensureOwnershipOrAdmin, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const questionSchema = z.object({
  questionText: z.string().min(10),
  year: z.coerce.number().int().min(1990).max(2100),
  session: z.nativeEnum(ExamSession),
  subjectName: z.string().min(2),
  solutionContent: z.string().min(10),
});

const buildQuestionSlug = (questionText: string, year: number, session: ExamSession, subjectName: string) => {
  const stem = slugify(questionText).split("-").slice(0, 8).join("-");
  return `${year}-${session.toLowerCase()}-${slugify(subjectName)}-${stem}`;
};

const ensureUniqueQuestionSlug = async (
  slug: string,
  excludeId?: string,
) => {
  let candidate = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.question.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${slug}-${counter}`;
  }
};

const upsertSubject = async (subjectName: string) => {
  const normalized = subjectName.trim();
  const slug = slugify(normalized);

  return prisma.subject.upsert({
    where: { name: normalized },
    update: { slug },
    create: { name: normalized, slug },
  });
};

router.get("/", asyncHandler(async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const subject = typeof req.query.subject === "string" ? req.query.subject.trim() : "";
  const year = typeof req.query.year === "string" ? Number.parseInt(req.query.year, 10) : undefined;
  const session =
    req.query.session === "JUNE" || req.query.session === "DECEMBER"
      ? (req.query.session as ExamSession)
      : undefined;

  const questions = await prisma.question.findMany({
    where: {
      ...(Number.isFinite(year) ? { year } : {}),
      ...(session ? { session } : {}),
      ...(subject ? { subject: { slug: subject } } : {}),
      ...(q
        ? {
            OR: [
              { questionText: { contains: q, mode: "insensitive" } },
              { solution: { is: { content: { contains: q, mode: "insensitive" } } } },
              { author: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      subject: true,
      author: { select: { id: true, name: true } },
      solution: { select: { id: true, content: true, createdAt: true, updatedAt: true } },
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  return res.json(questions);
}));

router.get("/:slug", asyncHandler(async (req, res) => {
  const slug = String(req.params.slug);
  const question = await prisma.question.findUnique({
    where: { slug },
    include: {
      subject: true,
      author: { select: { id: true, name: true, role: true } },
      solution: {
        include: {
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found." });
  }

  const linkedItems = await resolveKnowledgeLinks(
    prisma,
    `${question.questionText}\n${question.solution?.content ?? ""}`,
  );

  return res.json({
    ...question,
    linkedItems,
  });
}));

router.post("/", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), asyncHandler(async (req, res) => {
  const parsed = questionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid question payload.", issues: parsed.error.flatten() });
  }

  const subject = await upsertSubject(parsed.data.subjectName);
  const baseSlug = buildQuestionSlug(
    parsed.data.questionText,
    parsed.data.year,
    parsed.data.session,
    parsed.data.subjectName,
  );
  const slug = await ensureUniqueQuestionSlug(baseSlug);

  const question = await prisma.question.create({
    data: {
      slug,
      questionText: parsed.data.questionText,
      year: parsed.data.year,
      session: parsed.data.session,
      subjectId: subject.id,
      authorId: req.user!.id,
      solution: {
        create: {
          content: parsed.data.solutionContent,
          authorId: req.user!.id,
        },
      },
    },
    include: {
      subject: true,
      author: { select: { id: true, name: true } },
      solution: true,
    },
  });

  return res.status(201).json(question);
}));

router.put("/:id", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), asyncHandler(async (req, res) => {
  const questionId = String(req.params.id);
  const parsed = questionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid question payload.", issues: parsed.error.flatten() });
  }

  const existing = await prisma.question.findUnique({
    where: { id: questionId },
    include: { solution: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Question not found." });
  }

  if (!ensureOwnershipOrAdmin(existing.authorId, req.user)) {
    return res.status(403).json({ message: "You can only edit your own questions unless you are an admin." });
  }

  const subject = await upsertSubject(parsed.data.subjectName);
  const baseSlug = buildQuestionSlug(
    parsed.data.questionText,
    parsed.data.year,
    parsed.data.session,
    parsed.data.subjectName,
  );
  const slug = await ensureUniqueQuestionSlug(baseSlug, existing.id);

  const question = await prisma.question.update({
    where: { id: existing.id },
    data: {
      slug,
      questionText: parsed.data.questionText,
      year: parsed.data.year,
      session: parsed.data.session,
      subjectId: subject.id,
      solution: existing.solution
        ? {
            update: {
              content: parsed.data.solutionContent,
              authorId: req.user!.id,
            },
          }
        : {
            create: {
              content: parsed.data.solutionContent,
              authorId: req.user!.id,
            },
          },
    },
    include: {
      subject: true,
      author: { select: { id: true, name: true } },
      solution: true,
    },
  });

  return res.json(question);
}));

router.delete("/:id", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), asyncHandler(async (req, res) => {
  const questionId = String(req.params.id);
  const existing = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, authorId: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Question not found." });
  }

  if (!ensureOwnershipOrAdmin(existing.authorId, req.user)) {
    return res.status(403).json({ message: "You can only delete your own questions unless you are an admin." });
  }

  await prisma.question.delete({
    where: { id: existing.id },
  });

  return res.status(204).send();
}));

export default router;
