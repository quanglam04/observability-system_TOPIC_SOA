import { cp } from "fs";
import logger from "../config/logger.js";
/**
 * Logic xử lý viết trong này
 */

class NotificationController {
  test = (req, res) => {
    logger.info("OK");
    res.json({
      message: "OsK",
    });
  };

  async sendEmail(req, res) {
    try {
      const { email, subject, message } = req.body;
      
      logger.info(`Xử lý gửi email đến: ${email} với tiêu đề: ${subject}`);

      logger.info(`Email đã được gửi thành công tới: ${email}`);
      
      res.status(200).json({ message: "Đã gửi thành công" });
    } catch (error) {
      logger.error(`Lỗi khi gửi email: ${error.message}`);
      res.status(500).json({ error: "Gửi thất bại" });
    }
  }
}

const notificationController = new NotificationController();

export default notificationController;
