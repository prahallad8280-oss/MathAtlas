import { prisma } from "./prisma.js";
import { slugify } from "./slug.js";

export const normalizeSubjectName = (value: string) => value.trim().replace(/\s+/g, " ");

export const ensureUniqueSubjectSlug = async (slug: string, excludeId?: string) => {
  let candidate = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.subject.findFirst({
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

export const findSubjectByName = async (subjectName: string) => {
  const normalized = normalizeSubjectName(subjectName);

  return prisma.subject.findFirst({
    where: {
      name: {
        equals: normalized,
        mode: "insensitive",
      },
    },
  });
};

export const findOrCreateSubjectByName = async (subjectName: string) => {
  const normalized = normalizeSubjectName(subjectName);
  const existing = await findSubjectByName(normalized);

  if (existing) {
    return existing;
  }

  return prisma.subject.create({
    data: {
      name: normalized,
      slug: await ensureUniqueSubjectSlug(slugify(normalized)),
    },
  });
};
