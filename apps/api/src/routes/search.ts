import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const createExcerpt = (content: string, query: string) => {
  const normalized = content.replace(/\s+/g, " ").trim();
  const index = normalized.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1) {
    return normalized.slice(0, 180);
  }

  const start = Math.max(0, index - 60);
  const end = Math.min(normalized.length, index + 120);
  return normalized.slice(start, end);
};

router.get("/", asyncHandler(async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!q) {
    return res.json({
      results: [],
    });
  }

  const [questions, concepts, counterexamples] = await Promise.all([
    prisma.question.findMany({
      take: 8,
      where: {
        OR: [
          { questionText: { contains: q, mode: "insensitive" } },
          { solution: { is: { content: { contains: q, mode: "insensitive" } } } },
        ],
      },
      include: {
        subject: true,
      },
      orderBy: { year: "desc" },
    }),
    prisma.concept.findMany({
      take: 8,
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { title: "asc" },
    }),
    prisma.counterexample.findMany({
      take: 8,
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { explanation: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return res.json({
    results: [
      ...questions.map((item) => ({
        type: "QUESTION",
        title: `${item.year} ${item.session} • ${item.subject.name}`,
        href: `/questions/${item.slug}`,
        excerpt: createExcerpt(item.questionText, q),
      })),
      ...concepts.map((item) => ({
        type: item.type,
        title: item.title,
        href: `/concepts/${item.slug}`,
        excerpt: createExcerpt(item.content, q),
      })),
      ...counterexamples.map((item) => ({
        type: "COUNTEREXAMPLE",
        title: item.title,
        href: `/counterexamples/${item.slug}`,
        excerpt: createExcerpt(item.explanation, q),
      })),
    ],
  });
}));

export default router;
