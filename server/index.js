require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

// Middleware
app.use(bodyParser.json());

// ✅ Роут для Webhook — стабильный путь
app.post('/bot', (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер работает на порту ${PORT}`);
});
