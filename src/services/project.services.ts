import AppError from "../error/app-error";
import { checkAuthorization } from "../lib/utils";
import Project from "../models/project.model";
import { WorkspaceMember } from "../models/workspace.model";
import { ProjectStatus, Role } from "../types/common.enums";
import { ProjectBody, ProjectQueries } from "../types/project.types";


const addProject = async (
  userId: string,
  workspaceId: string,
  body: ProjectBody,
) => {
  await checkAuthorization(userId, workspaceId);

  const addedProject = await Project.create({
    name: body.name,
    shortKey: body.shortKey,
    description: body.description || null,
    workspace: workspaceId,
  });

  const populatedProject = await addedProject.populate<{
    workspace: { name: string };
  }>("workspace", "name");

  return {
    name: addedProject.name,
    shortKey: addedProject.shortKey,
    workspace: { name: populatedProject.workspace.name },
  };
};

const getProjects = async (
  userId: string,
  workspaceId: string,
  queries: ProjectQueries,
) => {
  const userRole = await WorkspaceMember.findOne({
    userId,
    workspace: workspaceId,
  }).select("role");

  const {
    page,
    pageSize,
    search,
    shortKey: shortKeyArray = [],
    status: statusArray = [],
    sortOrder,
  } = queries;

  const allowTasks = userRole?.role !== Role.MEMBER;

  const projects = await Project.find({
    workspace: workspaceId,
    ...(search && { name: { $regex: search, $options: "i" } }),
    ...(shortKeyArray.length > 0 && { shortKey: { $in: shortKeyArray } }),
    ...(statusArray?.length > 0 && { status: { $in: statusArray } }),
  } as any)
    .sort({ name: sortOrder === "asc" ? 1 : -1 })
    .limit(pageSize)
    .skip((page - 1) * pageSize)
    .populate(
      "tasks",
      allowTasks ? "_id title status priority dueDate assignee" : false,
    )
    .select(
      allowTasks
        ? "_id name shortKey description status tasks"
        : "_id name shortKey description status",
    );

  return projects.map((project) => ({ ...project, _id: project.id }));
};

const getProjectById = async (workspaceId: string, projectId: string) => {
  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  })
    .populate("tasks", "_id title status priority dueDate assignee")
    .select("_id name shortKey description status tasks");
  return project;
};

const updateProjectById = async (
  userId: string,
  projectId: string,
  workspaceId: string,
  body: Partial<ProjectBody> & { status?: ProjectStatus },
) => {
  await checkAuthorization(userId, workspaceId);
  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("status");

  if (!body.status && project?.status === ProjectStatus.ARCHIVED) {
    throw new AppError(409, "Archived project can not be edited");
  }

  const updatedProject = await Project.findOneAndUpdate(
    { _id: projectId, workspace: workspaceId },
    { $set: { ...body } },
    { new: true, select: "_id name shortKey description status" },
  );

  return updatedProject;
};

const deleteProject = async (
  userId: string,
  workspaceId: string,
  id: string,
) => {
  await checkAuthorization(userId, workspaceId);

  const deletedProject = await Project.findOneAndDelete({
    _id: id,
    workspace: workspaceId,
  }).select("name");

  return deletedProject;
};

export {
  addProject,
  getProjects,
  getProjectById,
  updateProjectById,
  deleteProject,
};
