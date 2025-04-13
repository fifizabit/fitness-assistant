const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  height: Number,
  weight: Number,
  goal: { type: String, enum: ['похудение', 'набор массы'] },
  trainingDays: [String],
  trainingTime: String,
  badHabits: [String],
  medicalConditions: String,
  sleep: {
    track: Boolean,
    status: { type: String, enum: ['в норме', 'нужна настройка'] }
  },
  equipment: [String],
  foodPrefs: {
    vegan: Boolean,
    budget: Number,
    preferred: [String],
    avoid: [String]
  },
  sportTypes: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
