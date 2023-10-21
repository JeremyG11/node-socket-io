import { NextFunction, Request, Response } from "express";

export const withAuthUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  if (!user) {
    res.sendStatus(401); // Unauthenticated
  }
  return next();
};
