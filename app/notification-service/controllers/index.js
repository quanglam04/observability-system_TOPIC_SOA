import { cp } from "fs";
import logger from "../config/logger.js";
import nodemailer from "nodemailer";
import envConfig from "../config/config.js";

/**
 * Logic xử lý viết trong này
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_PASS,
  },
});

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

      const mailOptions = {
        from: `"TOPIC Nhóm LVK": <${envConfig.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: message,
      };

      setTimeout(() => {}, 2000);

      await transporter.sendMail(mailOptions);

      logger.info(`Email đã được gửi thành công tới: ${email}`);

      res.status(200).json({ message: "Đã gửi thành công" });
    } catch (error) {
      logger.error(`Lỗi khi gửi email: ${error.message}`);
      res.status(500).json({ message: "Gửi thất bại" });
    }
  }
}

const notificationController = new NotificationController();

export default notificationController;
