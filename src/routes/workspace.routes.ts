import { Router } from "express";
import authenticate from "../middlewares/authenicate.middleware";
import {
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  deleteMemberSchema,
  joinWorkspaceSchema,
  updateWorkspaceByIdSchema,
  updateWorkspaceMemberSchema,
} from "../validators/workspace.validators";
import validate from "../middlewares/validate.middleware";
import {
  joinWorkspaceHandler,
  createWorkspaceHandler,
  leaveWorkspaceHandler,
  deleteWorkspaceHandler,
  getWorkspaceByIdHandler,
  getWorkspaceMembersHandler,
  getWorkspacesHandler,
  updatedWorkspaceMemberHandler,
  updateWorkspaceByIdHandler,
  addWorkspaceMemberHandler,
  removeWorkspaceMemberHandler,
} from "../controllers/workspace.controllers";
import { paramsIdSchema } from "../validators/common.validators";

const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.post(
  "/",
  validate(createWorkspaceSchema),
  createWorkspaceHandler,
);

workspaceRouter.get("/", getWorkspacesHandler);

workspaceRouter.get("/:id", validate(paramsIdSchema), getWorkspaceByIdHandler);

workspaceRouter.patch(
  "/:id",
  validate(paramsIdSchema),
  validate(updateWorkspaceByIdSchema),
  updateWorkspaceByIdHandler,
);

workspaceRouter.delete(
  "/:id",
  validate(paramsIdSchema),
  deleteWorkspaceHandler,
);

workspaceRouter.get(
  "/:id/members",
  validate(paramsIdSchema),
  getWorkspaceMembersHandler,
);

workspaceRouter.patch(
  "/:id/members",
  validate(paramsIdSchema),
  validate(updateWorkspaceMemberSchema),
  updatedWorkspaceMemberHandler,
);

workspaceRouter.post(
  "/:id/members",
  validate(paramsIdSchema),
  validate(addWorkspaceMemberSchema),
  addWorkspaceMemberHandler,
);

workspaceRouter.post(
  "/:id/join",
  validate(paramsIdSchema),
  validate(joinWorkspaceSchema),
  joinWorkspaceHandler,
);

workspaceRouter.delete(
  "/:id/leave",
  validate(paramsIdSchema),
  leaveWorkspaceHandler,
);

workspaceRouter.delete(
  "/:id/members/:memberId",
  validate(deleteMemberSchema, "params"),
  removeWorkspaceMemberHandler,
);

export default workspaceRouter;
