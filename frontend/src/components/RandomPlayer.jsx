import { useEffect, useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { getRandomTrack, likeTrack } from '../api';

const TELEGRAM_ID = '123456'; // временный ID

export default function RandomPlayer() {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef();

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

  // Кнопки для ручного свайпа
  const handleLike = () => handleSwipe('right');
  const handleDislike = () => handleSwipe('left');

  useEffect(() => {
    fetchTrack();
  }, []);

  if (isLoading)
    return (
      <div className="flex flex-col items-center mt-8 text-lg text-white/80">
        Загрузка трека...
      </div>
    );
  if (!track)
    return (
      <div className="flex flex-col items-center mt-8 text-lg text-white/80">
        Нет доступных треков
      </div>
    );

  return (
    <div className="flex flex-col items-center" style={{ minHeight: 420 }}>
      <TinderCard
        key={track.id}
        onSwipe={handleSwipe}
        preventSwipe={['up', 'down']}
        ref={cardRef}
      >
        <div
          style={{
            background: "rgba(30,32,40,0.95)",
            padding: 28,
            borderRadius: 22,
            boxShadow:
              "0 4px 32px 0 rgba(106,130,251,0.25), 0 1.5px 8px 0 #fc5c7d44",
            marginBottom: 24,
            color: "#fff",
            border: "1.5px solid #6a82fb33",
            position: "relative",
            zIndex: 1,
            width: 320,
            maxWidth: "90vw",
            textAlign: "center",
            backdropFilter: "blur(2px)",
          }}
        >
          <h2
            style={{
              fontSize: "1.5em",
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: "0.01em",
              color: "#fff",
              textShadow: "0 2px 12px #6a82fb66",
            }}
          >
            {track.title}
          </h2>
          <p
            style={{
              fontSize: "1em",
              color: "#b3b3b3",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            @{track.user?.telegram_id}
          </p>
          <audio
            controls
            src={track.fileUrl}
            style={{
              width: "100%",
              marginBottom: 12,
              borderRadius: 8,
              background: "#232526",
            }}
          />
          <div
            style={{
              fontSize: "0.95em",
              color: "#fc5c7d",
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            VibeCoins: {track.likes}
          </div>
          <p className="text-xs mt-2 text-gray-400">
            Свайпайте → или используйте кнопки ниже
          </p>
        </div>
      </TinderCard>
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleDislike}
          style={{
            background: "#232526",
            color: "#fff",
            border: "1.5px solid #fc5c7d88",
            boxShadow: "0 0 8px #fc5c7d44",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1.1em",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
        >
          👎 Дизлайк
        </button>
        <button
          onClick={handleLike}
          style={{
            background: "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)",
            color: "#fff",
            boxShadow: "0 0 12px #6a82fb88",
            border: "none",
            padding: "12px 28px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1.1em",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
        >
          👍 Лайк
        </button>
      </div>
    </div>
  );
}