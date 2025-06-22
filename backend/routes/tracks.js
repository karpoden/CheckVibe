const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({ dest: 'uploads/' });

// Загрузка трека
router.post('/upload', upload.single('file'), async (req, res) => {
  const { name, telegramId, username } = req.body;

  let user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegram_id: telegramId,
        username,
      },
    });
  }

  const audio = await prisma.audio.create({
    data: {
      title: name,
      file_url: `/uploads/${req.file.filename}`,
      userId: user.id,
    },
  });

  res.json({ success: true, audio });
});

// Получить случайный трек
router.get('/random', async (req, res) => {
  const total = await prisma.audio.count();
  if (total === 0) return res.status(404).json({ error: 'Нет треков' });

  const randomIndex = Math.floor(Math.random() * total);
  const [track] = await prisma.audio.findMany({
    skip: randomIndex,
    take: 1,
    include: { user: true },
  });

  res.json(track);
});

// Лайк трека
router.post('/:id/like', async (req, res) => {
  const { telegramId } = req.body;

  const audio = await prisma.audio.findUnique({
    where: { id: Number(req.params.id) },
    include: { user: true },
  });

  if (!audio) return res.status(404).json({ error: 'Трек не найден' });

  // Увеличить лайки
  await prisma.audio.update({
    where: { id: audio.id },
    data: { likes: { increment: 1 } },
  });

  // Добавить VibeCoins, если включено
  if (audio.user.canReceiveVibes) {
    await prisma.user.update({
      where: { id: audio.user.id },
      data: { vibeCoins: { increment: 5 } },
    });
  }

  res.json({ success: true });
});

// Получить все треки пользователя
router.get('/by-user/:telegramId', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { telegram_id: req.params.telegramId },
  });

  if (!user) return res.json([]);

  const tracks = await prisma.audio.findMany({
    where: { userId: user.id },
  });

  res.json(tracks);
});

module.exports = router;
