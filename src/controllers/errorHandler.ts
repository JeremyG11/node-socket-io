import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Use 500 Internal Server Error if status code is not set
  res.status(statusCode).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack, // Hide stack trace in production environment
    },
  });
}
