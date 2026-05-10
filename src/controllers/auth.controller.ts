import { Role } from "@prisma/client";
import type {} from "../types/express";
import { ApiError } from "../middlewares/error.middleware";
import { authService } from "../services/auth.service";
import { notificationService } from "../services/notification.service";
import { Request, Response } from "express";

export const authController = {
  register: async (req: Request, res: Response) => {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email, and password are required");
    }

    const result = await authService.register({
      name,
      email,
      password,
      role: role && Role[role as keyof typeof Role] ? role : undefined,
      company,
    });

    res.status(201).json({ success: true, data: result });
  },

  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  },

  me: async (req: Request, res: Response) => {
    const profile = await authService.profile(req.user!.id);
    res.json({ success: true, data: profile });
  },

  uploadResume: async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, "Resume file is required");

    const profile = await authService.uploadResume(req.user!.id, req.file);
    res.json({ success: true, data: profile });
  },

  notifications: async (req: Request, res: Response) => {
    const notifications = await notificationService.list(req.user!.id);
    res.json({ success: true, data: notifications });
  },

  readNotification: async (req: Request, res: Response) => {
    const id = String(req.params.id || "");
    if (!id) throw new ApiError(400, "Notification id is required");

    const notification = await notificationService.markRead(req.user!.id, id);
    res.json({ success: true, data: notification });
  },
};
