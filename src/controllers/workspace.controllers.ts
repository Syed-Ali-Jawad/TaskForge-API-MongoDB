import type { Request, Response } from "express";
import {
  addWorkspaceMember,
  createWorkspace,
  deleteMemberFromWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  getWorkSpacesById,
  getWorkSpacesByUserId,
  updateWorkspaceById,
  updateWorkspaceMember,
} from "../services/workspace.service";

const createWorkspaceHandler = async (req: Request, res: Response) => {
  const { name } = req.body;

  const userId = req.userId || "";
  const workspace = await createWorkspace(userId, name);

  return res.status(201).json({ ...workspace });
};

const getWorkspacesHandler = async (req: Request, res: Response) => {
  const userId = req.userId || "";

  const workspaces = await getWorkSpacesByUserId(userId);

  return res.status(200).json({ workspaces });
};

const getWorkspaceByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId || "";

  const workspace = await getWorkSpacesById(userId, id as string);

  return res.status(200).json(workspace);
};

const updateWorkspaceByIdHandler = async (req: Request, res: Response) => {
  const { name } = req.body;
  const id = req.params.id as string;
  const userId = req.userId || "";

  const updatedWorkspace = await updateWorkspaceById(id, userId, name);

  return res.status(200).json(updatedWorkspace);
};

const deleteWorkspaceHandler = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.userId || "";

  const deletedWorkspace = await deleteWorkspace(id, userId);

  return res.status(200).json({
    message: `Workspace (${id}) deleted along with related Projects and Tasks.`,
    deleted: deletedWorkspace,
  });
};

const updatedWorkspaceMemberHandler = async (req: Request, res: Response) => {
  const workspaceId = req.params.id as string;
  const { role } = req.body;
  const userId = req.userId || "";

  const updatedMember = await updateWorkspaceMember(userId, workspaceId, role);

  return res.status(200).json(updatedMember);
};

const joinWorkspaceHandler = async (req: Request, res: Response) => {
  const { role } = req.body;
  const userId = req.userId || "";
  const workspaceId = req.params.id as string;

  const addedMember = await addWorkspaceMember(userId, workspaceId, role);

  return res.status(201).json(addedMember);
};

const addWorkspaceMemberHandler = async (req: Request, res: Response) => {
  const { role, memberId } = req.body;
  const workspaceId = req.params.id as string;

  const addedMember = await addWorkspaceMember(memberId, workspaceId, role);

  return res.status(201).json(addedMember);
};

const leaveWorkspaceHandler = async (req: Request, res: Response) => {
  const workspaceId = req.params.id as string;
  const userId = req.userId || "";

  const deletedMember = await deleteMemberFromWorkspace(workspaceId, userId);

  return res.status(200).json({
    message: `${deletedMember.user.name} removed from members of ${deletedMember.workspace.name}`,
  });
};

const removeWorkspaceMemberHandler = async (req: Request, res: Response) => {
  const workspaceId = req.params.id as string;
  const memberId = req.params.memberId as string;
  
  const deletedMember = await deleteMemberFromWorkspace(workspaceId, memberId);

  return res.status(200).json({
    message: `${deletedMember.user.name} removed from members of ${deletedMember.workspace.name}`,
  });
};

const getWorkspaceMembersHandler = async (req: Request, res: Response) => {
  const workspaceId = req.params.id as string;

  const members = await getWorkspaceMembers(workspaceId);

  return res.status(200).json({ members });
};

export {
  createWorkspaceHandler,
  getWorkspacesHandler,
  getWorkspaceByIdHandler,
  updateWorkspaceByIdHandler,
  deleteWorkspaceHandler,
  updatedWorkspaceMemberHandler,
  joinWorkspaceHandler,
  leaveWorkspaceHandler,
  getWorkspaceMembersHandler,
  addWorkspaceMemberHandler,
  removeWorkspaceMemberHandler,
};
