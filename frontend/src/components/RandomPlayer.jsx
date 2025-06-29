import { useEffect, useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { getRandomTrack, likeTrack, donateTrack, getUser } from '../api';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User, Star } from 'lucide-react';

const TELEGRAM_ID = '123456'; // временный ID

export default function RandomPlayer() {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myCoins, setMyCoins] = useState(0);
  const cardRef = useRef();
  const location = useLocation();

  // Получить свои VibeCoins
  const fetchMyCoins = async () => {
    try {
      const res = await getUser(TELEGRAM_ID);
      setMyCoins(res.data.vibeCoins || 0);
    } catch {
      setMyCoins(0);
    }
  };

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

  // За лайк и дизлайк начисляем VibeCoins (backend)
  const handleSwipe = async (direction) => {
    if (!track) return;
    try {
      await likeTrack(track.id, TELEGRAM_ID);
      await fetchMyCoins();
    } catch (err) {}
    await fetchTrack();
  };

  const handleLike = () => handleSwipe('right');
  const handleDislike = () => handleSwipe('left');

  // Донат автору трека + лайк (но баланс пользователя НЕ увеличивается дополнительно)
  const handleDonate = async () => {
    if (!track || myCoins < 5) return;
    try {
      // 1. Ставим лайк (но не обновляем баланс пользователя после этого)
      await likeTrack(track.id, TELEGRAM_ID);
      // 2. Донатим (баланс пользователя уменьшится на 5, у автора увеличится на 5)
      await donateTrack(track.id, TELEGRAM_ID);
      // 3. Обновляем баланс и трек
      await fetchMyCoins();
      await fetchTrack();
    } catch (err) {}
  };

  useEffect(() => {
    fetchTrack();
    fetchMyCoins();
    // eslint-disable-next-line
  }, []);

  if (isLoading) return <div style={{ color: "#fff", marginTop: 40 }}>Загрузка трека...</div>;
  if (!track) return <div style={{ color: "#fff", marginTop: 40 }}>Нет доступных треков</div>;

  // Стили для навигационных кнопок
  const navBtnStyle = (active) => ({
    background: active
      ? "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)"
      : "#232526",
    color: "#fff",
    boxShadow: active
      ? "0 0 12px #6a82fb88"
      : "0 0 8px #fc5c7d44",
    border: active
      ? "none"
      : "1.5px solid #fc5c7d88",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1.25em",
    cursor: "pointer",
    transition: "box-shadow 0.2s, background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  // Стили для звездочки (доната)
  const starBtnStyle = (disabled) => ({
    background: "linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 8px #fc5c7d88",
    cursor: disabled ? "not-allowed" : "pointer",
    marginLeft: 4,
    fontSize: 18,
    transition: "box-shadow 0.2s, filter 0.2s",
    opacity: disabled ? 0.5 : 1,
    filter: disabled ? "grayscale(0.7)" : "none",
    pointerEvents: disabled ? "none" : "auto",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            boxShadow: "0 4px 32px 0 rgba(106,130,251,0.25), 0 1.5px 8px 0 #fc5c7d44",
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
          {/* Баланс пользователя в правом верхнем углу + кнопка доната */}
          <div style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(36,37,44,0.85)",
            borderRadius: 8,
            padding: "4px 10px",
            fontWeight: 600,
            fontSize: "1em",
            color: "#6a82fb",
            boxShadow: "0 0 8px #6a82fb44"
          }}>
            <span>💰 {myCoins}</span>
            <button
              onClick={handleDonate}
              title="Донат автору 5 VibeCoins и лайк"
              style={starBtnStyle(myCoins < 5)}
              disabled={myCoins < 5}
            >
              <Star size={20} fill="#fff700" color="#fff700" />
            </button>
          </div>
          <h2
            style={{
              fontSize: "1.5em",
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: "0.01em",
              color: "#fff",
              textShadow: "0 2px 12px #6a82fb66",
              marginTop: 24
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
          <p style={{ fontSize: "0.8em", color: "#b3b3b3" }}>
            Свайпайте → или используйте кнопки ниже
          </p>
        </div>
      </TinderCard>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
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
          👎
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
          👍
        </button>
      </div>
      {/* Навигация под лайком/дизлайком */}
      <div style={{ display: "flex", gap: 24, marginTop: 28 }}>
        <Link to="/" style={navBtnStyle(location.pathname === "/")}>
          <Home size={28} />
        </Link>
        <Link to="/add" style={navBtnStyle(location.pathname === "/add")}>
          <Plus size={28} />
        </Link>
        <Link to="/profile" style={navBtnStyle(location.pathname === "/profile")}>
          <User size={28} />
        </Link>
      </div>
    </div>
  );
}