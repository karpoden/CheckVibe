import React, { useRef, useState, useEffect } from "react";

export function AvatarEqualizer({ isPlaying, size = 200, audioElement }) {
  const [phase, setPhase] = useState(0);
  const [glowPhase, setGlowPhase] = useState(0);
  const [audioData, setAudioData] = useState(new Array(32).fill(0));
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || !audioElement) return;

    let cancelled = false;

    const setupAnalyser = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Avoid recreating if already connected
      if (!analyserRef.current || !dataArrayRef.current) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        try {
          // Only create MediaElementSource once
          if (!sourceNodeRef.current) {
            sourceNodeRef.current = audioContext.createMediaElementSource(audioElement);
            sourceNodeRef.current.connect(analyser);
            analyser.connect(audioContext.destination);
          }
        } catch (e) {
          console.warn("MediaElementSource error (likely already connected):", e.message);
        }
      }

      const update = () => {
        if (!cancelled && analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          setAudioData([...dataArrayRef.current]);
          setPhase(p => p + 0.15);
          setGlowPhase(g => g + 0.1);
        }
      };

      intervalRef.current = setInterval(update, 40);
    };

    setupAnalyser();

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, [isPlaying, audioElement]);

  const center = size / 2;
  const base = size * 0.41;
  const amp = isPlaying ? size * 0.045 : 0;

  const points = Array.from({ length: 201 }).map((_, i) => {
    const angle = (i / 200) * 2 * Math.PI;
    const r = base + amp + Math.sin(phase + i / 4) * amp;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  });

  const avgAudio = audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
  const glowIntensity = isPlaying ? 0.4 + avgAudio * 1.2 + Math.sin(glowPhase) * 0.3 : 0.4;
  const colorPhase = Math.sin(glowPhase * 0.7 + avgAudio * 3) * 0.5 + 0.5;

  return (
    <svg width={size} height={size}>
      <defs>
        <radialGradient id="innerGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={colorPhase > 0.5 ? "#fc5c7d" : "#6a82fb"} stopOpacity={glowIntensity * 0.4} />
          <stop offset="30%" stopColor={colorPhase > 0.5 ? "#6a82fb" : "#fc5c7d"} stopOpacity={glowIntensity * 0.3} />
          <stop offset="70%" stopColor="#6a82fb" stopOpacity={glowIntensity * 0.1} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eqgrad" x1="0" y1="0" x2={size} y2={size}>
          <stop stopColor="#6a82fb" />
          <stop offset="1" stopColor="#fc5c7d" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <mask id="lineMask">
          <path d={`M ${points[0][0]},${points[0][1]} ${points.map(p => `L ${p[0]},${p[1]}`).join(' ')} Z`} fill="white" />
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
