import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getUser, getTracksByUser, deleteTrack, promoteTrack } from "../api";
import { Star, Trash2, TrendingUp, Home, Plus, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TrackPlayer from "../components/TrackPlayer";
import { useOutletContext } from "react-router-dom";
// import FooterNav from "../components/FooterNav";

// const tg = window.Telegram.WebApp;
// const TELEGRAM_ID = tg.initDataUnsafe.user?.id;
//const TELEGRAM_ID = "123456"; // временный ID


export default function Profile() {
  const { telegramId } = useOutletContext();
  const [myCoins, setMyCoins] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [promoteAmounts, setPromoteAmounts] = useState({}); // { [trackId]: value }
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null); // ID текущего играющего трека
  const [autoplay, setAutoplay] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const location = useLocation();

  // Получить баланс и треки пользователя
  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await getUser(telegramId);
      setMyCoins(userRes.data.vibeCoins || 0);
      const tracksRes = await getTracksByUser(telegramId);
      setTracks(tracksRes.data || []);
    } catch {
      setMyCoins(0);
      setTracks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!telegramId) return;
    fetchData();
    // eslint-disable-next-line
  }, [telegramId]);

  // Удалить трек
  const handleDelete = async (id) => {
    if (!window.confirm("Удалить этот трек?")) return;
    try {
      await deleteTrack(id);
      setActionMsg("Трек удалён");
      fetchData();
    } catch (err){
      if (err.response && err.response.status === 404) {
      setActionMsg("Трек уже был удалён");
      fetchData();
    } else {
      setActionMsg("Ошибка при удалении");
      fetchData();
    }
    }
  };

  // Продвинуть трек (потратить N VibeCoins)
  const handlePromote = async (id) => {
    const amount = promoteAmounts[id] || 1;
    if (myCoins < amount) {
      setActionMsg("Недостаточно VibeCoins для продвижения");
      return;
    }
    try {
      await promoteTrack(id, telegramId, amount);
      setActionMsg(`Трек продвинут на ${amount} VibeCoin!`);
      fetchData();
    } catch {
      setActionMsg("Ошибка при продвижении");
    }
  };

  // Стили для неонового ползунка
  const sliderStyle = {
    width: "100%",
    accentColor: "#6a82fb",
    margin: "8px 0",
    background: "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)",
    borderRadius: "8px",
    height: "4px",
    outline: "none",
  };

  // Стили для навигационных кнопок
  // const navBtnStyle = (active) => ({
  //   background: active
  //     ? "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)"
  //     : "#232526",
  //   color: "#fff",
  //   boxShadow: active
  //     ? "0 0 12px #6a82fb88"
  //     : "0 0 8px #fc5c7d44",
  //   border: active
  //     ? "none"
  //     : "1.5px solid #fc5c7d88",
  //   padding: "10px 18px",
  //   borderRadius: "8px",
  //   fontWeight: "bold",
  //   fontSize: "1.25em",
  //   cursor: "pointer",
  //   transition: "box-shadow 0.2s, background 0.2s",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  // });

  if (!telegramId) {
    return <div style={{ color: "#fff" }}>Загрузка...</div>;
  }
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, paddingBottom: 120 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18
      }}>
        <h2 style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.3em",
          textShadow: "0 2px 12px #6a82fb66",
          margin: 0
        }}>
          Мои треки
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
      <div style={{
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
        <img src="/coin.svg" alt="coins" width="20" height="20" />
      </div>
      {actionMsg && (
        <div style={{
          color: "#fc5c7d",
          background: "#232526",
          borderRadius: 8,
          padding: "6px 12px",
          marginBottom: 18,
          textAlign: "center"
        }}>{actionMsg}</div>
      )}

      {loading ? (
        <div style={{ color: "#fff" }}>Загрузка...</div>
      ) : tracks.length === 0 ? (
        <div style={{ color: "#b3b3b3" }}>Нет опубликованных треков</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {tracks.map(track => {
            const promoteValue = promoteAmounts[track.id] || 1;
            return (
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
                      setCurrentTrackIndex(tracks.findIndex(t => t.id === track.id));
                    }}
                    onPause={() => setCurrentlyPlaying(null)}
                    onEnded={() => {
                      if (autoplay && currentTrackIndex < tracks.length - 1) {
                        const nextIndex = currentTrackIndex + 1;
                        setCurrentTrackIndex(nextIndex);
                        setCurrentlyPlaying(tracks[nextIndex].id);
                      } else {
                        setCurrentlyPlaying(null);
                      }
                    }}
                    shouldPause={currentlyPlaying !== null && currentlyPlaying !== track.id}
                    shouldPlay={autoplay && currentlyPlaying === track.id}
                  />
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: 20, 
                  alignItems: "center", 
                  fontSize: "1em", 
                  marginBottom: 16,
                  padding: "8px 12px",
                  background: "rgba(36,37,44,0.6)",
                  borderRadius: 8
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <img src="/thumbs-up.svg" alt="likes" width="16" height="16" />
                    <b style={{ color: "#6a82fb" }}>{track.likes}</b>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <img src="/rocket.svg" alt="views" width="16" height="16" />
                    <b style={{ color: "#fc5c7d" }}>{track.views}</b>
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="range"
                      min={1}
                      max={Math.max(1, myCoins)}
                      value={promoteValue}
                      onChange={e =>
                        setPromoteAmounts(a => ({
                          ...a,
                          [track.id]: Number(e.target.value)
                        }))
                      }
                      style={sliderStyle}
                    />
                    <div style={{
                      color: "#6a82fb",
                      fontWeight: 600,
                      fontSize: "0.9em",
                      marginTop: 4,
                      textAlign: "center",
                      background: "rgba(106,130,251,0.1)",
                      padding: "4px 8px",
                      borderRadius: 6
                    }}>
                      Продвинуть: {promoteValue} VibeCoin
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: myCoins >= promoteValue ? 1.05 : 1 }}
                    whileTap={{ scale: myCoins >= promoteValue ? 0.95 : 1 }}
                    onClick={() => handlePromote(track.id)}
                    disabled={myCoins < promoteValue}
                    style={{
                      background: myCoins >= promoteValue
                        ? "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)"
                        : "#444",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "1em",
                      cursor: myCoins >= promoteValue ? "pointer" : "not-allowed",
                      opacity: myCoins >= promoteValue ? 1 : 0.6,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 0 8px #6a82fb44",
                      marginLeft: 8
                    }}
                  >
                    <TrendingUp size={18} /> ОК
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(track.id)}
                  style={{
                    background: "#232526",
                    color: "#fff",
                    border: "1.5px solid #fc5c7d88",
                    boxShadow: "0 0 8px #fc5c7d44",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    width: "fit-content"
                  }}
                >
                  <Trash2 size={18} /> Удалить
                </motion.button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}