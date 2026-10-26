import { pino } from "pino";
import { env } from "../config/env.config.ts";

export const logger = pino({
  level: env.loglevel ?? "info",
  ...(env.isProduction
    ? undefined
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      }),
});
