import { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';

const TELEGRAM_ID = '123456'; // временный ID

export default function RandomPlayer() {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrack = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:3001/api/tracks/random');
      setTrack(res.data);
    } catch (err) {
      console.error('Ошибка при получении трека:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (!track) return;

    if (direction === 'right') {
      try {
        await axios.post(`http://localhost:3001/api/tracks/${track._id}/like`, {
          telegramId: TELEGRAM_ID,
        });
      } catch (err) {
        console.error('Ошибка при лайке:', err);
      }
    }

    await fetchTrack(); // загрузить следующий трек
  };

  useEffect(() => {
    fetchTrack();
  }, []);

  if (isLoading) return <div>Загрузка трека...</div>;
  if (!track) return <div>Нет доступных треков</div>;

  return (
    <div className="flex flex-col items-center">
      <TinderCard
        key={track._id}
        onSwipe={handleSwipe}
        preventSwipe={['up', 'down']}
      >
        <div className="bg-white shadow-xl rounded-2xl p-4 w-72 text-center">
          <h2 className="text-xl font-bold mb-2">{track.name}</h2>
          <p className="text-sm text-gray-500 mb-2">@{track.user?.telegramId}</p>
          <audio controls src={`http://localhost:3001/uploads/${track.filename}`} />
          <p className="text-xs mt-2 text-gray-400">Свайпайте → если нравится</p>
        </div>
      </TinderCard>
    </div>
  );
}
