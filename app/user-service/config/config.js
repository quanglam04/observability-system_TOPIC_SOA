import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT,
  NOTIFICATION_SERVICE_HOST: "http://localhost:8001",
  NOTIFICATION_SERVICE_BASE_API: "/api/notifications",
};

export default envConfig;
