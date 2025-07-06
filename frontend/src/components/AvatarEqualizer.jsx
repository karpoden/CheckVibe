import React, { useRef, useState, useEffect } from "react";

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
        if (!isPlaying || !audioElement) return;

        let cancelled = false;

        if (!window.audioContextRef) {
            window.audioContextRef = new (window.AudioContext || window.webkitAudioContext)();
        }
        const audioContext = window.audioContextRef;

  // ✅ Resume AudioContext обязательно
        if (audioContext.state === "suspended") {
            audioContext.resume().catch(console.warn);
        }

  // ✅ Проверка и пересоздание source только если нужно
        if (!audioElement._sourceNode || audioElement._sourceNode.context !== audioContext) {
            try {
            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(audioContext.destination);
            audioElement._sourceNode = source;
            } catch (e) {
                console.warn("MediaElementSource error", e.message);
            }
        }

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (audioElement._sourceNode) {
            try {
            audioElement._sourceNode.connect(analyser);
            } catch (e) {
                console.warn("Source already connected?", e.message);
            }
        }

        analyser.connect(audioContext.destination);

        const updateAudioData = () => {
            if (!cancelled) {
            analyser.getByteFrequencyData(dataArray);
            setAudioData([...dataArray]);
            setPhase((p) => p + 0.15);
            setGlowPhase((g) => g + 0.1);
            }
        };

        const interval = setInterval(updateAudioData, 40);

        return () => {
            cancelled = true;
            clearInterval(interval);
            try {
                analyser.disconnect();
            } catch {}
        };
        }, [isPlaying, audioElement]);


  // 🔵 Построение точек эквалайзера
  const points = Array.from({ length: 201 }).map((_, i) => {
    const angle = (i / 200) * 2 * Math.PI;
    const r = base + amp + (isPlaying ? Math.sin(phase + i / 4) * amp : 0);
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  });

  const avgAudio = audioData.reduce((a, b) => a + b, 0) / audioData.length / 255;
  const glowIntensity = isPlaying
    ? 0.4 + avgAudio * 1.2 + Math.sin(glowPhase) * 0.3
    : 0.4;
  const innerGlowRadius = isPlaying
    ? base +
      amp +
      avgAudio * amp * 2 +
      (isPlaying ? Math.sin(phase + 1) * amp * 0.5 : 0) -
      size * 0.01
    : base + size * 0.05;
  const colorPhase = Math.sin(glowPhase * 0.7 + avgAudio * 3) * 0.5 + 0.5;

  return (
    <svg width={size} height={size} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id="innerGlow" cx="50%" cy="50%" r="60%">
          <stop
            offset="0%"
            stopColor={colorPhase > 0.5 ? "#fc5c7d" : "#6a82fb"}
            stopOpacity={glowIntensity * 0.4}
          />
          <stop
            offset="30%"
            stopColor={colorPhase > 0.5 ? "#6a82fb" : "#fc5c7d"}
            stopOpacity={glowIntensity * 0.3}
          />
          <stop offset="70%" stopColor="#6a82fb" stopOpacity={glowIntensity * 0.1} />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eqgrad" x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
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
          <path
            d={`M ${points[0][0]},${points[0][1]} ${points.map((p) => `L ${p[0]},${p[1]}`).join(" ")} Z`}
            fill="white"
          />
        </mask>
      </defs>

      <circle
        cx={center}
        cy={center}
        r={innerGlowRadius}
        fill="url(#innerGlow)"
        mask="url(#lineMask)"
      />
      <path
        d={`M ${points[0][0]},${points[0][1]} ${points.map((p) => `L ${p[0]},${p[1]}`).join(" ")} Z`}
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
