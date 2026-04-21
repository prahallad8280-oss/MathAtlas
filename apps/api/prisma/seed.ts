import bcrypt from "bcryptjs";
import { ConceptType, ExamSession, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\$+/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

async function main() {
  await prisma.solution.deleteMany();
  await prisma.question.deleteMany();
  await prisma.counterexample.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const authorPassword = await bcrypt.hash("Author@123", 10);

  const [admin, author] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Dr. Asha Raman",
        email: "admin@mathatlas.dev",
        passwordHash: adminPassword,
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Prof. Neel Kant",
        email: "author@mathatlas.dev",
        passwordHash: authorPassword,
        role: Role.AUTHOR,
      },
    }),
  ]);

  const [linearAlgebra, realAnalysis, functionalAnalysis] = await Promise.all([
    prisma.subject.create({
      data: { name: "Linear Algebra", slug: "linear-algebra" },
    }),
    prisma.subject.create({
      data: { name: "Real Analysis", slug: "real-analysis" },
    }),
    prisma.subject.create({
      data: { name: "Functional Analysis", slug: "functional-analysis" },
    }),
  ]);

  const banachSpace = await prisma.concept.create({
    data: {
      title: "Banach Space",
      slug: slugify("Banach Space"),
      type: ConceptType.DEFINITION,
      content:
        "A normed vector space $(X, \\|\\cdot\\|)$ is called a Banach space if every Cauchy sequence in $X$ converges in $X$. This definition is the ambient setting for results such as [[Closed Graph Theorem]] and [[Uniform Boundedness Principle]].",
      authorId: admin.id,
    },
  });

  const closedGraph = await prisma.concept.create({
    data: {
      title: "Closed Graph Theorem",
      slug: slugify("Closed Graph Theorem"),
      type: ConceptType.THEOREM,
      content:
        "If $X$ and $Y$ are Banach spaces and $T : X \\to Y$ is a linear operator with closed graph, then $T$ is continuous. This theorem is often paired with [[Banach Space]] arguments and sharpens intuition for [[Closed but Unbounded Operator Example]].",
      authorId: admin.id,
    },
  });

  const uniformBoundedness = await prisma.concept.create({
    data: {
      title: "Uniform Boundedness Principle",
      slug: slugify("Uniform Boundedness Principle"),
      type: ConceptType.RESULT,
      content:
        "Let $X$ be a Banach space and $Y$ a normed vector space. If a family $\\mathcal{F} \\subseteq \\mathcal{L}(X,Y)$ is pointwise bounded, then it is uniformly bounded on bounded subsets of $X$. Contrast this with [[Pointwise But Not Uniformly Convergent Family]].",
      authorId: author.id,
    },
  });

  await prisma.counterexample.create({
    data: {
      title: "Closed but Unbounded Operator Example",
      slug: slugify("Closed but Unbounded Operator Example"),
      explanation:
        "Consider the differentiation operator $D : C^1[0,1] \\to C[0,1]$ equipped with the sup norm on both domain and codomain. The graph may be closed in a larger ambient setting, but without the completeness hypotheses of [[Closed Graph Theorem]] one cannot conclude boundedness. This shows why the Banach assumption is structural rather than cosmetic.",
      authorId: admin.id,
      relatedConcepts: {
        connect: [{ id: banachSpace.id }, { id: closedGraph.id }],
      },
    },
  });

  await prisma.counterexample.create({
    data: {
      title: "Pointwise But Not Uniformly Convergent Family",
      slug: slugify("Pointwise But Not Uniformly Convergent Family"),
      explanation:
        "The sequence $f_n(x) = x^n$ on $[0,1]$ converges pointwise to a discontinuous limit. The example is not a literal contradiction to [[Uniform Boundedness Principle]], but it is a reliable warning that pointwise information alone rarely upgrades to a global bound without extra hypotheses.",
      authorId: author.id,
      relatedConcepts: {
        connect: [{ id: uniformBoundedness.id }],
      },
    },
  });

  await prisma.question.create({
    data: {
      slug: "2025-june-linear-algebra-rank-nullity-and-eigen-structure",
      questionText:
        "Let $T : \\mathbb{R}^4 \\to \\mathbb{R}^4$ be a linear operator such that the characteristic polynomial is $(\\lambda-1)^2(\\lambda+2)^2$ and the minimal polynomial is $(\\lambda-1)(\\lambda+2)^2$. Determine whether $T$ is diagonalizable and justify your answer.",
      year: 2025,
      session: ExamSession.JUNE,
      subjectId: linearAlgebra.id,
      authorId: admin.id,
      solution: {
        create: {
          content:
            "Because the minimal polynomial contains the repeated factor $(\\lambda+2)^2$, the operator cannot be diagonalizable. A diagonalizable operator has square-free minimal polynomial. The root $\\lambda=1$ appears only to the first power, so the generalized eigenspace issue occurs only at $\\lambda=-2$. The correct conclusion is that $T$ is not diagonalizable.",
          authorId: admin.id,
        },
      },
    },
  });

  await prisma.question.create({
    data: {
      slug: "2024-december-real-analysis-monotone-convergence-question",
      questionText:
        "Suppose $(f_n)$ is an increasing sequence of non-negative measurable functions on $[0,1]$ with pointwise limit $f$. State the relevant theorem and compute $\\int_0^1 f \\, d\\mu$ in terms of $\\int_0^1 f_n \\, d\\mu$.",
      year: 2024,
      session: ExamSession.DECEMBER,
      subjectId: realAnalysis.id,
      authorId: author.id,
      solution: {
        create: {
          content:
            "The relevant result is the Monotone Convergence Theorem. One has $\\int_0^1 f \\, d\\mu = \\lim_{n \\to \\infty} \\int_0^1 f_n \\, d\\mu$. In proof-oriented settings, it is useful to compare how convergence theorems interact with counterexamples such as [[Pointwise But Not Uniformly Convergent Family]].",
          authorId: author.id,
        },
      },
    },
  });

  await prisma.question.create({
    data: {
      slug: "2023-june-functional-analysis-closed-graph-application",
      questionText:
        "Let $T : X \\to Y$ be a linear operator between Banach spaces with closed graph. Which theorem guarantees continuity of $T$? Explain why completeness matters.",
      year: 2023,
      session: ExamSession.JUNE,
      subjectId: functionalAnalysis.id,
      authorId: admin.id,
      solution: {
        create: {
          content:
            "The theorem is [[Closed Graph Theorem]]. Completeness matters because the proof uses Baire category arguments that fail outside Banach spaces. The warning example [[Closed but Unbounded Operator Example]] shows what can go wrong when completeness is dropped.",
          authorId: admin.id,
        },
      },
    },
  });

  console.log("Seeded MathAtlas with demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
