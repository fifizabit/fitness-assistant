const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { webHook: { port: 5001 } });

// URL вебхука — заменим чуть позже
const WEBHOOK_URL = 'https://ВАШ_ХОСТИНГ/api/bot'; // <== заменим позже

bot.setWebHook(`${WEBHOOK_URL}/${TOKEN}`);

// Базовый обработчик
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Добро пожаловать в HealthPulse 🏋️‍♂️ Напиши /register для начала!');
});

module.exports = bot;
