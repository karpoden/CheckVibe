import { useState } from 'react';
// import { useState, useEffect } from 'react';
import { uploadTrack } from '../api';
import { useOutletContext } from "react-router-dom";

export default function TrackUploader() {
  const { telegramId } = useOutletContext();
  const [title, setTitle] = useState('');
  // const [telegramId, setTelegramId] = useState('');
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState('');


  // useEffect(() => {
  //   const tg = window.Telegram?.WebApp;
  //   const id = tg?.initDataUnsafe?.user?.id;

  //   if (id) {
  //     setTelegramId(String(id));
  //   }
  // }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    console.log('telegramId:', telegramId);
    console.log('title:', title);
    console.log('audio:', audio);

    if (!audio?.type.startsWith('audio/')) {
      setMessage('❌ Пожалуйста, выберите аудиофайл');
      return;
    }
    if (!telegramId) {
      setMessage('❌ Не удалось определить Telegram ID');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('telegramId', telegramId);
    formData.append('audio', audio);

    try {
      await uploadTrack(formData);
      setMessage('✅ Трек загружен');
      setTitle('');
      // setTelegramId(telegramId);
      setAudio(null);
    } catch (err) {
      setMessage('❌ Ошибка при загрузке');
    }
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "1.5px solid #6a82fb55",
    marginBottom: "12px",
    fontSize: "1em",
    background: "#232526",
    color: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    background: "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)",
    color: "#fff",
    boxShadow: "0 0 12px #6a82fb88",
    border: "none",
    padding: "12px 0",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1.1em",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    width: "100%",
    marginTop: "8px"
  };

  return (
    <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <input
        type="text"
        placeholder="Название трека"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={inputStyle}
      />
      {/* <input
        type="text"
        placeholder="Telegram ID"
        value={telegramId}
        onChange={(e) => setTelegramId(e.target.value)}
        required
        style={inputStyle}
      /> */}
      <input
        type="file"
        accept=".mp3, .wav, .ogg, .m4a, audio/*"
        onChange={(e) => setAudio(e.target.files[0])}
        required
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>Загрузить</button>
      {message && <p style={{ color: "#fff", marginTop: 8, textAlign: "center" }}>{message}</p>}
    </form>
  );
}