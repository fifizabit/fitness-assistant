const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.registerUser = async (req, res) => {
  const { telegramId, email, password } = req.body;

  try {
    const userExists = await User.findOne({ telegramId });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      telegramId,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

exports.loginUser = async (req, res) => {
  const { telegramId, password } = req.body;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    res.json({
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};
