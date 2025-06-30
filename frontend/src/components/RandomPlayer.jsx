import { useEffect, useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { getRandomTrack, likeTrack, donateTrack, getUser, dislikeTrack } from '../api';

import TrackPlayer from "./TrackPlayer";
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User, Star } from 'lucide-react';

// const TELEGRAM_ID = '123456'; // временный ID
const tg = window.Telegram.WebApp;
const TELEGRAM_ID = tg.initDataUnsafe.user?.id;

export default function RandomPlayer() {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myCoins, setMyCoins] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef();
  const [noTracks, setNoTracks] = useState(false);
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
      const res = await getRandomTrack(TELEGRAM_ID);
      setTrack(res.data);
      setNoTracks(false);
    } catch (err) {
      if (
        err.response &&
        err.response.status === 404 &&
        err.response.data &&
        err.response.data.canReset
      ) {
        setNoTracks(true);
        setTrack(null); // обязательно сбрасываем track
      } else {
        setTrack(null);
        setNoTracks(false); // не показываем кнопку сброса если это не исчерпание треков
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Лайк
  const handleLike = async () => {
    if (!track) return;
    try {
      await likeTrack(track.id, TELEGRAM_ID);
      await fetchMyCoins();
    } catch (err) {}
    await fetchTrack();
  };

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

  // Дизлайк
  const handleDislike = async () => {
    if (!track) return;
    try {
      await dislikeTrack(track.id, TELEGRAM_ID);
      await fetchMyCoins();
    } catch (err) {}
    await fetchTrack();
  };

  // Свайп (по-прежнему только лайк)
  const handleSwipe = async (direction) => {
    if (!track) return;
    if (direction === 'right') {
      await handleLike();
    } else if (direction === 'left') {
      await handleDislike();
    }
  };

  const handleResetRatings = async () => {
    await axios.post('/api/tracks/reset-ratings', { telegramId: TELEGRAM_ID });
    fetchTrack();
  };

  // Донат автору трека + лайк (но баланс пользователя НЕ увеличивается дополнительно)
  const handleDonate = async () => {
    if (!track || myCoins < 5) return;
    try {
      await likeTrack(track.id, TELEGRAM_ID);
      await donateTrack(track.id, TELEGRAM_ID);
      await fetchMyCoins();
      await fetchTrack();
    } catch (err) {}
  };

  useEffect(() => {
    fetchTrack();
    fetchMyCoins();
    // eslint-disable-next-line
  }, []);

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

  // --- Экран "Нет новых треков" ---
  if (noTracks) return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(30,32,40,0.97)",
          borderRadius: 22,
          boxShadow: "0 4px 32px 0 rgba(106,130,251,0.25), 0 1.5px 8px 0 #fc5c7d44",
          border: "1.5px solid #6a82fb33",
          padding: "38px 32px 32px 32px",
          color: "#fff",
          textAlign: "center",
          maxWidth: 340,
          margin: "0 auto"
        }}
      >
        <h2 style={{
          fontSize: "1.3em",
          fontWeight: 700,
          marginBottom: 18,
          letterSpacing: "0.01em",
          color: "#fff",
          textShadow: "0 2px 12px #6a82fb66"
        }}>
          Нет новых треков
        </h2>
        <p style={{ color: "#b3b3b3", fontSize: "1.05em", marginBottom: 22 }}>
          Вы оценили все доступные треки.<br />
          Хотите просмотреть их заново?
        </p>
        <button
          onClick={handleResetRatings}
          style={{
            background: "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)",
            color: "#fff",
            boxShadow: "0 0 16px #6a82fb88",
            border: "none",
            padding: "16px 0",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "1.15em",
            cursor: "pointer",
            width: "100%",
            marginTop: 8,
            transition: "box-shadow 0.2s",
            textShadow: "0 2px 8px #6a82fb55"
          }}
        >
          Обнулить оценки и начать заново
        </button>
      </div>
    </div>
  );

  if (isLoading) return <div style={{ color: "#fff", marginTop: 40 }}>Загрузка трека...</div>;
  if (!track) return <div style={{ color: "#fff", marginTop: 40 }}>Нет доступных треков</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 90 }}>
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
            borderRadius: 32,
            boxShadow: "0 4px 32px 0 rgba(106,130,251,0.25), 0 1.5px 8px 0 #fc5c7d44",
            marginBottom: 24,
            color: "#fff",
            border: "1.5px solid #6a82fb33",
            position: "relative",
            zIndex: 1,
            width: 400,
            maxWidth: "98vw",
            textAlign: "center",
            backdropFilter: "blur(2px)",
            overflow: "visible"
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
            boxShadow: "0 0 8px #6a82fb44",
            zIndex: 2
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
              fontSize: "1.7em",
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: "0.01em",
              color: "#fff",
              textShadow: "0 2px 12px #6a82fb66",
              marginTop: 34,
              zIndex: 2,
              position: "relative"
            }}
          >
            {track.title}
          </h2>
          <TrackPlayer
            src={track.fileUrl}
            avatarUrl={"/vite.svg"}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <p style={{ fontSize: "0.8em", color: "#b3b3b3", zIndex: 2, position: "relative" }}>
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