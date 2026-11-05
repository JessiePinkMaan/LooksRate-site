/**
 * Процедурные ассеты-заглушки (ТЗ §25: реальные ассеты заменяют их позже).
 * Всё генерируется локально, без внешних CDN и без чужих фото (AGENTS.md п.3, п.10).
 * Реальные ассеты помечены ASSET_NEEDED в ASSETS_TODO.md.
 *
 * Куда кладём: apps/web/public/assets (см. DECISIONS D-3).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../../../apps/web/public/assets");
const audioDir = resolve(outDir, "audio");
const vendorDir = resolve(here, "../vendor");

function writeSvg(name: string, content: string): void {
  writeFileSync(resolve(outDir, name), content.trim() + "\n", "utf8");
  console.log(`  + ${name}`);
}

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------

const APPLE_BODY =
  "M128 72c-24-26-72-20-84 20-12 44 16 108 84 128 68-20 96-84 84-128-12-40-60-46-84-20Z";

function apple(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Золотое яблоко LoxRate">
  <defs>
    <radialGradient id="apple" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#F0D27A"/>
      <stop offset="34%" stop-color="#C9A227"/>
      <stop offset="70%" stop-color="#B3121B"/>
      <stop offset="100%" stop-color="#2E0407"/>
    </radialGradient>
    <radialGradient id="shine" cx="30%" cy="22%" r="30%">
      <stop offset="0%" stop-color="#FFF4CC" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#FFF4CC" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path d="${APPLE_BODY}" fill="url(#apple)"/>
  <ellipse cx="88" cy="104" rx="34" ry="22" fill="url(#shine)" transform="rotate(-22 88 104)"/>
  <path d="M128 72c0-20 8-36 28-42" fill="none" stroke="#5C4310" stroke-width="8" stroke-linecap="round"/>
  <path d="M140 58c16-20 40-24 52-18-6 22-32 30-52 18Z" fill="#6E0A10"/>
  <text x="128" y="206" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="5" fill="#2E0407" opacity="0.55">ΚΑΛΛΙΣΤΗ</text>
</svg>`;
}

function appleOutline(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Контур яблока">
  <path d="${APPLE_BODY}" fill="none" stroke="#C9A227" stroke-width="2.5" opacity="0.9"/>
  <path d="M128 72c0-20 8-36 28-42" fill="none" stroke="#C9A227" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
</svg>`;
}

function logo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 96" role="img" aria-label="LOXRATE">
  <defs>
    <radialGradient id="logoApple" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#F0D27A"/>
      <stop offset="40%" stop-color="#C9A227"/>
      <stop offset="76%" stop-color="#B3121B"/>
      <stop offset="100%" stop-color="#2E0407"/>
    </radialGradient>
  </defs>
  <g transform="translate(4 4) scale(0.34)">
    <path d="${APPLE_BODY}" fill="url(#logoApple)"/>
    <path d="M128 72c0-20 8-36 28-42" fill="none" stroke="#5C4310" stroke-width="8" stroke-linecap="round"/>
  </g>
  <text x="98" y="62" font-family="ui-monospace, 'Cascadia Code', Consolas, monospace" font-size="40" letter-spacing="9" fill="#E9E4DA">LOXRATE</text>
</svg>`;
}

/**
 * Силуэты основателей берутся из CC0-оригиналов в `packages/assets/vendor`
 * (см. vendor/LICENSE.md) и перекрашиваются в тёмный брендовый градиент.
 * Динамический rim-свет — задача сцены (Фаза 4), в ассет не запекается.
 */
function extractSilhouette(file: string): {
  d: string;
  width: number;
  height: number;
} {
  const raw = readFileSync(resolve(vendorDir, file), "utf8");
  const dMatch = /<path[^>]*\sd="([^"]+)"/.exec(raw);
  const widthMatch = /<svg[^>]*\swidth="([\d.]+)"/.exec(raw);
  const heightMatch = /<svg[^>]*\sheight="([\d.]+)"/.exec(raw);

  if (!dMatch) {
    throw new Error(`В ${file} не найден <path d="…">`);
  }

  return {
    d: dMatch[1] ?? "",
    width: Number(widthMatch?.[1] ?? 200),
    height: Number(heightMatch?.[1] ?? 400),
  };
}

