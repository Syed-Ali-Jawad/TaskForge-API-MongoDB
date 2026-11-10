import { Router } from "express";
import authRouter from "./auth.routes";
import workspaceRouter from "./workspace.routes";
import projectRouter from "./project.routes";
import { paramWorkspaceIdSchema } from "../validators/project.validators";
import validate from "../middlewares/validate.middleware";
import taskRouter from "./task.routes";
import { paramsProjectIdSchema } from "../validators/task.validators";
import { paramsTaskId } from "../validators/comment.validators";
import commentRouter from "./comment.routes";
import userRouter from "./user.routes";
import { Request, Response } from "express";

import { swaggerUi, swaggerDocument } from "../config/swagger";

const appRouter = Router();

appRouter.use("/auth", authRouter);

appRouter.get("/health", (_req: Request, res: Response) =>
  res.status(200).json({ message: "API is working fine" }),
);

appRouter.use("/user", userRouter);
appRouter.use("/workspaces", workspaceRouter);
appRouter.use(
  "/workspaces/:workspaceId/projects",
  validate(paramWorkspaceIdSchema),
  projectRouter,
);

appRouter.use(
  "/projects/:projectId/tasks",
  validate(paramsProjectIdSchema),
  taskRouter,
);

appRouter.use("/tasks/:taskId/comments", validate(paramsTaskId), commentRouter);

appRouter.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default appRouter;
