require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path'); // 🆕 для выдачи WebApp

const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');
const UserProfile = require('./models/UserProfile');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(bodyParser.json());

// 🧠 Подключение API маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// 🧱 Подключение статики WebApp
app.use(express.static(path.join(__dirname, 'public')));

// 🌐 Отдача index.html при заходе на /webapp
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🤖 Telegram Webhook
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN);
const users = {};

app.post('/bot', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === '/start') {
    bot.sendMessage(chatId, '👋 Привет! Добро пожаловать в HealthPulse 💪 Нажми на кнопку WebApp внизу, чтобы начать!');
    return res.sendStatus(200);
  }

  if (text === '/register') {
    users[chatId] = { step: 'email' };
    bot.sendMessage(chatId, '📧 Введите ваш email:');
    return res.sendStatus(200);
  }

  if (users[chatId]) {
    const step = users[chatId].step;

    if (step === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        bot.sendMessage(chatId, '❌ Email неверен. Попробуйте ещё раз:');
        return res.sendStatus(200);
      }

      users[chatId] = {
        ...users[chatId],
        email: text,
        step: 'password'
      };

      bot.sendMessage(chatId, '🔐 Введите пароль (мин. 8 символов, 1 цифра, 1 спецсимвол):');
      return res.sendStatus(200);
    }

    if (step === 'password') {
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!passwordRegex.test(text)) {
        bot.sendMessage(chatId, '❌ Пароль слишком простой. Попробуйте ещё раз:');
        return res.sendStatus(200);
      }

      const { email } = users[chatId];
      const telegramId = chatId.toString();

      try {
        const existingUser = await User.findOne({ telegramId });
        if (existingUser) {
          bot.sendMessage(chatId, '😅 Вы уже зарегистрированы!');
          delete users[chatId];
          return res.sendStatus(200);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(text, salt);

        await User.create({ telegramId, email, password: hashedPassword });

        bot.sendMessage(chatId, '✅ Регистрация успешна!');
      } catch (err) {
        console.error('❌ Ошибка регистрации:', err);
        bot.sendMessage(chatId, '🚨 Ошибка сервера.');
      }

      delete users[chatId];
      return res.sendStatus(200);
    }
  }

  bot.sendMessage(chatId, '🤖 Напиши /register, чтобы начать регистрацию.');
  return res.sendStatus(200);
});

// 🚀 Запуск сервера + MongoDB
const PORT = process.env.PORT || 5000;

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
