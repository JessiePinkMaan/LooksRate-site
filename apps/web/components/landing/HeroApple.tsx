"use client";

import { useRef, useState } from "react";

import { usePreferences } from "@loxrate/ui";

import { AppleImage } from "./AppleImage";

/**
 * Hero-яблоко: при наведении/фокусе вокруг загорается золотой свет,
 * с боков выезжают руки (как в «Сотворении Адама»), яблоко становится
 * надкушенным. Когда курсор уходит - снова целое. При reduced-motion/
 * выключенных эффектах - без анимаций, только смена изображения.
 */
export function HeroApple() {
  const { sound } = usePreferences();
  const [awake, setAwake] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const variant = awake ? "bitten" : "whole";

  const playHoverSound = (): void => {
    if (!sound || typeof window === "undefined") return;
    const audio = audioRef.current ?? new Audio("/assets/audio/apple-hover.mp3");
    audioRef.current = audio;
    audio.volume = 0.45;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* автоплей может быть запрещён - интерфейс не ломается */
    });
  };

  return (
    <div
      className="hero-apple"
      data-awake={awake ? "true" : "false"}
      onMouseEnter={() => {
        setAwake(true);
        playHoverSound();
      }}
      onMouseLeave={() => setAwake(false)}
    >
      <span className="hero-apple-rays" aria-hidden />
      <span className="hero-apple-glow" aria-hidden />
      <img
        className="hero-hand hero-hand-left"
        src="/assets/hand-left.webp"
        alt=""
        aria-hidden
        draggable={false}
      />
      <img
        className="hero-hand hero-hand-right"
        src="/assets/hand-right.webp"
        alt=""
        aria-hidden
        draggable={false}
      />

      <button
        type="button"
        className="hero-apple-button"
        data-hero-apple
        aria-pressed={awake}
        aria-label={
          awake
            ? "Яблоко надкушено. Руки тянутся к яблоку."
            : "Яблоко LoxRate. Наведи, чтобы увидеть руки."
        }
        onClick={() => {
          setAwake(true);
          playHoverSound();
        }}
        onFocus={() => {
          setAwake(true);
          playHoverSound();
        }}
        onBlur={() => setAwake(false)}
      >
        <AppleImage
          variant={variant}
          sizes="(max-width: 640px) 116px, 168px"
          width={168}
          height={168}
          className="hero-apple-image"
        />
      </button>
    </div>
  );
}
