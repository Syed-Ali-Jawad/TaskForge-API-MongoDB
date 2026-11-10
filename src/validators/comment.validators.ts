import { z } from "zod";
import { paramsIdSchema } from "./common.validators";

const paramsTaskId = z.object({
  taskId: z.uuid("Invalid UUID"),
});

const paramsCommentIdSchema = paramsTaskId.and(paramsIdSchema);

const commentSchema = z.object({
  comment: z.string().transform((val) => val.trim()),
});
export { paramsTaskId, commentSchema, paramsCommentIdSchema };
