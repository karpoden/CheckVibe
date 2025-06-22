import { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import axios from "axios";

const TELEGRAM_ID = "123456";

function SwipePlayer() {
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await axios.get("http://localhost:5173/api/tracks/all");
      setTracks(res.data.reverse()); // последний вверх
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleSwipe = async (dir, track) => {
    if (dir === "right") {
      try {
        await axios.post(`http://localhost:5173/api/tracks/${track._id}/like`, {
          telegramId: TELEGRAM_ID,
        });
        console.log("Liked:", track.name);
      } catch (err) {
        console.error("Like error", err);
      }
    } else {
      console.log("Skipped:", track.name);
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="swipe-container" style={{ width: 400, margin: "0 auto" }}>
      {tracks.length === 0 ? (
        <p>Загрузка треков...</p>
      ) : (
        tracks.slice(index).map((track) => (
          <TinderCard
            key={track._id}
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
              <h3>{track.name}</h3>
              <audio controls src={`http://localhost:5173/uploads/${track.filename}`} />
              <p>Автор: {track.user?.telegramId}</p>
              {track.user?.canReceiveVibes ? (
                <span style={{ color: "green" }}>✅ Принимает VibeCoins</span>
              ) : (
                <span style={{ color: "gray" }}>🚫 Не принимает VibeCoins</span>
              )}
            </div>
          </TinderCard>
        ))
      )}
    </div>
  );
}

export default SwipePlayer;
