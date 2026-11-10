import jwt, { SignOptions } from "jsonwebtoken";
import env from "../config/env";
import AppError from "../error/app-error";

const signToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, env.jwtSecret, options);
  return token;
};

const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded;
  } catch (error) {
    throw new AppError(401, "Invalid or expired token");
  }
};

export { signToken, verifyToken };
