import "./config/tracing.js";
import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";
import logger from "./config/logger.js";
import { requestCounter, metricsRegister } from "./config/metrics.js";

const app = express();
app.use(express.json());

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsRegister.contentType);

  // Trích xuất toàn bộ số liệu (RAM, CPU, tổng số request...) đã thu thập được
  // từ bộ nhớ, chuyển nó thành dạng text và trả về.
  res.end(await metricsRegister.metrics());
});

app.use((req, res, next) => {
  // Sự kiện 'finish' sẽ tự động kích hoạt ngay khi server đã xử lý xong logic
  // (ở controller) và chuẩn bị gửi kết quả cuối cùng (JSON) về cho client.
  res.on("finish", () => {
    if (req.originalUrl !== "/metrics") {
      // Kích hoạt biến đếm (tăng lên 1) của thư viện prom-client.
      // Dữ liệu này sẽ được lưu tạm trong RAM và chờ cái API GET /metrics ở trên lấy về về.
      requestCounter.inc({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode.toString(),
      });
    }
  });

  next();
});

app.use("/api/notifications", router);

app.use((req, res) => {
  res.status(404).json({ message: "Không tồn tại đường dẫn" });
});

app.listen(envConfig.PORT, () => {
  console.log(`Notification service chạy tại port ${envConfig.PORT}`);
});
