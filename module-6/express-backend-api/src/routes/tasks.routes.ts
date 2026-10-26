import { Router } from "express";
import * as taskController from "../controllers/tasks.controller.ts";

export const taskRouter: Router = Router();

taskRouter.get("/", taskController.getAllTasks);
taskRouter.post("/", taskController.createNewTask);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.patch("/:id", taskController.updateTask);
taskRouter.delete("/:id", taskController.deleteTaskById);
