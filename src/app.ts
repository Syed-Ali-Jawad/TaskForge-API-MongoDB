import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware";
import appRouter from "./routes/app.routes";
import notFoundMiddleware from "./middlewares/not-found.middleware";

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", appRouter);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

export default createApp;
