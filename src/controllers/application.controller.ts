import { ApplicationStatus } from "@prisma/client";
import type {} from "../types/express";
import { ApiError } from "../middlewares/error.middleware";
import { applicationService } from "../services/application.service";
import { Request, Response } from "express";

export const applicationController = {
  list: async (req: Request, res: Response) => {
    const applications = await applicationService.list({ id: req.user!.id, role: req.user!.role });
    res.json({ success: true, data: applications });
  },

  apply: async (req: Request, res: Response) => {
    const jobId = req.body.jobId || req.params.jobId;
    if (!jobId) throw new ApiError(400, "Job id is required");

    const application = await applicationService.apply(
      req.user!.id,
      { jobId, coverLetter: req.body.coverLetter },
      req.file,
    );

    res.status(201).json({ success: true, data: application });
  },

  updateStatus: async (req: Request, res: Response) => {
    const id = String(req.params.id || "");
    const status = req.body.status?.toUpperCase?.();
    if (!id) throw new ApiError(400, "Application id is required");
    if (!status || !ApplicationStatus[status as keyof typeof ApplicationStatus]) {
      throw new ApiError(400, "Valid application status is required");
    }

    const application = await applicationService.updateStatus(
      { id: req.user!.id, role: req.user!.role },
      id,
      status as ApplicationStatus,
    );

    res.json({ success: true, data: application });
  },
};
