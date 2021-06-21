import { createLogger, format, transports } from "winston";

const consoleFormat = format.printf((info) => {
  return `[${info.level}] ${info.message}`;
});

const production = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console({
      level: production ? "error" : "silly",
      format: format.combine(format.colorize(), consoleFormat),
    }),
  ],
});

logger.info(
  `Logger configured in ${production ? "production" : "development"} mode`
);

export default logger;
