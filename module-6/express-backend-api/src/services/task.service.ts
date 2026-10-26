import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types/types.ts";
import { AppError } from "../utils/AppError.ts";

const tasks: Task[] = [];

export async function getAllTasks(): Promise<Task[]> {
  return tasks;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export async function getTaskById(id: string): Promise<Task> {
  const task = tasks.find((t) => t.id);
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return task;
}

export async function updatedTaskById(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const task = await getTaskById(id);

  if (task.completed && input.title !== undefined) {
    throw new AppError(409, "Completed tasks cannot be renamed");
  }

  if (input.title !== undefined) task.title = input.title;
  if (input.completed !== undefined) task.completed = input.completed;

  return task;
}

export async function deleteTask(id: string): Promise<void> {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new AppError(404, "Task not found");
  }
  tasks.splice(index, 1);
}
