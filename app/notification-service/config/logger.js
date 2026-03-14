import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createLogger, format, transports } from "winston";
import LokiTransport from "winston-loki";
import { trace, context } from "@opentelemetry/api";

const { combine, timestamp, printf, json } = format;

const logsDir = join(process.cwd(), "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

const traceFormat = format((info) => {
  const span = trace.getActiveSpan();
  if (span) {
    const spanContext = span.spanContext();
    info.traceId = spanContext.traceId;
    info.spanId = spanContext.spanId;
  }
  return info;
});

const logger = createLogger({
  transports: [
    new transports.Console({
      format: combine(
        traceFormat(),
        timestamp({ format: "DD/MM/YYYY HH:mm:ss" }),
        json(),
      ),
    }),

    new transports.File({
      dirname: "logs",
      filename: "server.txt",
      format: combine(
        traceFormat(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, traceId }) => {
          const paddedLevel = level.toUpperCase().padEnd(5);
          return `${timestamp} ${paddedLevel}: ${message} ${traceId ? `[traceId=${traceId}]` : ""}`;
        }),
      ),
    }),

    new LokiTransport({
      host: "http://alloy:3100",
      labels: { service: "notification-service" },
      json: true,
      format: combine(traceFormat(), timestamp(), json()),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error("Loki connection error:", err),
    }),
  ],
});

export default logger;
