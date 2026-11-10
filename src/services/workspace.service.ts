import mongoose from "mongoose";
import AppError from "../error/app-error";
import { checkAuthorization } from "../lib/utils";
import Workspace, { WorkspaceMember } from "../models/workspace.model";
import Task from "../models/task.model";
import Project from "../models/project.model";
import Comment from "../models/comment.model";
import { Role } from "../types/common.enums";

const createWorkspace = async (userId: string, name: string) => {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // Create workspace
      const workspace = new Workspace({
        name,
        owner: userId,
      });

      await workspace.save({ session });

      // Create owner membership
      const member = new WorkspaceMember({
        user: userId,
        workspace: workspace._id,
        role: "OWNER",
      });

      await member.save({ session });

      // Populate user reference
      const populatedMember = await member.populate<{
        user: { id: string; name: string };
      }>({
        path: "user",
        select: "name",
        options: { session },
      });

      return {
        id: workspace.id,
        name: workspace.name,
        members: [
          {
            user: {
              id: populatedMember.user.id,
              name: populatedMember.user.name,
            },
            role: populatedMember.role,
          },
        ],
      };
    });

    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(409, "A workspace with this name already exists.");
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const getWorkSpacesByUserId = async (userId: string) => {
  const workspaces = await WorkspaceMember.find({
    user: userId,
  })
    .populate<{ workspace: { id: string; name: string } }>(
      "workspace",
      "_id name",
    )
    .select("role workspace");

  const result = workspaces.map(({ role, workspace }) => ({
    id: workspace.id,
    name: workspace.name,
    role,
  }));

  return result;
};

const getWorkSpacesById = async (userId: string, workspaceId: string) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    members: { $elemMatch: { user: userId } },
  })
    .populate<{
      members: Array<{
        role: string;
        user: { name: string };
        userId: string;
      }>;
    }>({
      path: "members",
      select: "user role",
      populate: { path: "user", select: "name" },
    })
    .select("_id name members projects");

  if (!workspace) return workspace;

  return {
    ...workspace,
    members: workspace.members.map((member) => ({
      role: member.role,
      memberName: member.user.name,
      memberId: member.userId,
    })),
  };
};

const updateWorkspaceById = async (
  workspaceId: string,
  userId: string,
  name: string,
) => {
  const updatedWorkspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, members: { $elemMatch: { user: userId } } },
    { $set: { name } },
    { new: true, select: "_id name" },
  );

  return updatedWorkspace;
};

const deleteWorkspace = async (id: string, userId: string) => {
  const session = await mongoose.startSession();
  let deletedWorkspace;
  try {
    await session.withTransaction(async () => {
      const projectsInWorkspace = await Project.find({ workspace: id }).select(
        "_id",
      );
      const tasksInWorkspace = await Task.find({
        project: { $in: projectsInWorkspace.map((p) => p._id) },
      }).select("_id");
      const commentsInWorkspace = await Comment.find({
        task: { $in: tasksInWorkspace.map((t) => t._id) },
      }).select("_id");

      await Comment.deleteMany({
        _id: { $in: commentsInWorkspace.map((c) => c._id) },
      }).session(session);
      await Task.deleteMany({
        _id: { $in: tasksInWorkspace.map((t) => t._id) },
      }).session(session);
      await Project.deleteMany({ workspace: id }).session(session);
      await WorkspaceMember.deleteMany({ workspace: id }).session(session);
      deletedWorkspace = await Workspace.findOneAndDelete({ _id: id }).session(
        session,
      );
    });
  } catch (error) {
    throw new AppError(500, "Failed to delete workspace and its related data");
  } finally {
    await session.endSession();
  }

  return deletedWorkspace;
};

const updateWorkspaceMember = async (
  userId: string,
  workspaceId: string,
  role: Role,
) => {
  const updatedMember = await WorkspaceMember.findOneAndUpdate(
    {
      workspace: workspaceId,
      user: userId,
    },
    {
      $set: { role: role as typeof WorkspaceMember.prototype.role },
    },
  )
    .populate("workspace", "name")
    .select("role workspace");

  return updatedMember;
};

const addWorkspaceMember = async (
  userId: string,
  workspaceId: string,
  role: Role,
) => {
  await checkAuthorization(userId, workspaceId);

  const addedMember = await WorkspaceMember.create({
    user: userId,
    workspace: workspaceId,
    role: role as typeof WorkspaceMember.prototype.role,
  });

  const populatedMember = await addedMember.populate<{
    workspace: { name: string };
  }>("workspace", "name");

  return {
    role: populatedMember.role,
    workspaceName: populatedMember.workspace.name,
  };
};

const getWorkspaceMembers = async (workspaceId: string) => {
  const members = await Workspace.findById(workspaceId)
    .populate<{
      members: Array<{ id: string; role: string; user: { name: string } }>;
    }>("members", "_id role user")
    .select("members");

  const result = members?.members.map(({ id, role, user }) => ({
    id,
    role,
    name: user.name,
  }));

  return result;
};

const deleteMemberFromWorkspace = async (
  workspaceId: string,
  userId: string,
) => {
  await checkAuthorization(userId, workspaceId);

  const deletedMember = await WorkspaceMember.findOneAndDelete({
    workspace: workspaceId,
    user: userId,
  })
    .populate("workspace", "name")
    .populate("user", "name")
    .select("user workspace");

  return deletedMember;
};

export {
  createWorkspace,
  getWorkSpacesByUserId,
  getWorkSpacesById,
  updateWorkspaceById,
  deleteWorkspace,
  updateWorkspaceMember,
  addWorkspaceMember,
  deleteMemberFromWorkspace,
  getWorkspaceMembers,
};
