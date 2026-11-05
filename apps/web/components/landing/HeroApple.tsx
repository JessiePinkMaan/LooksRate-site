"use client";

import { useState } from "react";

/**
 * Hero-яблоко: при наведении/фокусе вокруг загорается золотой свет,
 * с боков выезжают руки (как в «Сотворении Адама»), яблоко становится
 * надкушенным. При reduced-motion/выключенных эффектах — без анимаций.
 */
export function HeroApple() {
  const [awake, setAwake] = useState(false);

  return (
    <div
      className="hero-apple"
      data-awake={awake ? "true" : "false"}
      onMouseEnter={() => setAwake(true)}
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
        aria-pressed={awake}
        aria-label={
          awake
            ? "Яблоко надкушено. Руки тянутся к яблоку."
            : "Яблоко LoxRate. Наведи, чтобы увидеть руки."
        }
        onClick={() => setAwake((value) => !value)}
        onFocus={() => setAwake(true)}
        onBlur={() => setAwake(false)}
      >
        <img
          className="hero-apple-image"
          src={awake ? "/assets/apple-bitten.webp" : "/assets/apple-photo.webp"}
          alt=""
          width={168}
          height={173}
          draggable={false}
        />
      </button>
    </div>
  );
}
