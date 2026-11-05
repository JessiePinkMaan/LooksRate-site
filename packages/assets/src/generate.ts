/**
 * Процедурные ассеты-заглушки (ТЗ §25: реальные ассеты заменяют их позже).
 * Кладём в apps/web/public/assets (см. DECISIONS D-3). Всё — SVG, без внешних CDN.
 * Реальные текстуры/фото помечены ASSET_NEEDED в ASSETS_TODO.md.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../../../apps/web/public/assets");

function write(name: string, content: string): void {
  writeFileSync(resolve(outDir, name), content.trim() + "\n", "utf8");
  console.log(`  + ${name}`);
}

function apple(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Золотое яблоко LoxRate">
  <defs>
    <radialGradient id="apple" cx="34%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#E8C766"/>
      <stop offset="38%" stop-color="#C9A227"/>
      <stop offset="72%" stop-color="#B3121B"/>
      <stop offset="100%" stop-color="#3A0508"/>
    </radialGradient>
  </defs>
  <path d="M128 72c-24-26-72-20-84 20-12 44 16 108 84 128 68-20 96-84 84-128-12-40-60-46-84-20Z" fill="url(#apple)"/>
  <path d="M128 72c0-20 8-36 28-42" fill="none" stroke="#5C4310" stroke-width="8" stroke-linecap="round"/>
  <path d="M140 60c16-20 40-24 52-18-6 22-32 30-52 18Z" fill="#6E0A10"/>
</svg>`;
}

function hoodedFigure(variant: "a" | "b"): string {
  const lean = variant === "a" ? -4 : 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 240" role="img" aria-label="Силуэт основателя (ASSET_NEEDED)">
  <path transform="translate(${lean} 0)" d="M60 8C38 8 23 26 23 51c0 16 7 28 17 35-22 15-31 46-33 90-2 30 1 48 1 48h104s3-18 1-48c-2-44-11-75-33-90 10-7 17-19 17-35C97 26 82 8 60 8Z" fill="#0B0B0C"/>
  <path transform="translate(${lean} 0)" d="M60 34c-13 0-22 9-22 21 0 8 3 14 8 18 9-6 27-6 36 0 5-4 8-10 8-18 0-12-9-21-22-21Z" fill="#050505"/>
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

function main(): void {
  mkdirSync(outDir, { recursive: true });
  console.log(`Генерация ассетов в ${outDir}`);

  write("apple.svg", apple());
  write("founder-a.svg", hoodedFigure("a"));
  write("founder-b.svg", hoodedFigure("b"));
  write("grain.svg", grain());
  write("concrete.svg", concrete());
  write("lamp.svg", lamp());

  console.log("Готово. Реальные ассеты — см. ASSETS_TODO.md (ASSET_NEEDED).");
}

main();
