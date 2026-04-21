import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { assertKnowledgeTitleAvailable, resolveKnowledgeLinks } from "../lib/content.js";
import { prisma } from "../lib/prisma.js";
import { slugify } from "../lib/slug.js";
import { ensureOwnershipOrAdmin, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const counterexampleSchema = z.object({
  title: z.string().min(3),
  explanation: z.string().min(10),
  relatedConceptIds: z.array(z.string()).default([]),
});

const ensureUniqueSlug = async (slug: string, excludeId?: string) => {
  let candidate = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.counterexample.findFirst({
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

router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const counterexamples = await prisma.counterexample.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { explanation: { contains: q, mode: "insensitive" } },
            { author: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      author: { select: { id: true, name: true } },
      relatedConcepts: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });

  return res.json(counterexamples);
});

router.get("/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  const counterexample = await prisma.counterexample.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, role: true } },
      relatedConcepts: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      },
    },
  });

  if (!counterexample) {
    return res.status(404).json({ message: "Counterexample not found." });
  }

  const linkedItems = await resolveKnowledgeLinks(prisma, counterexample.explanation);

  return res.json({
    ...counterexample,
    linkedItems,
  });
});

router.post("/", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), async (req, res) => {
  const parsed = counterexampleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid counterexample payload.", issues: parsed.error.flatten() });
  }

  await assertKnowledgeTitleAvailable(prisma, parsed.data.title, "counterexample");

  const counterexample = await prisma.counterexample.create({
    data: {
      title: parsed.data.title,
      slug: await ensureUniqueSlug(slugify(parsed.data.title)),
      explanation: parsed.data.explanation,
      authorId: req.user!.id,
      relatedConcepts: {
        connect: parsed.data.relatedConceptIds.map((id) => ({ id })),
      },
    },
    include: {
      author: { select: { id: true, name: true } },
      relatedConcepts: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      },
    },
  });

  return res.status(201).json(counterexample);
});

router.put("/:id", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), async (req, res) => {
  const counterexampleId = String(req.params.id);
  const parsed = counterexampleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid counterexample payload.", issues: parsed.error.flatten() });
  }

  const existing = await prisma.counterexample.findUnique({
    where: { id: counterexampleId },
    include: { relatedConcepts: { select: { id: true } } },
  });

  if (!existing) {
    return res.status(404).json({ message: "Counterexample not found." });
  }

  if (!ensureOwnershipOrAdmin(existing.authorId, req.user)) {
    return res.status(403).json({ message: "You can only edit your own counterexamples unless you are an admin." });
  }

  await assertKnowledgeTitleAvailable(prisma, parsed.data.title, "counterexample", existing.id);

  const counterexample = await prisma.counterexample.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      slug: await ensureUniqueSlug(slugify(parsed.data.title), existing.id),
      explanation: parsed.data.explanation,
      relatedConcepts: {
        set: [],
        connect: parsed.data.relatedConceptIds.map((id) => ({ id })),
      },
    },
    include: {
      author: { select: { id: true, name: true } },
      relatedConcepts: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      },
    },
  });

  return res.json(counterexample);
});

router.delete("/:id", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), async (req, res) => {
  const counterexampleId = String(req.params.id);
  const existing = await prisma.counterexample.findUnique({
    where: { id: counterexampleId },
  });

  if (!existing) {
    return res.status(404).json({ message: "Counterexample not found." });
  }

  if (!ensureOwnershipOrAdmin(existing.authorId, req.user)) {
    return res.status(403).json({ message: "You can only delete your own counterexamples unless you are an admin." });
  }

  await prisma.counterexample.delete({
    where: { id: existing.id },
  });

  return res.status(204).send();
});

export default router;
