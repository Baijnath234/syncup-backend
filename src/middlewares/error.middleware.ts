import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const errorCode = (error as Error & { code?: string }).code;
  const isMongoReplicaSetError = errorCode === "P2031";
  const isDatabaseConnectionError =
    error.message === "fetch failed" ||
    error.name === "PrismaClientInitializationError" ||
    error.name === "PrismaClientKnownRequestError";
  const statusCode = error.statusCode || (isDatabaseConnectionError || isMongoReplicaSetError ? 503 : 500);
  const message = isMongoReplicaSetError
    ? "MongoDB must run as a replica set when used with Prisma. Start MongoDB with --replSet and run rs.initiate()."
    : isDatabaseConnectionError
    ? "Database is unavailable. Check DATABASE_URL, make sure MongoDB is running, then run npm run prisma:migrate."
    : error.message || "Internal server error";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
