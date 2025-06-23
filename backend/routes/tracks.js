const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Загрузка трека
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, telegramId } = req.body;
    const file = req.file;

    if (!file || !title || !telegramId) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }

    // 1. Гарантируем наличие пользователя
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {},
      create: { telegramId },
    });

    // 2. Сохраняем аудио в БД
    const audio = await prisma.audio.create({
      data: {
        title,
        fileUrl: `/uploads/${file.filename}`,
        userId: user.id,
      },
    });

    res.json({ success: true, audio });
  } catch (err) {
    console.error('Ошибка при загрузке трека:', err);
    res.status(500).json({ error: 'Серверная ошибка' });
  }
});

// Получить случайный трек
router.get('/random', async (req, res) => {
  try {
    const total = await prisma.audio.count();
    if (total === 0) return res.status(404).json({ error: 'Нет треков' });

    const randomIndex = Math.floor(Math.random() * total);
    const [audio] = await prisma.audio.findMany({
      skip: randomIndex,
      take: 1,
      include: { user: true },
    });

    res.json(audio);
  } catch (err) {
    console.error('Ошибка при получении случайного трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Лайк трека
router.post('/:id/like', async (req, res) => {
  const { telegramId } = req.body;

  try {
    const audio = await prisma.audio.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!audio) return res.status(404).json({ error: 'audio not found' });

    await prisma.audio.update({
      where: { id: audio.id },
      data: { likes: { increment: 1 } },
    });

    await prisma.user.upsert({
      where: { telegram_id: telegramId },
      update: { vibeCoins: { increment: 1 } },
      create: { telegram_id: telegramId, vibeCoins: 1 },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при лайке трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Донат пользователю
router.post('/:id/donate', async (req, res) => {
  const { fromTelegramId } = req.body;

  try {
    const sender = await prisma.user.findUnique({
      where: { telegram_id: fromTelegramId },
    });

    if (!sender || sender.vibeCoins < 5) {
      return res.status(400).json({ error: 'Недостаточно VibeCoin' });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Получатель не найден' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { vibeCoins: { decrement: 5 } },
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { vibeCoins: { increment: 5 } },
      }),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при донате:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все треки пользователя
router.get('/by-user/:telegramId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegram_id: req.params.telegramId },
    });

    if (!user) return res.json([]);

    const audios = await prisma.audio.findMany({
      where: { userId: user.id },
    });

    res.json(audios);
  } catch (err) {
    console.error('Ошибка при получении треков пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
