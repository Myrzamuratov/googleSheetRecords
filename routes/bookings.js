import express from "express";
import TelegramBot from "node-telegram-bot-api";
import {
  appendBooking,
  getAvailableTimesByDate,
  updateSlotStatus,
  getServices,
  isSlotAvailable,
} from "../services/googleSheets.js";

const router = express.Router();

// !Данные по телеграм боту теперь берутся из .env
const token = process.env.TELEGRAM_BOT_TOKEN;
const masterChatId = process.env.MASTER_CHAT_ID;

// Инициализируем бота один раз вне роута
const bot = new TelegramBot(token, { polling: false });

router.post("/add", async (req, res) => {
  try {
    const { name, service, date, time, phone, price } = req.body;

    // 1. Проверка доступности слота
    const isFree = await isSlotAvailable(date, time);
    if (!isFree) {
      return res.status(409).json({
        error: "Извините, это время уже было занято кем-то другим.",
      });
    }

    // 2. Обновляем статус в таблице "График"
    await updateSlotStatus(date, time, "Занято");

    // 3. Записываем данные клиента в таблицу "Записи"
    const bookingRow = [name, phone, service, date, time, price];
    await appendBooking(bookingRow);

    // 4. Формируем сообщение для мастера
    const message = `
🔔 *Новая запись!*
👤 Клиент: ${name}
📞 Тел: ${phone}
✂️ Услуга: ${service}
📅 Дата: ${date}
⏰ Время: ${time}
💰 Цена: ${price} сом
    `;

    // 5. Отправляем уведомление
    bot
      .sendMessage(masterChatId, message, { parse_mode: "Markdown" })
      .catch((err) => console.error("Ошибка Telegram бота:", err.message));

    res.status(201).json({ message: "Запись успешно создана!" });
  } catch (err) {
    console.error("Ошибка при создании записи:", err);
    res.status(500).json({ error: "Ошибка сервера при бронировании" });
  }
});

router.get("/slots", async (req, res) => {
  try {
    const selectedDate = req.query.date;

    if (!selectedDate) {
      return res.status(400).json({ error: "Дата не указана" });
    }

    // Параллельно получаем слоты и услуги для скорости
    const [availableSlots, services] = await Promise.all([
      getAvailableTimesByDate(selectedDate),
      getServices(),
    ]);

    res.status(200).json({
      slots: availableSlots,
      services: services,
    });
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
