import { Router } from "express";
import { Role } from "@prisma/client";
import { applicationController } from "../controllers/application.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", authenticate, asyncHandler(applicationController.list));
router.post("/", authenticate, authorize(Role.CANDIDATE, Role.ADMIN), upload.single("resume"), asyncHandler(applicationController.apply));
router.post("/jobs/:jobId", authenticate, authorize(Role.CANDIDATE, Role.ADMIN), upload.single("resume"), asyncHandler(applicationController.apply));
router.patch("/:id/status", authenticate, authorize(Role.EMPLOYER, Role.ADMIN), asyncHandler(applicationController.updateStatus));

export default router;
