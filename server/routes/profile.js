const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');

// Middleware проверки токена
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '❌ Нет токена' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: '❌ Токен недействителен' });
  }
};

// POST /api/profile
router.post('/', auth, async (req, res) => {
  try {
    const telegramId = req.user.telegramId;

    const updated = await UserProfile.findOneAndUpdate(
      { telegramId },
      { ...req.body, telegramId },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: '✅ Анкета сохранена', profile: updated });
  } catch (err) {
    console.error('❌ Ошибка анкеты:', err);
    res.status(500).json({ message: '🚨 Ошибка при сохранении анкеты' });
  }
});

module.exports = router;


module.exports = router;
