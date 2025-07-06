import React, { useRef, useState, useEffect } from "react";
import { AvatarEqualizer } from "./AvatarEqualizer";

function Waveform({ src, progress, onSeek }) {
  const [peaks, setPeaks] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: 64 }, () =>
      16 + Math.round(Math.random() * 32)
    );
    setPeaks(arr);
  }, [src]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        height: 48,
        width: "100%",
        margin: "8px 0 4px 0",
        cursor: "pointer",
        gap: 1,
        userSelect: "none",
      }}
      onPointerDown={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.nativeEvent.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        onSeek(percent);
      }}
    >
      {peaks.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            background:
              i / peaks.length < progress
                ? "linear-gradient(180deg, #6a82fb 0%, #fc5c7d 100%)"
                : "#232526",
            boxShadow:
              i / peaks.length < progress
                ? "0 0 6px #6a82fb88"
                : "none",
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

export default function TrackPlayer({ src, avatarUrl, onPlay, onPause, shouldPause }) {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleMetadata = () => {
      setDuration(audio.duration);
      setProgress(0);
      setCurrent(0);
    };

    audio.addEventListener("loadedmetadata", handleMetadata);

    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      try {
        if (audio._sourceNode) {
          audio._sourceNode.disconnect();
          delete audio._sourceNode;
        }
      } catch (e) {
        console.warn("Error cleaning up audio node", e);
      }
    };
  }, [src]);

const handleWaveformSeek = async (percent) => {
  const audio = audioRef.current;
  if (!audio || !isFinite(duration)) return;

  // Перемотка трека
  audio.currentTime = percent * duration;
  setProgress(percent);

  // Возобновляем AudioContext, если он в состоянии suspended
  if (window.audioContextRef?.state === "suspended") {
    try {
      await window.audioContextRef.resume();
    } catch (e) {
      console.warn("AudioContext resume error:", e);
    }
  }

  // Если было на паузе — не запускаем автоматически (оставляем пользователю контроль)
};

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  };

  const handleAvatarClick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        if (onPlay) onPlay();
      }).catch((err) => {
        console.warn("Play error:", err);
      });
    }
  };

  useEffect(() => {
    if (shouldPause && isPlaying) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
        if (onPause) onPause();
      }
    }
  }, [shouldPause, isPlaying, onPause]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 10,
      width: 200,
      margin: "0 auto"
    }}>
      <div style={{ position: "relative", width: 200, height: 200, marginBottom: 8 }}>
        <img
          src={avatarUrl || "/vite.svg"}
          alt="avatar"
          onPointerDown={handleAvatarClick}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "3px solid #6a82fb",
            boxShadow: isPlaying
              ? "0 0 32px #fc5c7d, 0 0 16px #6a82fb"
              : "0 0 32px #fc5c7d55",
            position: "absolute",
            top: 60, left: 60,
            zIndex: 2,
            cursor: "pointer",
            transition: "box-shadow 0.2s",
            pointerEvents: "auto"
          }}
        />
        {!isPlaying && (
          <div
            style={{
              position: "absolute",
              top: 100 - 28,
              left: 100 - 28,
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(36,37,44,0.18)",
              borderRadius: "50%",
              zIndex: 3,
              pointerEvents: "none",
              transition: "opacity 0.25s",
              opacity: 1
            }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" style={{ opacity: 0.7 }}>
              <circle cx="19" cy="19" r="19" fill="#232526" opacity="0.18" />
              <polygon points="14,10 30,19 14,28" fill="#fff" opacity="0.85" />
            </svg>
          </div>
        )}
        <AvatarEqualizer isPlaying={isPlaying} size={200} audioElement={audioRef.current} />
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setProgress(0);
          setDuration(0);
          setCurrent(0);
        }}
        style={{ display: "none" }}
      />
      <Waveform src={src} progress={progress} onSeek={handleWaveformSeek} />
      <div style={{
        color: "#b3b3b3",
        fontSize: "0.97em",
        marginTop: 4,
        marginBottom: 6,
        width: "100%",
        textAlign: "center"
      }}>
        {fmt(current)} / {fmt(duration)}
      </div>
    </div>
  );
}
