import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/error.middleware";

const router = Router();

router.post("/score", authenticate, asyncHandler(aiController.score));

export default router;
