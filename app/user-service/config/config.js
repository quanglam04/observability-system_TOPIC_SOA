import dotenv from "dotenv";

dotenv.config();

const envConfig = {
  PORT: process.env.PORT,
  NOTIFICATION_SERVICE_HOST: process.env.NOTIFICATION_SERVICE_HOST,
  NOTIFICATION_SERVICE_BASE_API: process.env.NOTIFICATION_SERVICE_BASE_API,
};

export default envConfig;
