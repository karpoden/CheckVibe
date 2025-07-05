import React, { useRef, useState, useEffect } from "react";

// SVG эквалайзер-волна вокруг аватарки
export function AvatarEqualizer({ isPlaying, size = 200 }) {
  const [phase, setPhase] = useState(0);
  const center = size / 2;
  const base = size * 0.41;
  const amp = isPlaying ? size * 0.045 : 0;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setPhase(p => p + 0.15), 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const points = Array.from({ length: 96 }).map((_, i) => {
    const angle = (i / 96) * 2 * Math.PI;
    const r = base + amp + (isPlaying ? Math.sin(phase + i / 3) * amp : 0);
    return [
      center + Math.cos(angle) * r,
      center + Math.sin(angle) * r
    ];
  });

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <polygon
        points={points.map(p => p.join(",")).join(" ")}
        fill="none"
        stroke="url(#eqgrad)"
        strokeWidth={size * 0.012}
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="eqgrad" x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
          <stop stopColor="#6a82fb" />
          <stop offset="1" stopColor="#fc5c7d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Волновая форма (waveform)
function Waveform({ src, progress, onSeek }) {
  const [peaks, setPeaks] = React.useState([]);

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

export default function TrackPlayer({ src, avatarUrl }) {
  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      setCurrent(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    return () => {
      audio.removeEventListener("timeupdate", update);
    };
  }, []);

  const handleWaveformSeek = (percent) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = percent * duration;
    setProgress(percent);
  };

  const fmt = (s) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  };

  // Play/Pause по тапу на аватарку
  const handleAvatarClick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isPlaying) audio.pause();
  }, [isPlaying]);

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
        {/* Полупрозрачная иконка play поверх аватарки */}
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
        <AvatarEqualizer isPlaying={isPlaying} size={200} />
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
      {/* Волна */}
      <Waveform src={src} progress={progress} onSeek={handleWaveformSeek} />
      {/* Время под волной */}
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