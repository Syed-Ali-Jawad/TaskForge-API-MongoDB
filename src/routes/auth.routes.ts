import { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/auth.controllers";
import { loginSchema, registerSchema } from "../validators/auth.validators";
import validate from "../middlewares/validate.middleware";

const authRouter = Router();

authRouter.post("/login", validate(loginSchema), loginHandler);

authRouter.post("/register", validate(registerSchema), registerHandler);

export default authRouter;
