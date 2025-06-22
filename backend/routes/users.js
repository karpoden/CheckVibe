const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/:telegramId', async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.telegramId });
  res.json(user || { vibeCoins: 0 });
});

module.exports = router;
