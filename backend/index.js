const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const PORT = 3001;
const trackRoutes = require('./routes/tracks');
const userRoutes = require('./routes/users');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use('/uploads', express.static('uploads'));
app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);


// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// === Routes ===

// Simple test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Upload audio
app.post("/upload", upload.single("audio"), async (req, res) => {
  const { telegram_id, username, title } = req.body;
  const filePath = `/uploads/${req.file.filename}`;

  let user = await prisma.user.findUnique({ where: { telegram_id } });

  if (!user) {
    user = await prisma.user.create({
      data: { telegram_id, username },
    });
  }

  const audio = await prisma.audio.create({
    data: {
      title,
      file_url: filePath,
      userId: user.id,
    },
  });

  res.json(audio);
});

// Get all audios
app.get("/audios", async (req, res) => {
  const audios = await prisma.audio.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(audios);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
