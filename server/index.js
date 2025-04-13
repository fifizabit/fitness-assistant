require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./models/User'); // Модель пользователя

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

const users = {}; // временное хранилище шагов регистрации

// Telegram webhook роут
app.post('/bot', async (req, res) => {
  const message = req.body.message;

  if (message) {
    const chatId = message.chat.id;
    const text = message.text;

    console.log("📩 Получено сообщение:", chatId, text);

    if (text === '/start') {
      return bot.sendMessage(chatId, '👋 Привет! Добро пожаловать в HealthPulse 💪 Напиши /register чтобы начать!');
    }

    // Шаг 0: запускаем регистрацию
    if (text === '/register') {
      users[chatId] = { step: 'email' };
      return bot.sendMessage(chatId, '📧 Введите ваш email:');
    }

    // Если пользователь в процессе регистрации
    if (users[chatId]) {
      const step = users[chatId].step;

      // Шаг 1: Email
      if (step === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
          return bot.sendMessage(chatId, '❌ Email неверен. Попробуй ещё раз:');
        }

        users[chatId].email = text;
        users[chatId].step = 'password';
        return bot.sendMessage(chatId, '🔐 Введите пароль (мин. 8 символов, 1 цифра, 1 спецсимвол):');
      }

      // Шаг 2: Пароль
      if (step === 'password') {
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(text)) {
          return bot.sendMessage(chatId, '❌ Пароль слишком простой. Попробуйте ещё раз:');
        }

        const email = users[chatId].email;
        const password = text;
        const telegramId = chatId.toString();

        try {
          const existingUser = await User.findOne({ telegramId });
          if (existingUser) {
            return bot.sendMessage(chatId, '😅 Вы уже зарегистрированы!');
          }

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          await User.create({
            telegramId,
            email,
            password: hashedPassword,
          });

          bot.sendMessage(chatId, '✅ Регистрация успешна! Добро пожаловать!');
        } catch (err) {
          console.error('Ошибка при регистрации:', err);
          bot.sendMessage(chatId, '🚨 Ошибка сервера. Попробуйте позже.');
        }

        delete users[chatId];
        return;
      }
    }

    // Остальные команды
    bot.sendMessage(chatId, '🤖 Напиши /register, чтобы начать регистрацию.');
  }

  res.sendStatus(200);
});

// Запуск сервера
const PORT = process.env.PORT || 5000;

// Подключение к MongoDB и запуск
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB подключен');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер работает на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Ошибка MongoDB:', err);
  });
