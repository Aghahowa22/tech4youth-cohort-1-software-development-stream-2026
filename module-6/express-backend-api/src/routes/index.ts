import { Router } from "express";
import { healthRouter } from "./health.routes.ts";
import { taskRouter } from "./tasks.routes.ts";

export const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/tasks", taskRouter);
