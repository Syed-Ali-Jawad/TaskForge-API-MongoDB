import type { Request, Response } from "express";
import {
  addProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProjectById,
} from "../services/project.services";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "../../constants";
import { projectsQuerySchema } from "../validators/project.validators";

const addProjectHandler = async (req: Request, res: Response) => {
  const { workspaceId } = getParams(req.params);

  const addedProject = await addProject(req.userId, workspaceId, req.body);

  return res.status(201).json({
    message: `${addedProject.name}[${addedProject.shortKey}] is added into workspace (${addedProject.workspace.name})`,
  });
};

const getProjectsHandler = async (req: Request, res: Response) => {
  const { workspaceId } = getParams(req.params);

  const query = projectsQuerySchema.parse({
    ...req.query,
    page: Number(req.query.page) || DEFAULT_PAGE,
    pageSize: Number(req.query.pageSize) || DEFAULT_PAGE_SIZE,
  } as Parameters<typeof getProjects>[2]);

  const projects = await getProjects(req.userId, workspaceId, query);

  return res.status(200).json({ projects });
};

const getProjectByIdHandler = async (req: Request, res: Response) => {
  const { workspaceId, projectId } = getParams(req.params);

  const project = await getProjectById(workspaceId, projectId);

  return res.status(200).json(project);
};

const updateProjectByIdHandler = async (req: Request, res: Response) => {
  const { workspaceId, projectId } = getParams(req.params);

  const updatedProject = await updateProjectById(
    req.userId,
    projectId,
    workspaceId,
    req.body,
  );

  return res.status(200).json(updatedProject);
};

const deleteProjectHandler = async (req: Request, res: Response) => {
  const { projectId, workspaceId } = getParams(req.params);

  const deletedProject = await deleteProject(
    req.userId,
    workspaceId,
    projectId,
  );

  return res
    .status(200)
    .json({ message: `${deletedProject.name} has been deleted` });
};

export {
  addProjectHandler,
  getProjectsHandler,
  getProjectByIdHandler,
  updateProjectByIdHandler,
  deleteProjectHandler,
};

const getParams = (params: any) => ({
  workspaceId: params.workspaceId as string,
  projectId: params.id as string,
});
