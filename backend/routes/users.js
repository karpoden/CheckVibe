const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Получение данных пользователя по Telegram ID
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegram_id: req.params.telegramId },
    });

    if (!user) {
      return res.json({ vibeCoins: 0 });
    }

    res.json({
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      vibeCoins: user.vibeCoins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

module.exports = router;