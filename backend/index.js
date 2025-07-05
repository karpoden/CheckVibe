const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;
const trackRoutes = require('./routes/tracks');
const userRoutes = require('./routes/users');

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Middlewares
app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//app.use('/api/tracks', trackRoutes);
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/users', userRoutes);


// // Multer config for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// === Routes ===

// Simple test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});