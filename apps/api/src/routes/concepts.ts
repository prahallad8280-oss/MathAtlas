import { Router } from "express";
import { ConceptType, Role } from "@prisma/client";
import { z } from "zod";
import { assertKnowledgeTitleAvailable, resolveKnowledgeLinks } from "../lib/content.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import { slugify } from "../lib/slug.js";
import { ensureOwnershipOrAdmin, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const conceptSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  type: z.nativeEnum(ConceptType),
});

const ensureUniqueSlug = async (slug: string, excludeId?: string) => {
  let candidate = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.concept.findFirst({
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

router.get("/", asyncHandler(async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const type =
    req.query.type === "THEOREM" || req.query.type === "DEFINITION" || req.query.type === "RESULT"
      ? (req.query.type as ConceptType)
      : undefined;

  const concepts = await prisma.concept.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { author: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      author: { select: { id: true, name: true } },
      _count: {
        select: {
          relatedCounters: true,
        },
      },
    },
    orderBy: [{ type: "asc" }, { title: "asc" }],
  });

  return res.json(concepts);
}));

router.get("/:slug", asyncHandler(async (req, res) => {
  const slug = String(req.params.slug);
  const concept = await prisma.concept.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, role: true } },
      relatedCounters: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!concept) {
    return res.status(404).json({ message: "Concept not found." });
  }

  const linkedItems = await resolveKnowledgeLinks(prisma, concept.content);

  return res.json({
    ...concept,
    linkedItems,
  });
}));

router.post("/", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), asyncHandler(async (req, res) => {
  const parsed = conceptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid concept payload.", issues: parsed.error.flatten() });
  }

  await assertKnowledgeTitleAvailable(prisma, parsed.data.title, "concept");

  const concept = await prisma.concept.create({
    data: {
      title: parsed.data.title,
      slug: await ensureUniqueSlug(slugify(parsed.data.title)),
      content: parsed.data.content,
      type: parsed.data.type,
      authorId: req.user!.id,
    },
    include: {
      author: { select: { id: true, name: true } },
      relatedCounters: { select: { id: true, title: true, slug: true } },
    },
  });

  return res.status(201).json(concept);
}));

router.put("/:id", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), asyncHandler(async (req, res) => {
  const conceptId = String(req.params.id);
  const parsed = conceptSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid concept payload.", issues: parsed.error.flatten() });
  }

  const existing = await prisma.concept.findUnique({
    where: { id: conceptId },
  });

  if (!existing) {
    return res.status(404).json({ message: "Concept not found." });
  }

  if (!ensureOwnershipOrAdmin(existing.authorId, req.user)) {
    return res.status(403).json({ message: "You can only edit your own concepts unless you are an admin." });
  }

  await assertKnowledgeTitleAvailable(prisma, parsed.data.title, "concept", existing.id);

  const concept = await prisma.concept.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      slug: await ensureUniqueSlug(slugify(parsed.data.title), existing.id),
      content: parsed.data.content,
      type: parsed.data.type,
    },
    include: {
      author: { select: { id: true, name: true } },
      relatedCounters: { select: { id: true, title: true, slug: true } },
    },
  });

  return res.json(concept);
}));

router.delete("/:id", requireAuth, requireRole(Role.ADMIN, Role.AUTHOR), asyncHandler(async (req, res) => {
  const conceptId = String(req.params.id);
  const existing = await prisma.concept.findUnique({
    where: { id: conceptId },
  });

  if (!existing) {
    return res.status(404).json({ message: "Concept not found." });
  }

  if (!ensureOwnershipOrAdmin(existing.authorId, req.user)) {
    return res.status(403).json({ message: "You can only delete your own concepts unless you are an admin." });
  }

  await prisma.concept.delete({
    where: { id: existing.id },
  });

  return res.status(204).send();
}));

export default router;
