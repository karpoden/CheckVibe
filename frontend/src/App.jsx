import { useState, useEffect } from "react";
import axios from "axios";

const TELEGRAM_ID = "123456"; // временно фиксируем
const USERNAME = "example_user";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [title, setTitle] = useState("");
  const [audios, setAudios] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("name", title);
    formData.append("telegramId", TELEGRAM_ID);

    try {
      await axios.post("http://localhost:5173/api/tracks/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setAudioFile(null);
      fetchAudios();
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  const fetchAudios = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5173/api/tracks/by-user/${TELEGRAM_ID}`
      );
      setAudios(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleLike = async (trackId) => {
    try {
      await axios.post(`http://localhost:5173/api/tracks/${trackId}/like`, {
        telegramId: TELEGRAM_ID,
      });
      fetchAudios(); // обновим после лайка
    } catch (err) {
      console.error("Like error", err);
    }
  };

  useEffect(() => {
    fetchAudios();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🎧 Telegram Audio Upload</h1>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Название трека"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
          required
        />
        <button type="submit">Загрузить</button>
      </form>

      <hr />

      <h2>📂 Загруженные треки</h2>
      <ul>
        {audios.map((audio) => (
          <li key={audio._id}>
            <strong>{audio.name}</strong> —{" "}
            <audio
              controls
              src={`http://localhost:5173/uploads/${audio.filename}`}
            />
            <div>
              ❤️ {audio.likes}{" "}
              <button onClick={() => handleLike(audio._id)}>Like</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
