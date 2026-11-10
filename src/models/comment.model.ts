import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    comment: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const Comment = model("Comment", commentSchema);
export default Comment;
