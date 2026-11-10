import { z } from "zod";
import { paramsIdSchema } from "./common.validators";
import { Role } from "../types/common.enums";

const enumSchema = z.enum(Role, {
  error: `Invalid workspace role, Allowed: ${Role.ADMIN},${Role.MEMBER}, and ${Role.OWNER}`,
});

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(15, "Workspace name must be at most 15 characters"),
});

const updateWorkspaceByIdSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(15, "Workspace name must be at most 15 characters"),
});

const updateWorkspaceMemberSchema = z.object({
  role: enumSchema,
});

const addWorkspaceMemberSchema = z.object({
  role: enumSchema,
  memberId: z.uuid("Inavlid UUID"),
});

const joinWorkspaceSchema = z.object({
  role: enumSchema,
});

const deleteMemberSchema = paramsIdSchema.extend({
  memberId: z.uuid("Invalid Member Id"),
});

export {
  createWorkspaceSchema,
  updateWorkspaceByIdSchema,
  updateWorkspaceMemberSchema,
  addWorkspaceMemberSchema,
  joinWorkspaceSchema,
  deleteMemberSchema,
};
