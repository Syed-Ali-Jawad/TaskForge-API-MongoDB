import type { Request, Response } from "express";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../services/comment.services";

const updateCommentHandler = async (req: Request, res: Response) => {
  const { taskId, commentId } = getParams(req.params);
  const { comment } = req.body;

  const updatedComment = await updateComment(
    req.userId,
    taskId,
    commentId,
    comment,
  );

  return res.status(200).json(updatedComment);
};

const addCommentHandler = async (req: Request, res: Response) => {
  const { comment } = req.body;
  const { taskId } = getParams(req.params);
  const authorId = req.userId;

  const addedComment = await addComment(taskId, authorId, comment);

  return res.status(201).json(addedComment);
};

const deleteCommentHandler = async (req: Request, res: Response) => {
  const { taskId, commentId } = getParams(req.params);

  const deletedComment = await deleteComment(req.userId, taskId, commentId);

  return res
    .status(200)
    .json({
      success: true,
      message: `Comment done by "${deletedComment.author.name}" has been deleted.`,
    });
};

export { updateCommentHandler, addCommentHandler, deleteCommentHandler };

const getParams = (params: any) => ({
  taskId: params.taskId as string,
  commentId: params.id as string,
});
