import express from "express";
import gatewayController from "../controllers/index.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import envConfig from "../config/config.js";
import logger from "../config/logger.js";

/**
 * Định nghĩa các route trong này -> gọi hàm controller để xử lý
 */

const router = express.Router();

router.use((req, res, next) => {
  logger.info("Gọi vào gateway");
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
      proxyReq: (proxyReq, req) => {
        logger.info(
          `Forwarding: ${req.method} ${req.originalUrl} → ${proxyReq.path}`,
        );
      },
      proxyRes: (proxyRes, res) => {
        logger.info("Response từ user-service");
      },
      error: (err, req, res) => {
        logger.error({
          message: "Lỗi",
          error: err.message,
          originalUrl: req.originalUrl,
        });
        res.status(502).json({ error: "Bad Gateway", detail: err.message });
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
      proxyReq: (proxyReq, req) => {
        logger.info(
          `Forwarding: ${req.method} ${req.originalUrl} → ${proxyReq.path}`,
        );
      },
      proxyRes: (proxyRes, res) => {
        logger.info("Response từ notification-service");
      },
      error: (err, req, res) => {
        logger.error({
          message: "Lỗi",
          error: err.message,
          originalUrl: req.originalUrl,
        });
        res.status(502).json({ error: "Bad Gateway", detail: err.message });
      },
    },
  }),
)

export default router;
