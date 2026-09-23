"use client";

import { useMemo } from "react";
import { useGameStore } from "@/lib/store";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export default function WeatherOverlay() {
  const weather = useGameStore((s) => s.weather?.current ?? "");
  const isStorm = weather.includes("Badai");
  const isRain = weather.includes("Hujan") || isStorm;
  const isSnow = weather.includes("Bersalju");

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: i * 2.5 + Math.random() * 2,
        delay: Math.random() * 4,
        duration: 0.9 + Math.random() * 0.5,
      })),
    [],
  );

  if (!isRain && !isSnow) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
    >
      {particles.map((p) =>
        isSnow ? (
          <span
            key={p.id}
            className="weather-snow-flake"
            style={{
              left: `${p.left}%`,
              animationDelay: `${-p.delay}s`,
              animationDuration: `${4 + p.duration * 2}s`,
            }}
          />
        ) : (
          <span
            key={p.id}
            className="weather-rain-drop"
            style={{
              left: `${p.left}%`,
              animationDelay: `${-p.delay * 0.5}s`,
              animationDuration: `${isStorm ? p.duration * 0.55 : p.duration}s`,
              opacity: isStorm ? 0.9 : 0.65,
            }}
          />
        ),
      )}
    </div>
  );
}
