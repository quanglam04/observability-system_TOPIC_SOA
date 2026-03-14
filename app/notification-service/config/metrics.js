import client from "prom-client";

// Tự động thu thập các metric mặc định (CPU, RAM, Event Loop...)
client.collectDefaultMetrics();

// Counter để đếm tổng số lượng HTTP request bay vào hệ thống
export const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Tổng số lượng HTTP requests",
  labelNames: ["method", "path", "status"],
});

export const metricsRegister = client.register;
