const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  filename: String,
  name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Track', trackSchema);
