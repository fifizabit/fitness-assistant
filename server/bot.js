const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN);
app.use(bodyParser.json());

// Роут для Telegram Webhook
app.post(`/api/bot/${TOKEN}`, (req, res) => {
  const message = req.body.message;

  if (message) {
    const chatId = message.chat.id;
    const text = message.text;

    console.log("📩 Сообщение от пользователя:", chatId, text);

    if (text === '/start') {
      bot.sendMessage(chatId, '👋 Привет! Добро пожаловать в HealthPulse 💪 Напиши /register чтобы начать!');
    } else {
      bot.sendMessage(chatId, 'Я тебя услышал 🤖 Ожидай боевых функций...');
    }
  }

  res.sendStatus(200);
});

module.exports = app;
