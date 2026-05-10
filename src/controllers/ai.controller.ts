import { ApiError } from "../middlewares/error.middleware";
import { aiService } from "../services/ai.service";
import { Request, Response } from "express";

export const aiController = {
  score: async (req: Request, res: Response) => {
    const { resumeText, job } = req.body;

    if (!resumeText || !job?.title || !job?.description) {
      throw new ApiError(400, "resumeText and job details are required");
    }

    const result = await aiService.scoreCandidate(resumeText, {
      title: job.title,
      description: job.description,
      skills: Array.isArray(job.skills) ? job.skills : [],
    });

    res.json({ success: true, data: result });
  },
};
