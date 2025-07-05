import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getUser } from "../api";
import TrackPlayer from "../components/TrackPlayer";
import { useOutletContext } from "react-router-dom";
import axios from 'axios';

export default function Liked() {
  const { telegramId } = useOutletContext();
  const [myCoins, setMyCoins] = useState(0);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await getUser(telegramId);
      setMyCoins(userRes.data.vibeCoins || 0);
      
      // Получаем лайкнутые треки
      const likedRes = await axios.get(`/api/tracks/liked/${telegramId}`);
      setLikedTracks(likedRes.data || []);
    } catch {
      setMyCoins(0);
      setLikedTracks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!telegramId) return;
    fetchData();
  }, [telegramId]);

  if (!telegramId) {
    return <div style={{ color: "#fff" }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, paddingBottom: 120 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <h2 style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.3em",
          textShadow: "0 2px 12px #6a82fb66",
          margin: 0
        }}>
          Понравившиеся треки
        </h2>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span style={{ color: "#fff", fontSize: "0.9em" }}>Автопроигрывание</span>
          <div style={{
            width: 40,
            height: 20,
            background: autoplay ? "#6a82fb" : "#444",
            borderRadius: 10,
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s"
          }} onClick={() => setAutoplay(!autoplay)}>
            <div style={{
              width: 16,
              height: 16,
              background: "#fff",
              borderRadius: "50%",
              position: "absolute",
              top: 2,
              left: autoplay ? 22 : 2,
              transition: "left 0.2s"
            }} />
          </div>
        </label>
      </div>
      {/* <div style={{
        background: "rgba(36,37,44,0.85)",
        borderRadius: 10,
        padding: "10px 18px",
        color: "#fff",
        fontWeight: 500,
        fontSize: "1.1em",
        marginBottom: 24,
        boxShadow: "0 0 8px #6a82fb44",
        display: "flex",
        alignItems: "center",
        gap: 10
      }}>
        Баланс: <span style={{ color: "#6a82fb", fontWeight: 700 }}>{myCoins} VibeCoins</span>
        <span>⭐</span>
      </div> */}
      
      {loading ? (
        <div style={{ color: "#fff" }}>Загрузка...</div>
      ) : likedTracks.length === 0 ? (
        <div style={{ color: "#b3b3b3" }}>Нет понравившихся треков</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {likedTracks.map(track => (
            <div key={track.id} style={{
              background: "rgba(30,32,40,0.95)",
              borderRadius: 16,
              padding: 20,
              color: "#fff",
              boxShadow: "0 4px 16px #6a82fb33",
              border: "1.5px solid #6a82fb33",
              position: "relative"
            }}>
              <div style={{ fontWeight: 700, fontSize: "1.2em", marginBottom: 12, color: "#fff", textShadow: "0 2px 8px #6a82fb44" }}>
                {track.title}
              </div>
              <div style={{ margin: "16px 0" }}>
                <TrackPlayer
                  src={track.fileUrl}
                  avatarUrl={"/vite.svg"}
                  onPlay={() => {
                    setCurrentlyPlaying(track.id);
                    setCurrentTrackIndex(likedTracks.findIndex(t => t.id === track.id));
                  }}
                  onPause={() => setCurrentlyPlaying(null)}
                  onEnded={() => {
                    if (autoplay && currentTrackIndex < likedTracks.length - 1) {
                      const nextIndex = currentTrackIndex + 1;
                      setCurrentTrackIndex(nextIndex);
                      setCurrentlyPlaying(likedTracks[nextIndex].id);
                    } else {
                      setCurrentlyPlaying(null);
                    }
                  }}
                  shouldPause={currentlyPlaying !== null && currentlyPlaying !== track.id}
                  shouldPlay={autoplay && currentlyPlaying === track.id}
                />
              </div>
              {/* <div style={{ 
                display: "flex", 
                gap: 20, 
                alignItems: "center", 
                fontSize: "1em", 
                padding: "8px 12px",
                background: "rgba(36,37,44,0.6)",
                borderRadius: 8
              }}>
                <span>👍 <b style={{ color: "#6a82fb" }}>{track.likes}</b></span>
                <span>🚀 <b style={{ color: "#fc5c7d" }}>{track.views}</b></span>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}