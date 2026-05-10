import { Role } from "@prisma/client";
import { prisma } from "../config/db";

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        bio: true,
        resumeUrl: true,
        createdAt: true,
      },
    }),

  create: (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    company?: string;
  }) =>
    prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
    }),

  updateResume: (id: string, resumeUrl: string, resumeText: string) =>
    prisma.user.update({
      where: { id },
      data: { resumeUrl, resumeText },
    }),
};
