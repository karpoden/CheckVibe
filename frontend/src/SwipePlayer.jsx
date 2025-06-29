import { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import { getTracksByUser, likeTrack } from "./api";

const TELEGRAM_ID = "123456"; // временный ID

function SwipePlayer() {
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      // Получаем треки пользователя (можно заменить на другой источник)
      const res = await getTracksByUser(TELEGRAM_ID);
      setTracks(res.data.reverse());
      setIndex(0);
    } catch (err) {
      setTracks([]);
    }
  };

  const handleSwipe = async (dir, track) => {
    if (dir === "right") {
      try {
        await likeTrack(track.id, TELEGRAM_ID);
        console.log("Liked:", track.title);
      } catch (err) {
        console.error("Like error", err);
      }
    } else {
      console.log("Skipped:", track.title);
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="swipe-container" style={{ width: 400, margin: "0 auto" }}>
      {tracks.length === 0 || index >= tracks.length ? (
        <p>Нет треков для отображения</p>
      ) : (
        tracks.slice(index).map((track) => (
          <TinderCard
            key={track.id}
            onSwipe={(dir) => handleSwipe(dir, track)}
            preventSwipe={["up", "down"]}
          >
            <div
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                marginBottom: 20,
              }}
            >
              <h3>{track.title}</h3>
              <audio controls src={track.fileUrl} />
              <p>Автор: {track.user?.telegram_id || "Неизвестно"}</p>
              <span style={{ color: "green" }}>VibeCoins: {track.likes}</span>
            </div>
          </TinderCard>
        ))
      )}
    </div>
  );
}

export default SwipePlayer;