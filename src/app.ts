import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import jobsRoutes from "./routes/jobs.routes";
import applicationRoutes from "./routes/application.routes";
import aiRoutes from "./routes/ai.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "SyncUp backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { allowedOrigin };
