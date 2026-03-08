import "./config/tracing.js";
import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";
import { metricsRegister } from "./config/metrics.js";

const app = express();

app.use(router);
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsRegister.contentType);
  res.end(await metricsRegister.metrics());
});

app.use((req, res) => {
  res.status(404).json({ message: "Không tồn tại đường dẫn" });
});

app.listen(envConfig.PORT, () => {
  console.log(`API-Gateway chạy tại port ${envConfig.PORT}`);
});
