import { JobStatus, Role } from "@prisma/client";
import { jobsRepository, JobFilters } from "../repositories/jobs.repository";
import { ApiError } from "../middlewares/error.middleware";
import { redisClient } from "../config/redis";

const cacheKeyForJobs = (filters: JobFilters) => `jobs:${JSON.stringify(filters)}`;
const clearJobsCache = async () => {
  if (!redisClient.isOpen) return;

  const keys = await redisClient.keys("jobs:*");
  if (keys.length) await redisClient.del(keys);
};

export const jobsService = {
  list: async (filters: JobFilters) => {
    const cacheKey = cacheKeyForJobs(filters);

    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const jobs = await jobsRepository.list(filters);

    if (redisClient.isOpen) {
      await redisClient.set(cacheKey, JSON.stringify(jobs), { EX: 60 });
    }

    return jobs;
  },

  get: async (id: string) => {
    const job = await jobsRepository.findById(id);
    if (!job) throw new ApiError(404, "Job not found");
    return job;
  },

  create: async (employerId: string, data: {
    title: string;
    description: string;
    company: string;
    location?: string;
    salary?: string;
    skills?: string[];
  }) => {
    const job = await jobsRepository.create({
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      salary: data.salary,
      skills: data.skills || [],
      employerId,
    });

    await clearJobsCache();
    return job;
  },

  update: async (
    requester: { id: string; role: Role },
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
  ) => {
    const job = await jobsService.get(id);
    if (requester.role !== Role.ADMIN && job.employerId !== requester.id) {
      throw new ApiError(403, "Only the job owner can update this job");
    }

    const updated = await jobsRepository.update(id, data);
    await clearJobsCache();
    return updated;
  },

  remove: async (requester: { id: string; role: Role }, id: string) => {
    const job = await jobsService.get(id);
    if (requester.role !== Role.ADMIN && job.employerId !== requester.id) {
      throw new ApiError(403, "Only the job owner can delete this job");
    }

    await jobsRepository.delete(id);
    await clearJobsCache();
    return { deleted: true };
  },
};
