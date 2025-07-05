import React, { useRef, useState, useEffect } from "react";

// SVG эквалайзер-волна вокруг аватарки
export function AvatarEqualizer({ isPlaying, size = 200, audioElement }) {
  const [phase, setPhase] = useState(0);
  const [glowPhase, setGlowPhase] = useState(0);
  const [audioData, setAudioData] = useState(new Array(32).fill(0));
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const center = size / 2;
  const base = size * 0.41;
  const amp = isPlaying ? size * 0.045 : 0;

  useEffect(() => {
    if (!isPlaying || !audioElement) {
      // Очищаем данные при остановке
      setAudioData(new Array(32).fill(0));
      return;
    }
    
    // Проверяем, не создан ли уже контекст для этого элемента
    if (audioElement._audioContextCreated) {
      // Просто запускаем обновление данных
      const updateAudioData = () => {
        try {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            setAudioData([...dataArrayRef.current]);
            setPhase(p => p + 0.15);
            setGlowPhase(g => g + 0.1);
          }
        } catch (e) {
          console.warn('Error updating audio data:', e);
        }
      };
      
      const interval = setInterval(updateAudioData, 40);
      return () => clearInterval(interval);
    }
    
    try {
      // Создаем анализатор аудио
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioElement);
      
      // Помечаем элемент как уже связанный с контекстом
      audioElement._audioContextCreated = true;
    
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      const updateAudioData = () => {
        try {
          if (analyserRef.current && dataArrayRef.current && audioContext.state !== 'closed') {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            setAudioData([...dataArrayRef.current]);
            setPhase(p => p + 0.15);
            setGlowPhase(g => g + 0.1);
          }
        } catch (e) {
          console.warn('Error updating audio data:', e);
        }
      };
      
      const interval = setInterval(updateAudioData, 40);
      return () => {
        clearInterval(interval);
      };
    } catch (e) {
      console.warn('Error creating audio context:', e);
      return;
    }
  }, [isPlaying, audioElement]);

  const points = Array.from({ length: 200 }).map((_, i) => {
    const angle = (i / 200) * 2 * Math.PI;
    const r = base + amp + (isPlaying ? Math.sin(phase + i / 4) * amp : 0);
    return [
      center + Math.cos(angle) * r,
      center + Math.sin(angle) * r
    ];
  });

  const avgAudio = audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
  const glowIntensity = isPlaying ? 0.4 + avgAudio * 1.2 + Math.sin(glowPhase) * 0.3 : 0.4;
  const innerGlowRadius = isPlaying ? base + amp + avgAudio * amp * 2 + (isPlaying ? Math.sin(phase + 1) * amp * 0.5 : 0) - size * 0.01 : base + size * 0.05;
  const colorPhase = Math.sin(glowPhase * 0.7 + avgAudio * 3) * 0.5 + 0.5;

  return (
    <svg width={size} height={size} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id="innerGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={colorPhase > 0.5 ? "#fc5c7d" : "#6a82fb"} stopOpacity={glowIntensity * 0.4} />
          <stop offset="30%" stopColor={colorPhase > 0.5 ? "#6a82fb" : "#fc5c7d"} stopOpacity={glowIntensity * 0.3} />
          <stop offset="70%" stopColor="#6a82fb" stopOpacity={glowIntensity * 0.1} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eqgrad" x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
          <stop stopColor="#6a82fb" />
          <stop offset="1" stopColor="#fc5c7d" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
        <mask id="lineMask">
          <path
            d={`M ${points[0][0]},${points[0][1]} ${points.map(p => `L ${p[0]},${p[1]}`).join(' ')} Z`}
            fill="white"
          />
        </mask>
      </defs>
      <circle
        cx={center}
        cy={center}
        r={base + amp * 2}
        fill="url(#innerGlow)"
        mask="url(#lineMask)"
      />
      <path
        d={`M ${points[0][0]},${points[0][1]} ${points.map(p => `L ${p[0]},${p[1]}`).join(' ')} Z`}
        fill="none"
        stroke="url(#eqgrad)"
        strokeWidth={size * 0.012}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#glow)"
      />
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

export default function TrackPlayer({ src, avatarUrl, onPlay, onPause, shouldPause,  onEnded, shouldPlay }) {
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
    
    // Настройка Media Session API для фонового воспроизведения
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'CheckVibe Track',
        artist: 'Unknown Artist',
        artwork: [
          { src: avatarUrl || '/vite.svg', sizes: '96x96', type: 'image/png' }
        ]
      });
      
      navigator.mediaSession.setActionHandler('play', () => {
        if (audio && audio.paused) {
          audio.play();
          setIsPlaying(true);
          if (onPlay) onPlay();
        }
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audio && !audio.paused) {
          audio.pause();
          setIsPlaying(false);
          if (onPause) onPause();
        }
      });
    }
    
    // Отслеживание смены видимости страницы
    const handleVisibilityChange = () => {
      if (document.hidden && audio && !audio.paused) {
        // При сворачивании приложения проверяем состояние
        setTimeout(() => {
          if (audio.paused && isPlaying) {
            setIsPlaying(false);
            if (onPause) onPause();
          }
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      audio.removeEventListener("timeupdate", update);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [avatarUrl]);

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
      if (onPause) onPause();
    } else {
      audio.play();
      setIsPlaying(true);
      if (onPlay) onPlay();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isPlaying) audio.pause();
  }, [isPlaying]);

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

  useEffect(() => {
  if (shouldPlay && !isPlaying) {
      const audio = audioRef.current;
      if (audio) {
        audio.play();
        setIsPlaying(true);
        if (onPlay) onPlay();
      }
    }
  }, [shouldPlay, isPlaying, onPlay]);

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
          onTouchEnd={handleAvatarClick}
          onClick={handleAvatarClick}
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
        <AvatarEqualizer isPlaying={isPlaying} size={200} audioElement={audioRef.current} />
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
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