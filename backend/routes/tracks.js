const express = require('express');
const multer = require('multer');
const Track = require('../models/track.model');
const User = require('../models/User');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  const { name, telegramId } = req.body;

  let user = await User.findOne({ telegramId });
  if (!user) user = await User.create({ telegramId });

  const track = await Track.create({
    name,
    filename: req.file.filename,
    user: user._id,
  });

  res.json({ success: true, track });
});

router.get('/random', async (req, res) => {
  const tracks = await Track.aggregate([{ $sample: { size: 1 } }]);
  const track = await Track.populate(tracks[0], { path: 'user' });

  res.json(track);
});

router.post('/:id/like', async (req, res) => {
  const { telegramId } = req.body;

  const track = await Track.findById(req.params.id).populate('user');
  if (!track) return res.status(404).json({ error: 'Track not found' });

  track.likes += 1;
  await track.save();

  if (track.user.canReceiveVibes) {
    const owner = await User.findById(track.user._id);
    owner.vibeCoins += 5;
    await owner.save();
  }

  res.json({ success: true });
});


router.get('/by-user/:telegramId', async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.telegramId });
  if (!user) return res.json([]);

  const tracks = await Track.find({ user: user._id });
  res.json(tracks);
});

module.exports = router;
