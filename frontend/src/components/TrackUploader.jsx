import { useState } from 'react';
import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';
import { uploadTrack } from '../api';
import { useOutletContext } from "react-router-dom";

export default function TrackUploader() {
  const { telegramId } = useOutletContext();
  const [title, setTitle] = useState('');
  // const [telegramId, setTelegramId] = useState('');
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);


  // useEffect(() => {
  //   const tg = window.Telegram?.WebApp;
  //   const id = tg?.initDataUnsafe?.user?.id;

  //   if (id) {
  //     setTelegramId(String(id));
  //   }
  // }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!audio?.type.startsWith('audio/')) {
      setMessage('❌ Пожалуйста, выберите аудиофайл');
      return;
    }
    if (!telegramId) {
      setMessage('❌ Не удалось определить Telegram ID');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage('');

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('telegramId', telegramId);
    formData.append('audio', audio);

    try {
      await uploadTrack(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setMessage('✅ Трек загружен');
        setTitle('');
        setAudio(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      console.error('Upload error:', err);
      clearInterval(progressInterval);
      setMessage(`❌ Ошибка: ${err.response?.data?.error || err.message || 'Неизвестная ошибка'}`);
      setIsUploading(false);
      setUploadProgress(0);
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
      {isUploading && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            width: "100%",
            height: 8,
            background: "#232526",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)",
              borderRadius: 4,
              transition: "width 0.3s ease",
              boxShadow: "0 0 8px #6a82fb44"
            }} />
          </div>
          <p style={{ color: "#6a82fb", fontSize: "0.9em", textAlign: "center", margin: 0 }}>
            Загрузка... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
      <motion.button 
        whileHover={{ scale: isUploading ? 1 : 1.05 }}
        whileTap={{ scale: isUploading ? 1 : 0.95 }}
        type="submit" 
        disabled={isUploading}
        style={{
          ...buttonStyle,
          opacity: isUploading ? 0.6 : 1,
          cursor: isUploading ? "not-allowed" : "pointer"
        }}
      >
        {isUploading ? "Загружается..." : "Загрузить"}
      </motion.button>
      {message && <p style={{ color: "#fff", marginTop: 8, textAlign: "center" }}>{message}</p>}
    </form>
  );
}