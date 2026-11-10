import type { Request, Response } from "express";
import { getUser, updateUser } from "../services/user.services";

const getUserHandler = async (req: Request, res: Response) => {
  const userId = req.userId;

  const user = await getUser(userId);

  return res.status(200).json(user);
};

const updateUserHandler = async (req: Request, res: Response) => {
  const userId = req.userId;

  const { name, password } = req.body;

  const updatedUser = await updateUser(userId, name, password);

  return res.status(200).json(updatedUser);
};
export { getUserHandler, updateUserHandler };
