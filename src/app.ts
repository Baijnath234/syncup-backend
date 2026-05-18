import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import jobsRoutes from "./routes/jobs.routes";
import applicationRoutes from "./routes/application.routes";
import aiRoutes from "./routes/ai.routes";

import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { prisma } from "./config/db";

export const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * CORS (Cross-Origin Requests)
 */
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/**
 * Health check + Prisma check
 */
app.get("/health", async (_req, res) => {
  try {
    await prisma.$connect();

    res.json({
      success: true,
      message: "SyncUp backend is running",
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Backend running but DB connection failed",
    });
  }
});

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);

/**
 * Error handlers
 */
app.use(notFoundHandler);
app.use(errorHandler);

export { allowedOrigin };
