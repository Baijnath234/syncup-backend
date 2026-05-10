import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { authRepository } from "../repositories/auth.repository";
import { ApiError } from "../middlewares/error.middleware";
import { generateToken } from "../utils/generateToken";
import { extractResumeText } from "../utils/extractResumeText";
import { uploadToS3 } from "../utils/uploadToS3";

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  company?: string | null;
  bio?: string | null;
  resumeUrl?: string | null;
  createdAt?: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company,
  bio: user.bio,
  resumeUrl: user.resumeUrl,
  createdAt: user.createdAt,
});

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    company?: string;
  }) => {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) throw new ApiError(409, "Email is already registered");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await authRepository.create({ ...data, password: hashedPassword });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user: sanitizeUser(user), token };
  },

  login: async (email: string, password: string) => {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new ApiError(401, "Invalid email or password");

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new ApiError(401, "Invalid email or password");

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user: sanitizeUser(user), token };
  },

  profile: async (id: string) => {
    const user = await authRepository.findById(id);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  uploadResume: async (userId: string, file: Express.Multer.File) => {
    const resumeUrl = await uploadToS3(file, "resumes");
    const resumeText = await extractResumeText(file);
    const updated = await authRepository.updateResume(userId, resumeUrl, resumeText);
    return sanitizeUser(updated);
  },
};
