import bcrypt from "bcrypt";
import User from "../models/user.model";

const getUser = async (userId: string) => {
  const user = await User.findById(userId)
    .populate("workspaces.workspace", "name")
    .populate("tasks", "title status dueDate")
    .select("_id name email workspaces tasks");

  return user;
};

const updateUser = async (userId: string, name?: string, password?: string) => {
  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, password: hashedPassword },
    { new: true },
  ).select("_id name email");

  return updatedUser;
};

export { getUser, updateUser };
