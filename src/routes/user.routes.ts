import { Router } from "express";
import authenticate from "../middlewares/authenicate.middleware";
import validate from "../middlewares/validate.middleware";
import { paramsIdSchema } from "../validators/common.validators";
import {
  getUserHandler,
  updateUserHandler,
} from "../controllers/user.controllers";
import { updateUserSchema } from "../validators/user.validators";

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/", getUserHandler);

userRouter.patch("/", validate(updateUserSchema), updateUserHandler);
export default userRouter;
