import client from "prom-client";

// Tự động thu thập các metric mặc định (CPU, RAM, Event Loop...)
client.collectDefaultMetrics();

// Counter để đếm tổng số lượng HTTP request bay vào hệ thống
export const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Tổng số lượng HTTP requests",
  labelNames: ["method", "path", "status"],
});

export const dbQueryCounter = new client.Counter({
  name: "db_queries_total",
  help: "Tổng số lượng Database queries",
  labelNames: ["operation", "status"], // operation: 'findOne', 'create', 'findById', ...
});

// Đo thời gian phản hồi (latency) của Database
export const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Thời gian thực thi Database query (giây)",
  labelNames: ["operation"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2], // Các mốc thời gian (0.01s, 0.05s,...)
});

export const metricsRegister = client.register;
