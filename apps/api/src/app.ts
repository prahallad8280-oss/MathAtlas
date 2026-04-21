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

export const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
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

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error." });
});
