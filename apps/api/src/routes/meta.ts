import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();
const VISITOR_VIEW_KEY = "public-visitor-views";

router.get("/dashboard", async (_req, res) => {
  try {
    const [
      questionCount,
      solutionCount,
      conceptCount,
      theoremCount,
      definitionCount,
      resultCount,
      counterexampleCount,
      subjectCount,
      recentQuestions,
      recentConcepts,
      recentCounterexamples,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.solution.count(),
      prisma.concept.count(),
      prisma.concept.count({ where: { type: "THEOREM" } }),
      prisma.concept.count({ where: { type: "DEFINITION" } }),
      prisma.concept.count({ where: { type: "RESULT" } }),
      prisma.counterexample.count(),
      prisma.subject.count(),
      prisma.question.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subject: true,
          author: { select: { id: true, name: true } },
          solution: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
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
        solutionCount,
        conceptCount,
        theoremCount,
        definitionCount,
        resultCount,
        counterexampleCount,
        subjectCount,
      },
      recentQuestions,
      recentConcepts,
      recentCounterexamples,
    });
  } catch (error) {
    console.error("Dashboard query failed", error);

    return res.json({
      stats: {
        questionCount: 0,
        solutionCount: 0,
        conceptCount: 0,
        theoremCount: 0,
        definitionCount: 0,
        resultCount: 0,
        counterexampleCount: 0,
        subjectCount: 0,
      },
      recentQuestions: [],
      recentConcepts: [],
      recentCounterexamples: [],
    });
  }
});

router.get("/subjects", async (_req, res) => {
  try {
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
  } catch (error) {
    console.error("Subjects query failed", error);
    return res.json([]);
  }
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

router.get("/site-stats", async (_req, res) => {
  const visitorMetric = await prisma.siteMetric.findUnique({
    where: { key: VISITOR_VIEW_KEY },
  });

  return res.json({
    visitorViewCount: visitorMetric?.value ?? 0,
  });
});

router.post("/visitor-view", async (_req, res) => {
  const metric = await prisma.siteMetric.upsert({
    where: { key: VISITOR_VIEW_KEY },
    update: {
      value: {
        increment: 1,
      },
    },
    create: {
      key: VISITOR_VIEW_KEY,
      value: 1,
    },
  });

  return res.status(201).json({
    visitorViewCount: metric.value,
  });
});

export default router;
