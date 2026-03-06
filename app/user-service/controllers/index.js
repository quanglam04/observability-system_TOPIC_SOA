import envConfig from "../config/config.js";
import logger from "../config/logger.js";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
/**
 * Logic xử lý viết trong này
 */


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, "../dummy.json");

class UserController {
  test = (req, res) => {
    logger.info("OK");
    res.json({
      message: "OsK",
    });
  };

  async register(req, res) {
    try {
      const { email, username, password, confirmedPassword } = req.body;

      let users = [];
      try {
        const fileData = await fs.readFile(dataFilePath, "utf-8");
        users = JSON.parse(fileData);
      } catch (err) {
        logger.warn("Không tìm thấy file dummy.json sẽ tạo mảng mới.");
      }

      const isExist = users.find((u) => u.email === email);
      if (isExist) {
        logger.error(`Email ${email} đã tồn tại`);
        return res.status(400).json({ message: "Email này đã được đăng ký!" });
      }
      const newUser = {
        id: Date.now().toString(),
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await fs.writeFile(
        dataFilePath,
        JSON.stringify(users, null, 2),
        "utf-8"
      );

      try {
        await axios.post(
          `${envConfig.NOTIFICATION_SERVICE_HOST}${envConfig.NOTIFICATION_SERVICE_BASE_API}/send-email`,
          {
            email: newUser.email,
            subject: "Xác nhận tài khoản",
            message: `Chào ${newUser.username}, bạn đã đăng ký thành công.`,
          }
        );
        logger.info(`Đã yêu cầu Notification Service gửi email cho: ${email}`);
      } catch (notifyError) {
        logger.error(`Lỗi gọi Notification Service: ${notifyError.message}`);
      }

      // Trả về kết quả cho gateway
      res.status(201).json({
        message: "Đăng ký thành công",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
      });
    } catch (error) {
      logger.error(`Lỗi: ${error.message}`);
      res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }

  async login(req, res) {
    try {
      const {email, password} = req.body

      let users = []
      try {
        const fileData = await fs.readFile(dataFilePath, "utf-8");
        users = JSON.parse(fileData);
      } catch (err) {
        logger.warn("Chưa có dữ liệu trong dummy.json");
      }

      const user = users.find((u) => u.email === email && u.password === password);

      if(!user){
        logger.warning(`Sai thông tin đăng nhập`)
        res.status(401).json({message: "Email hoặc mật khẩu không đúng"})
      }

      res.status(200).json({
        message: "Đăng nhập thành công!",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
      logger.info(`Đăng nhập thành công: ${user.username}`)
    } catch (error) {
      logger.error(`Đăng nhập thất bại: ${error.message}`);
      res.status(500).json({ error: "Lỗi hệ thống khi đăng nhập" });
    }
  }

  async profile (req, res){
    try {
      const userId = req.params.id;

      let users = []
      try {
        const fileData = await fs.readFile(dataFilePath, "utf-8");
        users = JSON.parse(fileData)
      } catch (error) {
        logger.warn("Chưa có dữ liệu trong dummy.json");
      }

      const user = users.find((u) => u.id === userId);

      if(!user){
        logger.warn(`Không tìm thấy người dùng với Id: ${userId}`);
        return res.status(404).json({ message: "Người dùng không tồn tại!" });
      }

      const {password, ...userProfile} = user;

      logger.info(`Lấy thông tin người dùng thành công cho Id: ${userId}`);
      res.status(200).json({
        status: 200,
        message: "Lấy thông tin thành công",
        data: userProfile
      })
    } catch (error) {
      logger.error(`Lấy thông tin thất bại: ${error.message}`);
      res.status(500).json({ message: "Lỗi hệ thống khi lấy thông tin" });
    }
  }
}

const userController = new UserController();

export default userController;
