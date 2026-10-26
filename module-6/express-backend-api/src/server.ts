import { createApp } from "./app.ts";
import { env } from "./config/env.config.ts";
import { logger } from "./lib/logger.ts";

const app = createApp();

app.listen(env.port, () => {
  logger.info(`server is running on port ${env.port}`);
});
