import type { Request, Response } from "express";
import {
  addTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTaskById,
} from "../services/task.services";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../constants";
import { taskQuerySchema } from "../validators/task.validators";

const getTasksHandler = async (req: Request, res: Response) => {
  const { projectId } = getParams(req.params);

  const queries = taskQuerySchema.parse({
    ...req.query,
    page: Number(req.query.page) || DEFAULT_PAGE,
    pageSize: Number(req.query.pageSize) || DEFAULT_PAGE_SIZE,
  });

  const tasks = await getTasks(projectId, queries);

  return res.status(200).json({ tasks });
};

const getTaskByIdHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = getParams(req.params);

  const task = await getTaskById(projectId, taskId);

  return res.status(200).json(task);
};

const addTaskHandler = async (req: Request, res: Response) => {
  const { projectId } = getParams(req.params);

  const addedTask = await addTask(projectId, req.userId, req.body);

  return res.status(201).json({
    message: "Task created",
    task: addedTask,
  });
};

const updateTaskHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = getParams(req.params);

  const updatedTask = await updateTaskById(
    req.userId,
    projectId,
    taskId,
    req.body,
  );

  return res.status(200).json(updatedTask);
};

const deleteTaskHandler = async (req: Request, res: Response) => {
  const { projectId, taskId } = getParams(req.params);

  const deletedTask = await deleteTask(req.userId, projectId, taskId);

  return res.status(200).json({
    message: `Task "${deletedTask.title}" from project "${deletedTask.project.name}" has been deleted.`,
  });
};

export {
  getTasksHandler,
  getTaskByIdHandler,
  addTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
};

const getParams = (params: any) => ({
  projectId: params.projectId as string,
  taskId: params.id as string,
});
