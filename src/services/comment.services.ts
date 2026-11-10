import Comment from "../models/comment.model";

const updateComment = async (
  userId: string,
  taskId: string,
  commentId: string,
  comment: string,
) => {
  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, taskId, authorId: userId },
    { $set: { comment } },
    { new: true, select: { _id: 1, comment: 1, authorId: 1, updatedAt: 1 } },
  ).populate("authorId", "name");

  return updatedComment;
};

const addComment = async (
  taskId: string,
  authorId: string,
  comment: string,
) => {
  const addedComment = await Comment.create({
    comment,
    task: taskId,
    author: authorId,
  });

  await addedComment.populate("author", "_id name");
  const author = addedComment.author as unknown as { id: string; name: string };
  return {
    id: addedComment.id,
    comment: addedComment.comment,
    author: { id: author.id, name: author.name },
    createdAt: addedComment.createdAt,
  };
};

const deleteComment = async (
  userId: string,
  taskId: string,
  commentId: string,
) => {
  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    task: taskId,
    author: userId,
  })
    .populate("author", "name")
    .select("author");

  return deletedComment;
};

export { updateComment, addComment, deleteComment };
