import axios from 'axios';

const API_BASE = '/api';

// Загрузка трека
export const uploadTrack = (formData) =>
  axios.post(`${API_BASE}/tracks/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Получить треки пользователя
export const getTracksByUser = (telegramId) =>
  axios.get(`${API_BASE}/tracks/by-user/${telegramId}`);

// Получить случайный трек
export const getRandomTrack = () =>
  axios.get(`${API_BASE}/tracks/random`);

// Лайкнуть трек
export const likeTrack = (id, telegramId) =>
  axios.post(`${API_BASE}/tracks/${id}/like`, { telegramId });

// Донат треку
export const donateTrack = (id, fromTelegramId) =>
  axios.post(`${API_BASE}/tracks/${id}/donate`, { fromTelegramId });

// Получить пользователя
export const getUser = (telegramId) =>
  axios.get(`${API_BASE}/users/${telegramId}`);

export default {
  uploadTrack,
  getTracksByUser,
  getRandomTrack,
  likeTrack,
  donateTrack,
  getUser,
};