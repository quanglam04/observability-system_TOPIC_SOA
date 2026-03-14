import express from "express";
import gatewayController from "../controllers/index.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import envConfig from "../config/config.js";
import logger from "../config/logger.js";
import { requestCounter, metricsRegister } from "../config/metrics.js";
/**
 * Định nghĩa các route trong này -> gọi hàm controller để xử lý
 */

const router = express.Router();

router.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsRegister.contentType);
  res.end(await metricsRegister.metrics());
});

router.use((req, res, next) => {
  if (req.originalUrl !== "/metrics") {
    logger.info("Gọi vào gateway", {
      method: req.method,
      path: req.originalUrl,
    });
  }

  res.on("finish", () => {
    if (req.originalUrl !== "/metrics") {
      // Tăng biến đếm request lên 1, phân loại theo method, đường dẫn
      requestCounter.inc({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode.toString(),
      });
    }
  });
  next();
});
/**
 * Giải thích đoạn này:
 * Client gọi đến http://localhost:8000/api/user/test
 * Trước khi vào gateway, express strip "/api/users". Cái này là cơ chế của nó
 * Gateway chỉ nhận được /test
 * Sửa path trước khi forward: từ /test -> /api/users/test (nó là cái dòng pathRewrite ở dưới)
 * gateway forward đến http://localhost:8002/api/user/test
 */
router.use(
  envConfig.USER_SERVICE_BASE_API,
  createProxyMiddleware({
    target: envConfig.USER_SERVICE_HOST,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/users/" },
    on: {
      proxyReq: (proxyReq, req) => {},
      proxyRes: (proxyRes, req, res) => {},
      error: (err, req, res) => {
        logger.error(`Lỗi Gateway proxy: ${err.stack || err}`, {
          method: req.method,
          path: req.originalUrl,
          errorDetail: err.stack,
        });
        res.status(502).json({ error: "Bad Gateway", detail: err.stack });
      },
    },
  }),
);

router.use(
  envConfig.NOTIFICATION_SERVICE_BASE_API,
  createProxyMiddleware({
    target: envConfig.NOTIFICATION_SERVICE_HOST,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/notifications/" },
    on: {
      proxyReq: (proxyReq, req) => {},
      proxyRes: (proxyRes, req, res) => {},
      error: (err, req, res) => {
        logger.error(`Lỗi Gateway proxy: ${err.stack || err}`, {
          method: req.method,
          path: req.originalUrl,
          errorDetail: err.stack,
        });
        res.status(502).json({ error: "Bad Gateway", detail: err.stack });
      },
    },
  }),
);

export default router;
