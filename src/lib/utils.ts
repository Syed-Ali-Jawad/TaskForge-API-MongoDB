import AppError from "../error/app-error";
import { WorkspaceMember } from "../models/workspace.model";
import { Role } from "../types/common.enums";

export const checkAuthorization = async (
  userId: string,
  workspaceId: string,
) => {
  const userRole = await WorkspaceMember.findOne({
    userId,
    workspace: workspaceId,
  }).select("role");

  if (userRole?.role === Role.MEMBER) {
    throw new AppError(403, "Forbidden");
  }
};
