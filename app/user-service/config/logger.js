import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, json } = format;

const logsDir = join(process.cwd(), "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

const colors = {
  info: "\x1b[32m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
};

const logger = createLogger({
  transports: [
    new transports.Console({
      format: combine(
        timestamp(),
        json()       
      ),
    }),

    new transports.File({
      dirname: "logs",
      filename: "server.txt",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp }) => {
          const paddedLevel = level.toUpperCase().padEnd(5);
          return `${timestamp} ${paddedLevel}: ${message}`;
        }),
      ),
    }),
  ],
});

export default logger;
