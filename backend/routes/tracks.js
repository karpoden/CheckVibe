const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const asciiName = file.originalname.replace(/[^\x00-\x7F]/g, "_");
    cb(null, `${Date.now()}-${asciiName}`);
  }
});
const upload = multer({ storage });

// Загрузка трека
router.post('/upload', upload.single('audio'), async (req, res) => {
  console.log('UPLOAD ATTEMPT BODY:', req.body);
  console.log('UPLOAD ATTEMPT FILE:', req.file);

  try {
    const { title, telegramId } = req.body;
    const file = req.file;

    if (!title || !telegramId || !file) {
      return res.status(400).json({ error: 'title, telegramId и файл обязательны' });
    }

    // Найти или создать пользователя
    const user = await prisma.user.upsert({
      where: { telegram_id: telegramId },
      update: {},
      create: { telegram_id: telegramId }
    });

    const newTrack = await prisma.audio.create({
      data: {
        title,
        fileUrl: `/uploads/${file.filename}`,
        userId: user.id,
      },
      include: { user: true }
    });

    res.status(201).json(newTrack);
  } catch (error) {
    console.error('[UPLOAD ERROR]', error);
    res.status(500).json({ error: 'Ошибка при загрузке трека' });
  }
});

// Получить случайный трек
router.get('/random', async (req, res) => {
  try {
    const { telegramId } = req.query;

    let excludeUserId = null;
    let ratedAudioIds = [];
    let user = null;
    if (telegramId) {
      user = await prisma.user.findUnique({
        where: { telegram_id: telegramId }
      });
      if (user) {
        excludeUserId = user.id;
        const ratings = await prisma.trackRating.findMany({
          where: { userId: user.id },
          select: { audioId: true }
        });
        ratedAudioIds = ratings.map(r => r.audioId);
      }
    }

    const tracks = await prisma.audio.findMany({
      where: {
        ...(excludeUserId && { userId: { not: excludeUserId } }),
        ...(ratedAudioIds.length > 0 && { id: { notIn: ratedAudioIds } })
      }
    });

    if (tracks.length === 0) {
      return res.status(404).json({ error: 'Нет новых треков. Хотите начать заново?', canReset: true });
    }

    // Считаем среднее число оценок
    const avgRatings = tracks.reduce((sum, t) => sum + t.likes + t.dislikes, 0) / tracks.length;

    // Вес: promote + лайки - дизлайки + boost если мало оценок
    const weightedTracks = tracks.map(track => {
      const promote = track.views || 0;
      const likes = track.likes || 0;
      const dislikes = track.dislikes || 0;
      let weight = 1 + promote * 2 + likes - dislikes * 2;

      // Boost если у трека мало оценок относительно среднего
      const totalRatings = likes + dislikes;
      if (totalRatings < avgRatings * 0.5) weight += 5;

      weight = Math.max(weight, 1);
      return { track, weight };
    });

    // Лотерея по весам
    const lottery = [];
    weightedTracks.forEach(({ track, weight }) => {
      for (let i = 0; i < weight; i++) {
        lottery.push(track);
      }
    });

    const randomTrack = lottery[Math.floor(Math.random() * lottery.length)];
    res.json(randomTrack);
  } catch (err) {
    console.error('[RANDOM ERROR]', err);
    res.status(500).json({ error: 'Ошибка при получении случайного трека' });
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

    const user = await prisma.user.upsert({
      where: { telegram_id: telegramId },
      update: { vibeCoins: { increment: 1 } },
      create: { telegram_id: telegramId, vibeCoins: 1 },
    });

    await prisma.audio.update({
      where: { id: audio.id },
      data: { likes: { increment: 1 } },
    });

    await prisma.trackRating.upsert({
      where: { userId_audioId: { userId: user.id, audioId: audio.id } },
      update: {},
      create: { userId: user.id, audioId: audio.id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при лайке трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Дизлайк трека
router.post('/:id/dislike', async (req, res) => {
  const { telegramId } = req.body;

  try {
    const audio = await prisma.audio.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!audio) return res.status(404).json({ error: 'audio not found' });

    const user = await prisma.user.upsert({
      where: { telegram_id: telegramId },
      update: {},
      create: { telegram_id: telegramId },
    });

    await prisma.audio.update({
      where: { id: audio.id },
      data: { dislikes: { increment: 1 } },
    });

    await prisma.trackRating.upsert({
      where: { userId_audioId: { userId: user.id, audioId: audio.id } },
      update: {},
      create: { userId: user.id, audioId: audio.id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при дизлайке трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// удаление трека
router.delete('/:id', async (req, res) => {
  try {
    const track = await prisma.audio.findUnique({ where: { id: req.params.id } });
    if (!track) return res.status(404).json({ error: 'Трек не найден' });

    // Удалить файл с диска (опционально)
    const filePath = path.join(__dirname, '..', track.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.audio.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Продвижение трека 
router.post('/:id/promote', async (req, res) => {
  const { telegramId, amount } = req.body;
  const promoteAmount = Number(amount) || 1;

  try {
    const user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });
    if (!user || user.vibeCoins < promoteAmount) {
      return res.status(400).json({ error: 'Недостаточно VibeCoins' });
    }

    const audio = await prisma.audio.findUnique({ where: { id: req.params.id } });
    if (!audio) return res.status(404).json({ error: 'Трек не найден' });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { vibeCoins: { decrement: promoteAmount } },
      }),
      prisma.audio.update({
        where: { id: audio.id },
        data: { views: { increment: promoteAmount } }, // views как "продвижение"
      }),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при продвижении трека:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/reset-ratings', async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Нет telegramId' });

  const user = await prisma.user.findUnique({ where: { telegram_id: telegramId } });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  await prisma.trackRating.deleteMany({ where: { userId: user.id } });
  res.json({ success: true });
});

// Донат пользователю (по id трека)
router.post('/:id/donate', async (req, res) => {
  const { fromTelegramId } = req.body;

  try {
    const sender = await prisma.user.findUnique({
      where: { telegram_id: fromTelegramId },
    });

    if (!sender || sender.vibeCoins < 5) {
      return res.status(400).json({ error: 'Недостаточно VibeCoin' });
    }

    const audio = await prisma.audio.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!audio || !audio.user) {
      return res.status(404).json({ error: 'Получатель не найден' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { vibeCoins: { decrement: 5 } },
      }),
      prisma.user.update({
        where: { id: audio.user.id },
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