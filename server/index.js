require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Telegram Bot Init
const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: false }); // polling отключён

// Middleware
app.use(bodyParser.json());

// ======== API ROUTES ==========
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

// ======== STATIC WEB APP ==========
app.use(express.static(path.join(__dirname, 'public')));

app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🧠 Fallback для React Router
app.get('/webapp/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер HealthPulse запущен на порту ${PORT}`);
});
