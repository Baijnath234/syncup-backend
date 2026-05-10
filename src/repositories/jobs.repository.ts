import { JobStatus } from "@prisma/client";
import { prisma } from "../config/db";

export interface JobFilters {
  search?: string;
  location?: string;
  skill?: string;
  status?: JobStatus;
  employerId?: string;
}

export const jobsRepository = {
  list: (filters: JobFilters) =>
    prisma.job.findMany({
      where: {
        status: filters.status,
        employerId: filters.employerId,
        location: filters.location ? { contains: filters.location, mode: "insensitive" } : undefined,
        skills: filters.skill ? { has: filters.skill } : undefined,
        OR: filters.search
          ? [
              { title: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { company: { contains: filters.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        employer: { select: { id: true, name: true, email: true, company: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

  findById: (id: string) =>
    prisma.job.findUnique({
      where: { id },
      include: {
        employer: { select: { id: true, name: true, email: true, company: true } },
        applications: {
          include: { user: { select: { id: true, name: true, email: true, resumeUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),

  create: (data: {
    title: string;
    description: string;
    company: string;
    location?: string;
    salary?: string;
    skills: string[];
    employerId: string;
  }) => prisma.job.create({ data }),

  update: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      company: string;
      location: string;
      salary: string;
      skills: string[];
      status: JobStatus;
    }>,
  ) => prisma.job.update({ where: { id }, data }),

  delete: (id: string) => prisma.job.delete({ where: { id } }),
};
