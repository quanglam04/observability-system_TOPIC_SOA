import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";
import LokiTransport from "winston-loki";

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
      format: combine(timestamp({ format: "DD/MM/YYYY HH:mm:ss" }), json()),
    }),

    new transports.File({
      dirname: "logs",
      filename: "server.txt",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp }) => {
          const paddedLevel = colors[level].toUpperCase().padEnd(5);
          return `${timestamp} ${paddedLevel}: ${message}`;
        }),
      ),
    }),

    new LokiTransport({
      host: "http://alloy:3100", // alloy nhận log rồi forward sang Loki
      labels: { service: "notification-service" },
      json: true,
      format: combine(timestamp(), json()),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error("Loki connection error:", err),
    }),
  ],
});

export default logger;
