import { createLogger, format, transports } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const consoleFormat = format.printf((info) => {
  return `[${info.level}] ${info.message}`;
});

const production = process.env.NODE_ENV === 'production';
const projectID = process.env.PROJECT_ID || 'direct-discord-democracy';

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      level: production ? 'error' : 'silly',
      format: format.combine(format.colorize(), consoleFormat),
    }),
  ],
});

if (production) {
  const loggingWinston = new LoggingWinston({ projectId: projectID });
  logger.add(loggingWinston);
}

logger.info(
  `Logger configured in ${production ? 'production' : 'development'} mode`
);

export default logger;
