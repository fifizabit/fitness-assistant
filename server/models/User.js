const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
