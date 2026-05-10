import { ApplicationStatus, Role } from "@prisma/client";
import { applicationRepository } from "../repositories/application.repository";
import { jobsRepository } from "../repositories/jobs.repository";
import { ApiError } from "../middlewares/error.middleware";
import { uploadToS3 } from "../utils/uploadToS3";
import { extractResumeText } from "../utils/extractResumeText";
import { aiService } from "./ai.service";
import { notificationService } from "./notification.service";

export const applicationService = {
  list: (requester: { id: string; role: Role }) => {
    if (requester.role === Role.EMPLOYER) return applicationRepository.listForEmployer(requester.id);
    return applicationRepository.listForCandidate(requester.id);
  },

  apply: async (
    userId: string,
    data: { jobId: string; coverLetter?: string },
    file?: Express.Multer.File,
  ) => {
    const job = await jobsRepository.findById(data.jobId);
    if (!job) throw new ApiError(404, "Job not found");
    if (job.status !== "OPEN") throw new ApiError(400, "This job is closed");

    const existing = await applicationRepository.findExisting(userId, data.jobId);
    if (existing) throw new ApiError(409, "You already applied for this job");

    let resumeUrl: string | undefined;
    let resumeText = "";
    if (file) {
      resumeUrl = await uploadToS3(file, "resumes");
      resumeText = await extractResumeText(file);
    }

    const aiResult = await aiService.scoreCandidate(resumeText, job);
    const application = await applicationRepository.create({
      userId,
      jobId: data.jobId,
      coverLetter: data.coverLetter,
      resumeUrl,
      aiScore: aiResult.score,
      aiSummary: aiResult.summary,
    });

    await notificationService.create({
      userId: job.employerId,
      title: "New application",
      message: `A candidate applied for ${job.title}.`,
    });

    return application;
  },

  updateStatus: async (
    requester: { id: string; role: Role },
    applicationId: string,
    status: ApplicationStatus,
  ) => {
    const application = await applicationRepository.findById(applicationId);
    if (!application) throw new ApiError(404, "Application not found");

    if (requester.role !== Role.ADMIN && application.job.employerId !== requester.id) {
      throw new ApiError(403, "Only the employer can update this application");
    }

    const updated = await applicationRepository.updateStatus(applicationId, status);
    await notificationService.create({
      userId: updated.userId,
      title: "Application updated",
      message: `Your application for ${updated.job.title} is now ${updated.status}.`,
    });

    return updated;
  },
};
