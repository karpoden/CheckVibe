import axios from 'axios';

const API_BASE = 'http://localhost:5173/api';

// Загрузка трека
export const uploadAudio = (formData) =>
  axios.post(`${API_BASE}/audios/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Получить треки пользователя
export const getAudiosByUser = (telegramId) =>
  axios.get(`${API_BASE}/audioss/by-user/${telegramId}`);

// Получить все треки
export const getAllAudios = () =>
  axios.get(`${API_BASE}/audios/all`);

// Лайкнуть трек
export const likeAudio = (Id, telegramId) =>
  axios.post(`${API_BASE}/audios/${Id}/like`, { telegramId });

// Получить пользователя
export const getUser = (telegramId) =>
  axios.get(`${API_BASE}/users/${telegramId}`);

// Default экспорт на всякий случай
export default {
  uploadAudio,
  getAudiosByUser,
  getAllAudios,
  likeAudio,
  getUser,
};
