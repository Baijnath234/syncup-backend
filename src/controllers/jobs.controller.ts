import { JobStatus, Role } from "@prisma/client";
import type {} from "../types/express";
import { ApiError } from "../middlewares/error.middleware";
import { jobsService } from "../services/jobs.service";
import { Request, Response } from "express";

const parseSkills = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((skill) => skill.trim()).filter(Boolean);
  return [];
};

export const jobsController = {
  list: async (req: Request, res: Response) => {
    const status = typeof req.query.status === "string" ? req.query.status.toUpperCase() : undefined;
    const jobs = await jobsService.list({
      search: req.query.search as string | undefined,
      location: req.query.location as string | undefined,
      skill: req.query.skill as string | undefined,
      employerId: req.query.employerId as string | undefined,
      status: status && JobStatus[status as keyof typeof JobStatus] ? (status as JobStatus) : undefined,
    });

    res.json({ success: true, data: jobs });
  },

  get: async (req: Request, res: Response) => {
    const id = String(req.params.id || "");
    if (!id) throw new ApiError(400, "Job id is required");

    const job = await jobsService.get(id);
    res.json({ success: true, data: job });
  },

  create: async (req: Request, res: Response) => {
    const { title, description, company, location, salary } = req.body;

    if (!title || !description || !company) {
      throw new ApiError(400, "Title, description, and company are required");
    }

    const job = await jobsService.create(req.user!.id, {
      title,
      description,
      company,
      location,
      salary,
      skills: parseSkills(req.body.skills),
    });

    res.status(201).json({ success: true, data: job });
  },

  update: async (req: Request, res: Response) => {
    const id = String(req.params.id || "");
    const status = req.body.status?.toUpperCase?.();
    if (!id) throw new ApiError(400, "Job id is required");

    const job = await jobsService.update(
      { id: req.user!.id, role: req.user!.role },
      id,
      {
        title: req.body.title,
        description: req.body.description,
        company: req.body.company,
        location: req.body.location,
        salary: req.body.salary,
        skills: req.body.skills ? parseSkills(req.body.skills) : undefined,
        status: status && JobStatus[status as keyof typeof JobStatus] ? (status as JobStatus) : undefined,
      },
    );

    res.json({ success: true, data: job });
  },

  remove: async (req: Request, res: Response) => {
    const id = String(req.params.id || "");
    if (!id) throw new ApiError(400, "Job id is required");

    const result = await jobsService.remove({ id: req.user!.id, role: req.user!.role }, id);
    res.json({ success: true, data: result });
  },

  roles: (_req: Request, res: Response) => {
    res.json({ success: true, data: { roles: Object.values(Role), statuses: Object.values(JobStatus) } });
  },
};
