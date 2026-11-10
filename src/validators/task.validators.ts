import { z } from "zod";
import {
  paginationSchema,
  paramsIdSchema,
  sortQuerySchema,
} from "./common.validators";
import { TaskSortBy } from "../types/task.types";
import { TaskPriority, TaskStatus } from "../models/task.model";
import { SortOrder } from "../types/common.enums";

const invalidTaskStatusError = {
  error: `Invalid Task Status used. Allowed: ${TaskStatus.DONE}, ${TaskStatus.IN_PROGRESS}, and ${TaskStatus.TODO}`,
};

const invalidTaskPriorityError = {
  error: `Invalid priority used: Allowed: ${TaskPriority.HIGH}, ${TaskPriority.LOW} and ${TaskPriority.MEDIUM}`,
};

const paramsProjectIdSchema = z.object({
  projectId: z.uuid("Invalid Project UUID"),
});

const paramsTaskSchema = paramsProjectIdSchema.and(paramsIdSchema);

const taskSchema = z.object({
  title: z
    .string()
    .min(5, { error: "Task title cant be lesser then 2 characters" })
    .max(20, { error: "Task title cant be lengtheir than 20 characters" })
    .transform((val) => val.trim()),
  description: z
    .string()
    .min(5)
    .max(120)
    .transform((val) => val.trim())
    .optional(),
  priority: z.enum(TaskPriority, invalidTaskPriorityError),
  dueDate: z
    .string()
    .refine((date) => new Date(date) >= new Date(), {
      message: "Due date cannot be in the past",
    })
    .transform((date) => new Date(date)),
  assigneeId: z.uuid("Invalid UUID").optional(),
});

const updateTaskSchema = taskSchema.partial().extend({
  status: z.enum(TaskStatus, invalidTaskStatusError).optional(),
});

const taskQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  assigneeId: z
    .preprocess(
      (value: string) => value.split(","),
      z.array(z.uuid("Invalid UUID")),
    )
    .optional(),
  reporterId: z
    .preprocess(
      (value: string) => value.split(","),
      z.array(z.uuid("Invalid UUID")),
    )
    .optional(),
  status: z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    },
    z.array(z.enum(TaskStatus, invalidTaskStatusError)).optional(),
  ),

  priority: z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      return Array.isArray(value) ? value : [value];
    },
    z.array(z.enum(TaskPriority, invalidTaskPriorityError)).optional(),
  ),
  sortBy: z
    .enum(TaskSortBy, { error: "Sort applied on invalid field" })
    .optional(),
  sortOrder: z
    .enum(SortOrder, { error: "Invalid sort order used." })
    .default(SortOrder.desc),
});

export {
  paramsProjectIdSchema,
  taskSchema,
  updateTaskSchema,
  taskQuerySchema,
  paramsTaskSchema,
};
