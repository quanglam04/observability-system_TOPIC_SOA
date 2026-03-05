import envConfig from "../config/config.js";
import logger from "../config/logger.js";
import axios from "axios";
/**
 * Logic xử lý viết trong này
 */

class UserController {
  test = (req, res) => {
    logger.info("OK");
    res.json({
      message: "OsK",
    });
  };

  async register(req, res) {
    try {
      const { email, username, password } = req.body;
      
      logger.info(`Xử lý đăng ký cho email: ${email}`);

      try {
        await axios.post(`${envConfig.NOTIFICATION_SERVICE_HOST}${envConfig.NOTIFICATION_SERVICE_BASE_API}/send-email`, {
          email: newUser.email,
          subject: "Xác nhận đăng ký tài khoản",
          message: `Vui lòng nhấn vào link để xác thực tài khoản.`
        });
        logger.info(`Đã yêu cầu gửi email xác nhận cho: ${email}`);
      } catch (notifyError) {
        logger.error(`Không thể gọi Notification Service: ${notifyError.message}`);
      }

      res.status(201).json({
        message: "Đăng ký thành công. Vui lòng kiểm tra email!",
        user: newUser
      });
    } catch (error) {
      logger.error(`Lỗi trong quá trình đăng ký: ${error.message}`);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
}

const userController = new UserController();

export default userController;
