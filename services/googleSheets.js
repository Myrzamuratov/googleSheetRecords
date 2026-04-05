import "dotenv/config";
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEYS_PATH || "keys.json" || "./keys/keys.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Вспомогательная функция для получения API
const getSheets = async () => {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
};

// Улучшаем время (нормализация)
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.replace(".2026", ".26").trim();
};

// Функция для преобразования индекса в буквы (A, B... Z, AA, AB...)
const getColumnLetter = (index) => {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

// 1. Запись брони в лист "Записи"
export const appendBooking = async (bookingData) => {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Записи!A1:Z1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [bookingData] },
  });
};

// 2. Получение списка услуг
export const getServices = async () => {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Услуги!A1:Z100",
  });
  const rows = res.data.values;
  if (!rows || rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((key, i) => (obj[key] = row[i] || ""));
    return obj;
  });
};

// 3. Получение свободных слотов на дату
export const getAvailableTimesByDate = async (targetDate) => {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "График!A1:Z100",
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  const normalizedTarget = normalizeDate(targetDate);
  const colIndex = headers.findIndex(
    (h) => normalizeDate(h) === normalizedTarget,
  );

  if (colIndex <= 0) return [];

  return rows
    .slice(1)
    .filter((row) => row[0] && (!row[colIndex] || row[colIndex].trim() === ""))
    .map((row) => row[0]);
};

// 4. Проверка: свободен ли слот (защита от двойной записи)
export const isSlotAvailable = async (targetDate, targetTime) => {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "График!A1:Z100",
  });
  const rows = res.data.values;
  if (!rows) return false;

  const colIndex = rows[0].findIndex(
    (h) => normalizeDate(h) === normalizeDate(targetDate),
  );
  const rowIndex = rows.findIndex((row) => row[0] === targetTime);

  if (colIndex !== -1 && rowIndex !== -1) {
    const status = rows[rowIndex][colIndex];
    return !status || status.trim() === "";
  }
  return false;
};

// 5. Обновление статуса в таблице
export const updateSlotStatus = async (
  targetDate,
  targetTime,
  status = "Занято",
) => {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "График!A1:Z100",
  });
  const rows = res.data.values;
  if (!rows) return;

  const colIndex = rows[0].findIndex(
    (h) => normalizeDate(h) === normalizeDate(targetDate),
  );
  const rowIndex = rows.findIndex((row) => row[0] === targetTime);

  if (colIndex !== -1 && rowIndex !== -1) {
    const columnLetter = getColumnLetter(colIndex);
    const rowNumber = rowIndex + 1;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `График!${columnLetter}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[status]] },
    });
  }
};
