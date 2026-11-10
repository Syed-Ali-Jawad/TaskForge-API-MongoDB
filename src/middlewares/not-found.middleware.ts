import type { Request, Response, NextFunction } from "express";
import AppError from "../error/app-error";

const notFoundMiddleware = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  return next(new AppError(404, "Route not found."));
};

export default notFoundMiddleware;
