import type { Request, Response, NextFunction } from "express";
import AppError from "../error/app-error";

const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export default errorMiddleware;
