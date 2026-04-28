import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import {
  ensureUniqueSubjectSlug,
  findSubjectByName,
  normalizeSubjectName,
} from "../lib/subjects.js";
import { slugify } from "../lib/slug.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const subjectSchema = z.object({
  name: z.string().min(2).max(80),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return res.json(subjects);
  }),
);

router.post(
  "/",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const parsed = subjectSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid subject payload.", issues: parsed.error.flatten() });
    }

    const normalized = normalizeSubjectName(parsed.data.name);
    const existing = await findSubjectByName(normalized);

    if (existing) {
      const subject = await prisma.subject.findUnique({
        where: { id: existing.id },
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
      });

      return res.json(subject);
    }

    const subject = await prisma.subject.create({
      data: {
        name: normalized,
        slug: await ensureUniqueSubjectSlug(slugify(normalized)),
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return res.status(201).json(subject);
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const subjectId = String(req.params.id);
    const existing = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Subject not found." });
    }

    if (existing._count.questions > 0) {
      return res.status(409).json({
        message: "This subject is already linked to questions. Move or delete those questions first.",
      });
    }

    await prisma.subject.delete({
      where: { id: existing.id },
    });

    return res.status(204).send();
  }),
);

export default router;
