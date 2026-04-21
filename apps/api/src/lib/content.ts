import type { PrismaClient } from "@prisma/client";

export const extractWikiTitles = (content: string) => {
  const matches = content.matchAll(/\[\[([^[\]]+)\]\]/g);
  return [...new Set([...matches].map((match) => match[1].trim()).filter(Boolean))];
};

export const resolveKnowledgeLinks = async (
  prisma: PrismaClient,
  content: string,
) => {
  const titles = extractWikiTitles(content);

  if (titles.length === 0) {
    return [];
  }

  const [concepts, counterexamples] = await Promise.all([
    prisma.concept.findMany({
      where: { title: { in: titles } },
      select: { title: true, slug: true, type: true },
    }),
    prisma.counterexample.findMany({
      where: { title: { in: titles } },
      select: { title: true, slug: true },
    }),
  ]);

  const conceptMap = new Map(concepts.map((item) => [item.title, item]));
  const counterMap = new Map(counterexamples.map((item) => [item.title, item]));

  return titles.map((title) => {
    const concept = conceptMap.get(title);
    if (concept) {
      return {
        title,
        kind: "concept" as const,
        label: concept.type,
        href: `/concepts/${concept.slug}`,
      };
    }

    const counterexample = counterMap.get(title);
    if (counterexample) {
      return {
        title,
        kind: "counterexample" as const,
        label: "COUNTEREXAMPLE",
        href: `/counterexamples/${counterexample.slug}`,
      };
    }

    return {
      title,
      kind: "unresolved" as const,
      label: "UNRESOLVED",
      href: null,
    };
  });
};

export const assertKnowledgeTitleAvailable = async (
  prisma: PrismaClient,
  title: string,
  entity: "concept" | "counterexample",
  currentId?: string,
) => {
  const [concept, counterexample] = await Promise.all([
    prisma.concept.findFirst({
      where: {
        title,
        ...(entity === "concept" && currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    }),
    prisma.counterexample.findFirst({
      where: {
        title,
        ...(entity === "counterexample" && currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    }),
  ]);

  if ((entity === "concept" && counterexample) || (entity === "counterexample" && concept)) {
    throw new Error("Knowledge titles must be unique across theorems, definitions, results, and counterexamples.");
  }
};
