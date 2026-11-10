import { z } from "zod";
import { paginationSchema, paramsIdSchema } from "./common.validators";
import { ProjectStatus, SortOrder } from "../types/common.enums";

const invalidProjectStatusError = {
  error: `Invalid Project Status. Allowed: ${ProjectStatus.ACTIVE}, ${ProjectStatus.ARCHIVED}, and ${ProjectStatus.INACTIVE}`,
};

const paramWorkspaceIdSchema = z.object({
  workspaceId: z.uuid("Invalid workspace UUID"),
});

const paramsProjectSchema = paramsIdSchema.and(paramWorkspaceIdSchema);

const projectFieldsSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name shall be atleast 2 characters." })
    .max(15, { error: "Name shall be atmost 15 characters" }),
  shortKey: z
    .string()
    .min(2, { error: "Short Key can be miniumum 2 characters." })
    .max(5, { error: "Short Key can be maxiumum 15 characters." })
    .regex(/^[A-Za-z]+$/, "Short key must contain only letters")
    .transform((value) => value.toUpperCase()),
  description: z
    .string()
    .transform((val) => val.trim())
    .optional(),
});

const projectsQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  shortKey: z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    },
    z
      .array(
        z
          .string()
          .regex(/^[A-Za-z]+$/, "Short key must contain only letters")
          .transform((value) => value.toUpperCase()),
      )
      .optional(),
  ),
  status: z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    },
    z.array(z.enum(ProjectStatus, invalidProjectStatusError)).optional(),
  ),
  sortOrder: z
    .enum(SortOrder, { error: "Invalid sort order used." })
    .default(SortOrder.asc),
});

const updateProjectSchema = projectFieldsSchema.partial().extend({
  status: z.enum(ProjectStatus, invalidProjectStatusError).optional(),
});

export {
  paramWorkspaceIdSchema,
  projectFieldsSchema,
  updateProjectSchema,
  projectsQuerySchema,
  paramsProjectSchema,
};
