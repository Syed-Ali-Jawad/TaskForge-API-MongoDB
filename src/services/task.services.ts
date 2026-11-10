import { TaskBody, TaskQueryParams, TaskSortBy } from "../types/task.types";
import AppError from "../error/app-error";
import Task, { TaskPriority, TaskStatus } from "../models/task.model";
import Project from "../models/project.model";
import { WorkspaceMember } from "../models/workspace.model";
import { ProjectStatus, Role, SortOrder } from "../types/common.enums";

const taskFetch = {
  _id: 1,
  title: 1,
  description: 1,
  status: 1,
  priority: 1,
  dueDate: 1,
  createdAt: 1,
  updatedAt: 1,
  assignee: {
    _id: 1,
    name: 1,
  },
  reporter: {
    _id: 1,
    name: 1,
  },
};

const getTasks = async (projectId: string, queries: TaskQueryParams) => {
  const {
    page,
    pageSize,
    search,
    assigneeId: assignedIdsArray = [],
    reporterId: reporterIdsArray = [],
    status: statusArray = [],
    priority: priorityArray = [],
    sortBy = TaskSortBy.CREATED_AT,
    sortOrder = SortOrder.desc,
  } = queries;

  const tasks = await Task.find({
    project: projectId,
    ...(search && { title: { $regex: search, $options: "i" } }),
    ...(assignedIdsArray.length > 0 && { assignee: { $in: assignedIdsArray } }),
    ...(reporterIdsArray.length > 0 && { reporter: { $in: reporterIdsArray } }),
    ...(statusArray.length > 0 && { status: { $in: statusArray } }),
    ...(priorityArray.length > 0 && { priority: { $in: priorityArray } }),
  } as any)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("assignee", "_id name")
    .populate("reporter", "_id name")
    .select(taskFetch);

  return tasks;
};

const getTaskById = async (projectId: string, id: string) => {
  const task = await Task.findOne({
    _id: id,
    project: projectId,
  })
    .populate("assignee", "_id name")
    .populate("reporter", "_id name")
    .populate("comments", "_id comment author createdAt")
    .select({
      ...taskFetch,
      comments: {
        _id: 1,
        comment: 1,
        author: { _id: 1, name: 1 },
        createdAt: 1,
      },
    });

  return task;
};

const addTask = async (projectId: string, userId: string, body: TaskBody) => {
  await checkIfProjectArchived(
    projectId,
    "Archived project can't receive new tasks.",
  );

  const addedTask = await Task.create({
    ...body,
    priority: body.priority as TaskPriority,
    project: projectId,
    reporter: userId,
    status: TaskStatus.TODO,
  });

  return addedTask;
};

const updateTaskById = async (
  userId: string,
  projectId: string,
  taskId: string,
  body: Partial<TaskBody> & { status?: TaskStatus },
) => {
  await checkIfProjectArchived(
    projectId,
    "Archived project can not recieve task updates.",
  );
  const role = await getUserRole(userId, projectId);

  const updatedTask = await Task.findOneAndUpdate(
    {
      _id: taskId,
      project: projectId,
      ...(role === Role.MEMBER
        ? {
            $or: [{ assignee: userId }, { reporter: userId }],
          }
        : {}),
    },
    { $set: body },
    { new: true },
  )
    .populate("assignee", "_id name")
    .populate("reporter", "_id name")
    .select(taskFetch);

  if (!updatedTask) {
    throw new AppError(404, "Task not found or not authorized");
  }

  return updatedTask;
};

const deleteTask = async (userId: string, projectId: string, id: string) => {
  await checkIfProjectArchived(
    projectId,
    "Task of an archived project can not be deleted.",
  );

  const role = await getUserRole(userId, projectId);

  const task = await Task.findOne({
    _id: id,
    project: projectId,
    ...(role === Role.MEMBER
      ? { $or: [{ assignee: userId }, { reporter: userId }] }
      : {}),
  });

  if (!task) {
    throw new AppError(404, "Task not found or not authorized");
  }

  const deletedTask = await Task.findByIdAndDelete(task.id)
    .populate("project", "name")
    .select("title project");

  return deletedTask;
};

export { getTasks, getTaskById, addTask, updateTaskById, deleteTask };

const checkIfProjectArchived = async (projectId: string, error: string) => {
  const project = await Project.findById(projectId).select("status");

  if (project?.status === ProjectStatus.ARCHIVED) {
    throw new AppError(409, error);
  }
};

const getUserRole = async (userId: string, projectId: string) => {
  const project = await Project.findById(projectId).select("workspaceId");

  const userRole = await WorkspaceMember.findOne({
    user: userId,
    workspace: project?.workspace!,
  });
  return userRole?.role;
};
