import { Schema, model } from "mongoose";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: TaskStatus, default: TaskStatus.TODO },
    priority: {
      type: String,
      enum: TaskPriority,
      default: TaskPriority.MEDIUM,
    },
    dueDate: { type: Date },
    completionDate: { type: Date },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: true },
);

const Task = model("Task", taskSchema);
export default Task;
