require("dotenv").config();

const clients = {
  barbershop: {
    botToken: process.env.BARBERSHOP_BOT_TOKEN,
    masterId: process.env.BARBERSHOP_CHAT_ID,
    sheetId: process.env.BARBERSHOP_SHEET_ID,
  },
  beauty_salon: {
    botToken: process.env.BEAUTY_BOT_TOKEN,
    masterId: process.env.BEAUTY_CHAT_ID,
    sheetId: process.env.BEAUTY_SHEET_ID,
  },
};

module.exports = clients;
