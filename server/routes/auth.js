const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '❌ Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Неверный пароль' });
    }

    const token = jwt.sign(
      { id: user._id, telegramId: user.telegramId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, message: '✅ Авторизация успешна' });
  } catch (err) {
    console.error('❌ Ошибка логина:', err);
    res.status(500).json({ message: '🚨 Ошибка сервера' });
  }
});

module.exports = router;
