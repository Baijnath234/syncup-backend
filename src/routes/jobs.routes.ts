import { Router } from "express";
import { Role } from "@prisma/client";
import { jobsController } from "../controllers/jobs.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/error.middleware";

const router = Router();

router.get("/", asyncHandler(jobsController.list));
router.get("/meta", jobsController.roles);
router.get("/:id", asyncHandler(jobsController.get));
router.post("/", authenticate, authorize(Role.EMPLOYER, Role.ADMIN), asyncHandler(jobsController.create));
router.patch("/:id", authenticate, authorize(Role.EMPLOYER, Role.ADMIN), asyncHandler(jobsController.update));
router.delete("/:id", authenticate, authorize(Role.EMPLOYER, Role.ADMIN), asyncHandler(jobsController.remove));

export default router;
