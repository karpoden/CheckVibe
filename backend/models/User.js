const mongoose = require('mongoose');
canReceiveVibes: { type: Boolean, true };

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  vibeCoins: { type: Number, default: 0 },
  canReceiveVibes: { type: Boolean, default: true },
});

module.exports = mongoose.model('User', userSchema);
