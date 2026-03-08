import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT,
  USER_SERVICE_HOST: process.env.USER_SERVICE_HOST,
  USER_SERVICE_BASE_API: process.env.USER_SERVICE_BASE_API,
  NOTIFICATION_SERVICE_HOST: process.env.NOTIFICATION_SERVICE_HOST,
  NOTIFICATION_SERVICE_BASE_API: process.env.NOTIFICATION_SERVICE_BASE_API,
};

export default envConfig;
