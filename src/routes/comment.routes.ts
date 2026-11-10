import { Router } from "express";
import authenticate from "../middlewares/authenicate.middleware";
import validate from "../middlewares/validate.middleware";
import {
  commentSchema,
  paramsCommentIdSchema,
  paramsTaskId,
} from "../validators/comment.validators";
import {
  addCommentHandler,
  deleteCommentHandler,
  updateCommentHandler,
} from "../controllers/comment.controllers";
import { paramsIdSchema } from "../validators/common.validators";

const commentRouter = Router({ mergeParams: true });

commentRouter.use(authenticate);

commentRouter.patch(
  "/:id",
  validate(paramsCommentIdSchema, "params"),
  validate(commentSchema),
  updateCommentHandler,
);

commentRouter.post(
  "/",
  validate(paramsTaskId, "params"),
  validate(commentSchema),
  addCommentHandler,
);

commentRouter.delete("/:id", validate(paramsIdSchema), deleteCommentHandler);

export default commentRouter;
