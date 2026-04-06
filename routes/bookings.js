import express from "express";
import clients from "../config.js";
import TelegramBot from "node-telegram-bot-api";
import {
  appendBooking,
  getAvailableTimesByDate,
  updateSlotStatus,
  getServices,
  isSlotAvailable,
} from "../services/googleSheets.js";

const router = express.Router({ mergeParams: true });

router.post("/add", async (req, res) => {
  const { slug } = req.params;
  const config = clients[slug];
  if (!config) {
    return res.status(404).json({ error: "Салон не найден" });
  }

  try {
    const { name, service, date, time, phone, price } = req.body;

    // 1. Проверка доступности слота
    const isFree = await isSlotAvailable(config.sheetId, date, time);
    if (!isFree) {
      return res.status(409).json({
        error: "Извините, это время уже было занято кем-то другим.",
      });
    }

    // 2. Обновляем статус в таблице "График"
    await updateSlotStatus(config.sheetId, date, time, "Занято");

    // 3. Записываем данные клиента в таблицу "Записи"
    const bookingRow = [name, phone, service, date, time, price];
    await appendBooking(config.sheetId, bookingRow);

    // Инициализация бота
    const bot = new TelegramBot(config.botToken, { polling: false });

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
      .sendMessage(config.masterId, message, { parse_mode: "Markdown" })
      .catch((err) =>
        console.error(`Ошибка Telegram бота ${slug}:`, err.message),
      );

    res.status(201).json({ message: "Запись успешно создана!" });
  } catch (err) {
    console.error("Ошибка при создании записи:", err);
    res.status(500).json({ error: "Ошибка сервера при бронировании" });
  }
});

router.get("/slots", async (req, res) => {
  const { slug } = req.params;
  const config = clients[slug];
  if (!config) {
    return res.status(404).json({ error: "Салон не найден" });
  }
  try {
    const selectedDate = req.query.date;

    if (!selectedDate) {
      return res.status(400).json({ error: "Дата не указана" });
    }

    // Параллельно получаем слоты и услуги для скорости
    const [availableSlots, services] = await Promise.all([
      getAvailableTimesByDate(config.sheetId, selectedDate),
      getServices(config.sheetId),
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
