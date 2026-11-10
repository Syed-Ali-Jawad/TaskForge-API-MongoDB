import { Schema, model } from "mongoose";

enum ProjectStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

const projectSchema = new Schema({
  name: { type: String, required: true },
  shortKey: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ProjectStatus, default: ProjectStatus.ACTIVE },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
});

const Project = model("Project", projectSchema);
export default Project;
