import { ApplicationStatus } from "@prisma/client";
import { prisma } from "../config/db";

export const applicationRepository = {
  listForCandidate: (userId: string) =>
    prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    }),

  listForEmployer: (employerId: string) =>
    prisma.application.findMany({
      where: { job: { employerId } },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true, resumeUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

  findById: (id: string) =>
    prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        user: { select: { id: true, name: true, email: true, resumeUrl: true, resumeText: true } },
      },
    }),

  findExisting: (userId: string, jobId: string) =>
    prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    }),

  create: (data: {
    userId: string;
    jobId: string;
    resumeUrl?: string;
    coverLetter?: string;
    aiScore?: number;
    aiSummary?: string;
  }) => prisma.application.create({ data, include: { job: true } }),

  updateStatus: (id: string, status: ApplicationStatus) =>
    prisma.application.update({
      where: { id },
      data: { status },
      include: { job: true, user: { select: { id: true, name: true, email: true } } },
    }),
};
