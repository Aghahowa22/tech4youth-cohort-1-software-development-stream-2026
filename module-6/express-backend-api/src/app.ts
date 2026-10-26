import express from "express";
import type { Express } from "express";
import { notFound } from "./middlewares/notFound.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { requestLogger } from "./middlewares/requestLogger.ts";
import { apiRouter } from "./routes/index.ts";

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use("/v1/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
