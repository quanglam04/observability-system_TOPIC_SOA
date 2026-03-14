import "./config/tracing.js";
import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";
import logger from "./config/logger.js";
import { requestCounter, metricsRegister } from "./config/metrics.js";
import connectDB from "./config/db.js";

const app = express();

app.use(express.json());

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsRegister.contentType);
  res.end(await metricsRegister.metrics());
});

app.use((req, res, next) => {
  res.on("finish", () => {
    if (req.originalUrl !== "/metrics") {
      requestCounter.inc({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode.toString(),
      });
    }
  });

  next();
});

app.use("/api/users", router);

app.use((req, res) => {
  res.status(404).json({ message: "Không tồn tại đường dẫn" });
});

connectDB();

app.listen(envConfig.PORT, () => {
  console.log(`User service chạy tại port ${envConfig.PORT}`);
});
