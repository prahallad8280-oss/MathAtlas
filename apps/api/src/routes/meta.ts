import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/dashboard", async (_req, res) => {
  const [questionCount, conceptCount, counterexampleCount, recentQuestions, recentConcepts, recentCounterexamples] =
    await Promise.all([
      prisma.question.count(),
      prisma.concept.count(),
      prisma.counterexample.count(),
      prisma.question.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subject: true,
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.concept.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      }),
      prisma.counterexample.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true } } },
      }),
    ]);

  return res.json({
    stats: {
      questionCount,
      conceptCount,
      counterexampleCount,
    },
    recentQuestions,
    recentConcepts,
    recentCounterexamples,
  });
});

router.get("/subjects", async (_req, res) => {
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
});

router.get("/years", async (_req, res) => {
  const grouped = await prisma.question.groupBy({
    by: ["year", "session"],
    _count: true,
    orderBy: [{ year: "desc" }, { session: "desc" }],
  });

  return res.json(grouped);
});

router.get("/knowledge-index", async (_req, res) => {
  const [concepts, counterexamples] = await Promise.all([
    prisma.concept.findMany({
      select: { title: true, slug: true, type: true },
      orderBy: { title: "asc" },
    }),
    prisma.counterexample.findMany({
      select: { title: true, slug: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return res.json({
    concepts: concepts.map((item) => ({
      title: item.title,
      href: `/concepts/${item.slug}`,
      type: item.type,
    })),
    counterexamples: counterexamples.map((item) => ({
      title: item.title,
      href: `/counterexamples/${item.slug}`,
      type: "COUNTEREXAMPLE",
    })),
  });
});

export default router;
