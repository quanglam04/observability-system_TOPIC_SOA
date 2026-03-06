import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";
import logger from "./config/logger.js";
import { requestCounter, metricsRegister } from "./config/metrics.js";

const app = express();
app.use(express.json());

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsRegister.contentType);
  res.end(await metricsRegister.metrics());
});

app.use((req, res, next) => {
  if (req.originalUrl !== "/metrics") {
    logger.info("Request", {
      method: req.method,
      path: req.originalUrl,
    });
  }

  res.on("finish", () => {
    if (req.originalUrl !== "/metrics") {
      logger.info("Response", {
        method: req.method,
        path: req.originalUrl,
      });

      requestCounter.inc({
        method: req.method,
        path: req.originalUrl,
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
  console.log("ok");
});
