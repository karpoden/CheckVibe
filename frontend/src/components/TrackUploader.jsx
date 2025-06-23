import { useState } from 'react';
import axios from 'axios';

export default function TrackUploader() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  const handleUpload = async () => {
    if (!file || !title) {
      alert('Заполните все поля');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('telegramId', '123456'); // временно

    try {
      await axios.post('http://localhost:3001/api/tracks/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Трек загружен!');
      setFile(null);
      setTitle('');
    } catch (err) {
      console.error('Ошибка при загрузке:', err);
      alert('Не удалось загрузить трек');
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md w-80">
      <h2 className="text-lg font-semibold mb-2">Загрузка трека</h2>
      <input
        type="text"
        placeholder="Название трека"
        className="w-full mb-2 p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        accept=".mp3"
        className="mb-2"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpload}
      >
        Загрузить
      </button>
    </div>
  );
}
