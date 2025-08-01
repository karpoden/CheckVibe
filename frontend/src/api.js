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
export const getRandomTrack = (telegramId) =>
  axios.get(`${API_BASE}/tracks/random`, { params: { telegramId } });

// Лайкнуть трек
export const likeTrack = (id, telegramId) =>
  axios.post(`${API_BASE}/tracks/${id}/like`, { telegramId });

// Дизлайкнуть трек
export const dislikeTrack = (id, telegramId) =>
  axios.post(`/api/tracks/${id}/dislike`, { telegramId });

// Донат треку
export const donateTrack = (id, fromTelegramId) =>
  axios.post(`${API_BASE}/tracks/${id}/donate`, { fromTelegramId });

// Удалить трек 
export const deleteTrack = (id) =>
  axios.delete(`/api/tracks/${id}`);

// Продвинуть трек
export const promoteTrack = (id, telegramId, amount) =>
  axios.post(`/api/tracks/${id}/promote`, { telegramId, amount });

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