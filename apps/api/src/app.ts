import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import authRoutes from "./routes/auth.js";
import conceptRoutes from "./routes/concepts.js";
import counterexampleRoutes from "./routes/counterexamples.js";
import metaRoutes from "./routes/meta.js";
import questionRoutes from "./routes/questions.js";
import searchRoutes from "./routes/search.js";
import { config } from "./config.js";
import { prisma } from "./lib/prisma.js";

export const app = express();

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  if (config.clientOrigins.includes(origin)) {
    return true;
  }

  return (
    /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.workers\.dev$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.pages\.dev$/i.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)
  );
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({
      status: "error",
      message: "Database is not reachable from the API service.",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/concepts", conceptRoutes);
app.use("/api/counterexamples", counterexampleRoutes);
app.use("/api/search", searchRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error: Error & { code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  if (error.name.startsWith("Prisma") || error.code?.startsWith("P")) {
    return res.status(503).json({
      message: "Database is temporarily unavailable. Check DATABASE_URL and run Prisma db push.",
    });
  }

  res.status(500).json({ message: error.message || "Internal server error." });
});
