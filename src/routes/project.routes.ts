import { Router } from "express";
import {
  projectsQuerySchema,
  projectFieldsSchema,
  updateProjectSchema,
  paramWorkspaceIdSchema,
  paramsProjectSchema,
} from "../validators/project.validators";
import validate from "../middlewares/validate.middleware";
import {
  addProjectHandler,
  deleteProjectHandler,
  getProjectByIdHandler,
  getProjectsHandler,
  updateProjectByIdHandler,
} from "../controllers/project.controllers";
import authenticate from "../middlewares/authenicate.middleware";

const projectRouter = Router({ mergeParams: true });

projectRouter.use(authenticate);

projectRouter.post("/", validate(projectFieldsSchema), addProjectHandler);

projectRouter.get(
  "/",
  validate(projectsQuerySchema, "query"),
  getProjectsHandler,
);

projectRouter.get(
  "/:id",
  validate(paramsProjectSchema),
  getProjectByIdHandler,
);

projectRouter.patch(
  "/:id",
  validate(paramsProjectSchema),
  validate(updateProjectSchema),
  updateProjectByIdHandler,
);

projectRouter.delete(
  "/:id",
  validate(paramsProjectSchema),
  deleteProjectHandler,
);

export default projectRouter;
