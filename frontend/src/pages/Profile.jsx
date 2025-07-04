import { useEffect, useState } from "react";
import { getUser, getTracksByUser, deleteTrack, promoteTrack } from "../api";
import { Star, Trash2, TrendingUp, Home, Plus, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import TrackPlayer from "../components/TrackPlayer";
import { useOutletContext } from "react-router-dom";

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

  if (!telegramId) {
    return <div style={{ color: "#fff" }}>Загрузка...</div>;
  }
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <h2 style={{
        color: "#fff",
        fontWeight: 700,
        fontSize: "1.3em",
        marginBottom: 18,
        textShadow: "0 2px 12px #6a82fb66"
      }}>
        Профиль
      </h2>
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
        <Star size={20} color="#fff700" fill="#fff700" />
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
      <h3 style={{ color: "#fff", marginBottom: 12, fontWeight: 600 }}>Мои треки</h3>
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
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                boxShadow: "0 2px 12px #6a82fb33",
                border: "1.5px solid #6a82fb33",
                position: "relative"
              }}>
                <div style={{ fontWeight: 600, fontSize: "1.08em", marginBottom: 6 }}>
                  {track.title}
                </div>
                <TrackPlayer
                  src={track.fileUrl} // URL трека src={track.fileUrl}
                  avatarUrl={"/vite.svg"} // или свойство с аватаркой автора, если есть
                />
                <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: "0.97em", marginBottom: 6 }}>
                  <span>Лайки: <b style={{ color: "#6a82fb" }}>{track.likes}</b></span>
                  <span>Продвижение: <b style={{ color: "#fc5c7d" }}>{track.views}</b></span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
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
                      gap: 6
                    }}
                  >
                    <Trash2 size={18} /> Удалить
                  </button>
                  <div style={{ flex: 1, minWidth: 80 }}>
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
                      fontSize: "0.97em",
                      marginTop: 2,
                      textAlign: "center"
                    }}>
                      Продвинуть: {promoteValue} VibeCoin
                    </div>
                  </div>
                  <button
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
                      boxShadow: "0 0 8px #6a82fb44"
                    }}
                  >
                    <TrendingUp size={18} /> ОК
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Меню навигации */}
      <div style={{ display: "flex", gap: 24, marginTop: 36, justifyContent: "center" }}>
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