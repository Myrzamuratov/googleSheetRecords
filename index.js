import express from "express";
import bookingRoutes from "./routes/bookings.js";
import cors from "cors";

const app = express();

app.use(cors());
// Важно: чтобы Express понимал данные из JSON-запросов
app.use(express.json());

// Подключаем наши роуты
app.use("/:slug/bookings", bookingRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер gg-rec запущен на порту ${PORT}`);
});
