import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import AppError from "../error/app-error";
import { paramsIdSchema } from "../validators/common.validators";
import {
  paramsProjectSchema,
  paramWorkspaceIdSchema,
} from "../validators/project.validators";
import { paramsProjectIdSchema } from "../validators/task.validators";
import { paramsTaskId } from "../validators/comment.validators";

const validate = (
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const targetValue = paramsSchemas.includes(schema) ? "params" : target;
    const result = schema.safeParse(req[targetValue]);

    if (!result.success) {
      return next(new AppError(400, result.error.issues[0].message));
    }

    req[targetValue] = result.data;
    next();
  };
};

export default validate;

const paramsSchemas: ZodSchema[] = [
  paramsIdSchema,
  paramWorkspaceIdSchema,
  paramsProjectIdSchema,
  paramsTaskId,
  paramsProjectSchema,
];
