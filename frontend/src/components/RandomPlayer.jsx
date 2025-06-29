import { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { getRandomTrack, likeTrack } from '../api';

const TELEGRAM_ID = '123456'; // временный ID

export default function RandomPlayer() {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrack = async () => {
    try {
      setIsLoading(true);
      const res = await getRandomTrack();
      setTrack(res.data);
    } catch (err) {
      setTrack(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (!track) return;

    if (direction === 'right') {
      try {
        await likeTrack(track.id, TELEGRAM_ID);
      } catch (err) {
        // ignore
      }
    }

    await fetchTrack();
  };

  useEffect(() => {
    fetchTrack();
  }, []);

  if (isLoading) return <div>Загрузка трека...</div>;
  if (!track) return <div>Нет доступных треков</div>;

  return (
    <div className="flex flex-col items-center">
      <TinderCard
        key={track.id}
        onSwipe={handleSwipe}
        preventSwipe={['up', 'down']}
      >
        <div className="bg-white shadow-xl rounded-2xl p-4 w-72 text-center">
          <h2 className="text-xl font-bold mb-2">{track.title}</h2>
          <p className="text-sm text-gray-500 mb-2">@{track.user?.telegram_id}</p>
          <audio controls src={track.fileUrl} />
          <p className="text-xs mt-2 text-gray-400">Свайпайте → если нравится</p>
        </div>
      </TinderCard>
    </div>
  );
}