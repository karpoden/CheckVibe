import { useState } from 'react';
import { uploadTrack } from '../api';

export default function TrackUploader() {
  const [title, setTitle] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('telegramId', telegramId);
    formData.append('audio', audio);

    try {
      await uploadTrack(formData);
      setMessage('✅ Трек загружен');
      setTitle('');
      setTelegramId('');
      setAudio(null);
    } catch (err) {
      setMessage('❌ Ошибка при загрузке');
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-3 w-80 p-4 bg-white shadow-md rounded">
      <input
        type="text"
        placeholder="Название трека"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Telegram ID"
        value={telegramId}
        onChange={(e) => setTelegramId(e.target.value)}
        required
      />
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudio(e.target.files[0])}
        required
      />
      <button type="submit" className="bg-blue-600 text-white py-1 rounded">Загрузить</button>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </form>
  );
}