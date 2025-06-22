require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const trackRoutes = require('./routes/tracks');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
