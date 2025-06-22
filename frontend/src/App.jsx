import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [title, setTitle] = useState("");
  const [audios, setAudios] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("title", title);
    formData.append("telegram_id", "123456"); // потом заменим на реальный id из Telegram
    formData.append("username", "example_user");

    try {
      await axios.post("http://localhost:3001/upload", formData, {
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
      const res = await axios.get("http://localhost:3001/audios");
      setAudios(res.data);
    } catch (err) {
      console.error("Fetch error", err);
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
          placeholder="Название аудио"
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

      <h2>📂 Загруженные аудио</h2>
      <ul>
        {audios.map((audio) => (
          <li key={audio.id}>
            <strong>{audio.title}</strong> от {audio.user.username} —{" "}
            <audio controls src={`http://localhost:3001/uploads/${filename}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
