import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../middlewares/error.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));
router.post("/resume", authenticate, upload.single("resume"), asyncHandler(authController.uploadResume));
router.get("/notifications", authenticate, asyncHandler(authController.notifications));
router.patch("/notifications/:id/read", authenticate, asyncHandler(authController.readNotification));

export default router;
