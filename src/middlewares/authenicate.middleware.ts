import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import AppError from "../error/app-error";

interface JwtPayload {
  userId: string;
}

const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(
      new AppError(401, "Unauthorized: No Authorziation header passed"),
    );
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Unauthorized: No token passed"));
  }

  const decoded = verifyToken(token) as JwtPayload;

  req.userId = decoded.userId;

  next();
};

export default authenticate;
