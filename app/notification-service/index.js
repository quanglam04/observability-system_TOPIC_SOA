import express from "express";
import envConfig from "./config/config.js";
import router from "./routes/index.js";

const app = express();
app.use(express.json());

app.use("/api/notifications", router);

app.use((req, res) => {
  res.status(404).json({ message: "Không tồn tại đường dẫn" });
});

app.listen(envConfig.PORT, () => {
  console.log("ok");
});
