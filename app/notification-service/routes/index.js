import express from "express";
import notificationController from "../controllers/index.js";

/**
 * Định nghĩa các route trong này -> gọi hàm controller để xử lý
 */

const router = express.Router();

router.get("/test", notificationController.test);
router.post("/send-email", notificationController.sendEmail);
export default router;
