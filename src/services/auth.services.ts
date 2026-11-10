import bcrypt from "bcrypt";
import { signToken } from "../lib/jwt";
import AppError from "../error/app-error";
import User from "../models/user.model";

const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("_id email name password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid password");
  }

  const token = signToken({ userId: user.id });

  const { password: _, ...userWithoutPassword } = user;

  return { ...userWithoutPassword, token };
};

const registerUser = async (email: string, password: string, name: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });
    return { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    throw new AppError(500, "Error registering user");
  }
};

export { loginUser, registerUser };
