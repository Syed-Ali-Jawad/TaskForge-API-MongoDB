import { Schema, model } from "mongoose";

enum Role {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

const workspaceSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

workspaceSchema.index({ name: 1, owner: 1 }, { unique: true });  // Ensure that a user cannot have two workspaces with the same name

const Workspace = model("Workspace", workspaceSchema);
export default Workspace;

const workspaceMemberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  role: { type: String, enum: Role, default: Role.MEMBER },
});

workspaceMemberSchema.index({ user: 1, workspace: 1 }, { unique: true }); // Ensure that a user cannot be added to the same workspace multiple times

export const WorkspaceMember = model("WorkspaceMember", workspaceMemberSchema);
