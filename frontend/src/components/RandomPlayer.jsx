import { useEffect, useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { useOutletContext } from "react-router-dom";
import { getRandomTrack, likeTrack, donateTrack, getUser, dislikeTrack } from '../api';
import { motion, AnimatePresence } from "framer-motion";
import TrackPlayer from "./TrackPlayer";
import axios from 'axios';
import { Star } from 'lucide-react';

export default function RandomPlayer() {
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myCoins, setMyCoins] = useState(0);
  const [noTracks, setNoTracks] = useState(false);
  const { telegramId, theme } = useOutletContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef();

  const fetchMyCoins = async () => {
    try {
      const res = await getUser(telegramId);
      setMyCoins(res.data.vibeCoins || 0);
    } catch {
      setMyCoins(0);
    }
  };

  const fetchTrack = async () => {
    try {
      setIsLoading(true);
      const res = await getRandomTrack(telegramId);
      setTrack(res.data);
      setNoTracks(false);

    } catch (err) {
      if (err.response?.status === 404 && err.response.data?.canReset) {
        setNoTracks(true);
        setTrack(null);
      } else {
        setTrack(null);
        setNoTracks(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (!track) return;
    if (direction === 'right') {
      await handleLike();
    } else if (direction === 'left') {
      await handleDislike();
    }
  };

  const handleLike = async () => {
    if (!track) return;
    try {
      await likeTrack(track.id, telegramId);
      await fetchMyCoins();
    } catch (err) {}
    await fetchTrack();
  };

  const handleDislike = async () => {
    if (!track) return;
    try {
      await dislikeTrack(track.id, telegramId);
      await fetchMyCoins();
    } catch (err) {}
    await fetchTrack();
  };

  const handleResetRatings = async () => {
    await axios.post('/api/tracks/reset-ratings', { telegramId });
    fetchTrack();
  };

  const handleDonate = async () => {
    if (!track || myCoins < 5) return;
    
    try {
      await likeTrack(track.id, telegramId);
      await donateTrack(track.id, telegramId);
      await fetchMyCoins();
      await fetchTrack();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (telegramId) {
      fetchTrack();
      fetchMyCoins();
    }
  }, [telegramId]);

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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 90 }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ color: theme === 'peach' ? "#2c3e50" : "#fff", marginTop: 40 }}
          >
            Загрузка трека...
          </motion.div>
        ) : noTracks ? (
          <motion.div
            key="no-tracks"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{
              background: "rgba(30,32,40,0.97)",
              borderRadius: 22,
              boxShadow: "0 4px 32px 0 rgba(106,130,251,0.25), 0 1.5px 8px 0 #fc5c7d44",
              border: "1.5px solid #6a82fb33",
              padding: "38px 32px 32px 32px",
              color: "#fff",
              textAlign: "center",
              maxWidth: 340,
              margin: "0 auto"
            }}>
              <h2 style={{
                fontSize: "1.3em",
                fontWeight: 700,
                marginBottom: 18,
                letterSpacing: "0.01em",
                color: theme === 'peach' ? "#2c3e50" : "#fff",
                textShadow: theme === 'peach' ? "0 1px 3px rgba(255,255,255,0.3)" : "0 2px 12px #6a82fb66"
              }}>
                Нет новых треков
              </h2>
              <p style={{ color: "#b3b3b3", fontSize: "1.05em", marginBottom: 22 }}>
                Вы оценили все доступные треки.<br />
                Хотите просмотреть их заново?
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                }}
              >
                Обнулить оценки и начать заново
              </motion.button>
            </div>
          </motion.div>
        ) : track ? (
          <motion.div
            key={`track-${track.id}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <TinderCard
              key={track.id}
              ref={cardRef}
              onSwipe={handleSwipe}
              preventSwipe={['up', 'down']}
              // swipeThreshold={30}
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
                  width: 320,
                  maxWidth: "98vw",
                  textAlign: "center",
                  backdropFilter: "blur(2px)",
                  overflow: "visible"
                }}
              >
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
                  fontWeight: 650,
                  fontSize: "1em",
                  color: "#6a82fb",
                  boxShadow: "0 0 8px #6a82fb44",
                  zIndex: 2,
                  pointerEvents: "none"
                }}>
                  <span>💰 {myCoins}</span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={handleDonate}
                    title="Донат автору 5 VibeCoins и лайк"
                    style={{...starBtnStyle(myCoins < 5), pointerEvents: "auto"}}
                    disabled={myCoins < 5}
                  >
                    <Star size={20} fill="#fff700" color="#fff700" />
                  </motion.button>
                </div>
                <h2 style={{
                  fontSize: "1.7em",
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: "0.01em",
                  color: "#fff",
                  textShadow: "0 2px 12px #6a82fb66",
                  marginTop: 34,
                  zIndex: 2,
                  position: "relative"
                }}>
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
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
                }}
              >
                👎
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
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
                }}
              >
                👍
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-track"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ color: theme === 'peach' ? "#2c3e50" : "#fff", marginTop: 40 }}
          >
            Нет доступных треков
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}