function styledSilhouette(
  file: string,
  variant: "a" | "b",
  mirrored: boolean,
): string {
  const { d, width, height } = extractSilhouette(file);
  const transform = mirrored
    ? ` transform="translate(${width} 0) scale(-1 1)"`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Силуэт основателя (CC0, плейсхолдер)">
  <defs>
    <linearGradient id="sil-${variant}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c0c0e"/>
      <stop offset="70%" stop-color="#08080a"/>
      <stop offset="100%" stop-color="#040405"/>
    </linearGradient>
  </defs>
  <path${transform} d="${d}" fill="url(#sil-${variant})"/>
</svg>`;
}

function marbleBust(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 300" role="img" aria-label="Мраморный бюст (ASSET_NEEDED)">
  <defs>
    <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E9E4DA"/>
      <stop offset="55%" stop-color="#CFC6B4"/>
      <stop offset="100%" stop-color="#6E727A"/>
    </linearGradient>
  </defs>
  <path d="M110 18C76 18 54 46 54 84c0 30 18 55 40 64v26c-30 8-62 26-74 62l-12 46h204l-12-46c-12-36-44-54-74-62v-26c22-9 40-34 40-64 0-38-22-66-56-66Z" fill="url(#marble)"/>
  <path d="M88 66c8-6 16-9 22-9M110 57v40M96 104c8 6 20 6 28 0" fill="none" stroke="#6E727A" stroke-width="2" opacity="0.5"/>
  <path d="M74 150c24 12 48 12 72 0" fill="none" stroke="#6E727A" stroke-width="2" opacity="0.4"/>
</svg>`;
}

function lockIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="Закрыто">
  <rect x="10" y="22" width="28" height="20" rx="2" fill="none" stroke="#B3121B" stroke-width="2.5"/>
  <path d="M17 22v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#B3121B" stroke-width="2.5"/>
  <circle cx="24" cy="31" r="2.5" fill="#B3121B"/>
  <path d="M24 31v5" stroke="#B3121B" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;
}

function grain(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.32"/>
</svg>`;
}

function concrete(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <filter id="concrete">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="5" seed="7"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.09  0 0 0 0 0.095  0 0 0 0.9 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#concrete)"/>
</svg>`;
}

function lamp(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Свет лампы (ASSET_NEEDED)">
  <defs>
    <radialGradient id="lamp" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E9E4DA" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#C9A227" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#030303" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#lamp)"/>
</svg>`;
}

// ---------------------------------------------------------------------------
// WAV (процедурные звуки-заглушки, < 150 КБ, выключены по умолчанию)
// ---------------------------------------------------------------------------

function writeWav(name: string, samples: Float32Array, sampleRate = 22050): void {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  writeFileSync(resolve(audioDir, name), buffer);
  console.log(`  + audio/${name}`);
}

function makeHum(seconds: number, sampleRate: number): Float32Array {
  const total = Math.floor(seconds * sampleRate);
  const out = new Float32Array(total);
  for (let i = 0; i < total; i += 1) {
    const t = i / sampleRate;
    const tremolo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.7 * t);
    const value =
      0.16 * Math.sin(2 * Math.PI * 50 * t) +
      0.07 * Math.sin(2 * Math.PI * 100 * t) +
      0.03 * Math.sin(2 * Math.PI * 150 * t);
    out[i] = value * tremolo;
  }
  return out;
}

function makeDrone(seconds: number, sampleRate: number): Float32Array {
  const total = Math.floor(seconds * sampleRate);
  const out = new Float32Array(total);
  for (let i = 0; i < total; i += 1) {
    const t = i / sampleRate;
    out[i] =
      0.12 * Math.sin(2 * Math.PI * 40 * t) +
      0.06 * Math.sin(2 * Math.PI * 60 * t + 0.4 * Math.sin(2 * Math.PI * 0.2 * t));
  }
  return out;
}

function makeClick(seconds: number, sampleRate: number): Float32Array {
  const total = Math.floor(seconds * sampleRate);
  const out = new Float32Array(total);
  // Детерминированный шум, чтобы `assets:generate` был воспроизводим.
  let state = 0x9e3779b9;
  const noise = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state / 0x100000000) * 2 - 1;
  };
  for (let i = 0; i < total; i += 1) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 40);
    const tone = Math.sin(2 * Math.PI * 90 * t) * 0.5;
    out[i] = noise() * 0.6 * decay + tone * decay;
  }
  return out;
}

// ---------------------------------------------------------------------------

function main(): void {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(audioDir, { recursive: true });
  console.log(`Генерация ассетов в ${outDir}`);

  writeSvg("logo.svg", logo());
  writeSvg("apple.svg", apple());
  writeSvg("apple-outline.svg", appleOutline());
  writeSvg(
    "founder-a.svg",
    styledSilhouette("man-standing-pitr.svg", "a", false),
  );
  writeSvg(
    "founder-b.svg",
    styledSilhouette("man-standing-madprime.svg", "b", true),
  );
  writeSvg("marble-bust.svg", marbleBust());
  writeSvg("lock.svg", lockIcon());
  writeSvg("grain.svg", grain());
  writeSvg("concrete.svg", concrete());
  writeSvg("lamp.svg", lamp());

  writeWav("hum.wav", makeHum(1.2, 22050));
  writeWav("drone.wav", makeDrone(1.6, 22050));
  writeWav("click.wav", makeClick(0.12, 22050));

  console.log(
    "Готово. Это плейсхолдеры. Реальные ассеты — см. ASSETS_TODO.md (ASSET_NEEDED).",
  );
}

main();
