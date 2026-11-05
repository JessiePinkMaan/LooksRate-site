/**
 * Процедурные ассеты-заглушки (ТЗ §25: реальные ассеты заменяют их позже).
 * Всё генерируется локально, без внешних CDN и без чужих фото (AGENTS.md п.3, п.10).
 * Реальные ассеты помечены ASSET_NEEDED в ASSETS_TODO.md.
 *
 * Куда кладём: apps/web/public/assets (см. DECISIONS D-3).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

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

/**
 * Подготовка фото яблока от владельца: обрезка чёрных полей, прозрачный фон
 * (по яркости), WebP/PNG + версия с чёрным фоном.
 */
async function prepareApplePhoto(): Promise<void> {
  const source = resolve(here, "../../../assets/apple.jpg");
  if (!existsSync(source)) {
    console.log("  · assets/apple.jpg не найден — фото яблока пропущено");
    return;
  }

  const { data, info } = await sharp(source)
    .trim({ threshold: 12 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    const luminance = Math.max(r, g, b) / 255;
    const alpha = Math.min(1, Math.max(0, (luminance - 0.02) / 0.1));
    pixels[i + 3] = Math.round(alpha * 255);
  }

  const rgba = sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });

  await rgba
    .clone()
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(resolve(outDir, "apple-photo.webp"));
  await rgba
    .clone()
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, "apple-photo.png"));
  await sharp(source)
    .trim({ threshold: 12 })
    .webp({ quality: 88 })
    .toFile(resolve(outDir, "apple-photo-black.webp"));

  console.log(`  + apple-photo.webp (${info.width}×${info.height})`);
  console.log("  + apple-photo.png");
  console.log("  + apple-photo-black.webp");
}

async function prepareOg(): Promise<void> {
  const applePath = resolve(outDir, "apple-photo.png");
  if (!existsSync(applePath)) return;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#C9A227" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#030303" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#030303"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="600" y="380" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="700" fill="#E9E4DA">LOXRATE</text>
  <text x="600" y="434" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="10" fill="#7F848E">PODVAL · APPLE · STOA</text>
  <rect x="540" y="475" width="120" height="3" fill="#B3121B"/>
</svg>`;

  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const apple = await sharp(applePath)
    .resize(180, 185, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp(base)
    .composite([{ input: apple, left: 510, top: 70 }])
    .png()
    .toFile(resolve(outDir, "..", "og.png"));
  console.log("  + og.png (1200×630, public root)");
}

type HandLayout = "vertical" | "horizontal";

/**
 * Отделяет живописную руку от мраморного фона. Кожа тёплая и насыщенная,
 * мрамор — почти нейтральный: маска по `r - b` + насыщенности даёт чистый
 * силуэт. Затем заливаем внутренние дырки и убираем мелкий мусор.
 */
function buildHandAlpha(
  pixels: Buffer,
  width: number,
  height: number,
): Uint8Array {
  const total = width * height;
  const alpha = new Uint8Array(total);

  for (let i = 0; i < total; i += 1) {
    const p = i * 4;
    const r = pixels[p] ?? 0;
    const g = pixels[p + 1] ?? 0;
    const b = pixels[p + 2] ?? 0;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max > 0 ? (max - min) / max : 0;
    if (r - b > 26 && saturation > 0.14) alpha[i] = 255;
  }

  // Оставляем только крупнейшую связную область — саму руку.
  const labels = new Int32Array(total).fill(-1);
  const stack: number[] = [];
  const sizes: number[] = [];

  for (let start = 0; start < total; start += 1) {
    if (alpha[start] === 0 || labels[start] !== -1) continue;
    const label = sizes.length;
    let size = 0;
    stack.push(start);
    labels[start] = label;

    while (stack.length > 0) {
      const index = stack.pop();
      if (index === undefined) continue;
      size += 1;
      const x = index % width;
      const y = (index - x) / width;

      const neighbours = [
        x > 0 ? index - 1 : -1,
        x < width - 1 ? index + 1 : -1,
        y > 0 ? index - width : -1,
        y < height - 1 ? index + width : -1,
      ];
      for (const next of neighbours) {
        if (next === -1 || alpha[next] === 0 || labels[next] !== -1) continue;
        labels[next] = label;
        stack.push(next);
      }
    }

    sizes.push(size);
  }

  if (sizes.length > 0) {
    let largest = 0;
    for (let i = 1; i < sizes.length; i += 1) {
      if ((sizes[i] ?? 0) > (sizes[largest] ?? 0)) largest = i;
    }
    for (let i = 0; i < total; i += 1) {
      if (alpha[i] > 0 && labels[i] !== largest) alpha[i] = 0;
    }
  }

  // Заливаем дырки: всё, что не связано с краем изображения.
  const outside = new Uint8Array(total);
  stack.length = 0;
  for (let x = 0; x < width; x += 1) {
    stack.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    stack.push(y * width, y * width + width - 1);
  }

  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined) continue;
    if (index < 0 || index >= total) continue;
    if (outside[index] === 1 || alpha[index] > 0) continue;
    outside[index] = 1;

    const x = index % width;
    const y = (index - x) / width;
    if (x > 0) stack.push(index - 1);
    if (x < width - 1) stack.push(index + 1);
    if (y > 0) stack.push(index - width);
    if (y < height - 1) stack.push(index + width);
  }

  for (let i = 0; i < total; i += 1) {
    if (alpha[i] === 0 && outside[i] === 0) alpha[i] = 255;
  }

  return alpha;
}

/** Обрезает прозрачные поля по фактической альфе. */
async function trimAlpha(input: Buffer, width: number, height: number) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = input[(y * width + x) * 4 + 3] ?? 0;
      if (alpha < 8) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < left || bottom < top) {
    return { data: input, width, height };
  }

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const { data, info } = await sharp(input, {
    raw: { width, height, channels: 4 },
  })
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data: Buffer.from(data), width: info.width, height: info.height };
}

/** Обнуляет RGB у полностью прозрачных пикселей, чтобы браузер не
 * подмешивал цвет фона в прозрачную область при масштабировании. */
function clearTransparentRgb(data: Buffer): Buffer {
  for (let i = 0; i < data.length; i += 4) {
    if ((data[i + 3] ?? 0) > 0) continue;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
  }
  return data;
}

/**
 * Горизонтальная рука для hero: ладонь сохраняем как есть, а предплечье
 * растягиваем однородной полосой до края экрана — рука становится длинной
 * без искажения кисти. Полоса выравнивается по запястью.
 */
async function stretchArm(
  input: Buffer,
  width: number,
  height: number,
  targetWidth: number,
  targetHeight: number,
): Promise<Buffer> {
  const handWidth = Math.round(targetWidth * 0.4);
  const overlap = Math.max(16, Math.round(targetWidth * 0.015));
  const armWidth = targetWidth - handWidth + overlap;

  const sourceHandLeft = Math.round(width * 0.58);
  const handCropWidth = width - sourceHandLeft;
  const scale = targetHeight / height;

  const stripWidth = Math.max(3, Math.round(width * 0.05));
  const stripLeft = Math.max(0, sourceHandLeft - stripWidth - 1);

  const handCrop = await sharp(input, {
    raw: { width, height, channels: 4 },
  })
    .extract({
      left: sourceHandLeft,
      top: 0,
      width: handCropWidth,
      height,
    })
    .png()
    .toBuffer();

  // Высота запястья по левому краю кисти — к ней подгоняем предплечье.
  const handRaw = await sharp(handCrop).ensureAlpha().raw().toBuffer();
  let wristTop = height;
  let wristBottom = 0;
  const wristColumn = Math.max(2, Math.round(handCropWidth * 0.12));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < wristColumn; x += 1) {
      const alpha = handRaw[(y * handCropWidth + x) * 4 + 3] ?? 0;
      if (alpha < 16) continue;
      if (y < wristTop) wristTop = y;
      if (y > wristBottom) wristBottom = y;
    }
  }
  if (wristBottom <= wristTop) {
    wristTop = Math.round(height * 0.25);
    wristBottom = Math.round(height * 0.75);
  }

  const bandHeight = Math.max(
    24,
    Math.round((wristBottom - wristTop) * scale),
  );
  const bandTop = Math.max(
    0,
    Math.min(targetHeight - bandHeight, Math.round(wristTop * scale)),
  );

  const hand = await sharp(handCrop)
    .resize(handWidth, targetHeight, { fit: "fill" })
    .png()
    .toBuffer();

  const arm = await sharp(input, {
    raw: { width, height, channels: 4 },
  })
    .extract({ left: stripLeft, top: 0, width: stripWidth, height })
    .resize(armWidth, bandHeight, { fit: "fill" })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: arm, left: 0, top: bandTop },
      { input: hand, left: targetWidth - handWidth, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function renderHand(
  sourceFile: string,
  outFile: string,
  rotateDeg: number,
  layout: HandLayout,
  mirror = false,
): Promise<void> {
  const source = resolve(here, "../../../assets", sourceFile);
  if (!existsSync(source)) return;

  const base = sharp(source).trim({ threshold: 12 });
  const { data, info } = await base
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const { width, height } = info;
  const alpha = buildHandAlpha(pixels, width, height);

  // Мягкий край, чтобы силуэт не был «вырубленным».
  const feathered = await sharp(Buffer.from(alpha), {
    raw: { width, height, channels: 1 },
  })
    .blur(0.6)
    .raw()
    .toBuffer();

  const featherChannels = Math.max(
    1,
    Math.round(feathered.length / (width * height)),
  );
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const p = i * 4;
    rgba[p] = pixels[p] ?? 0;
    rgba[p + 1] = pixels[p + 1] ?? 0;
    rgba[p + 2] = pixels[p + 2] ?? 0;
    rgba[p + 3] = feathered[i * featherChannels] ?? 0;
  }

  let oriented = sharp(rgba, {
    raw: { width, height, channels: 4 },
  });
  if (rotateDeg !== 0) {
    oriented = oriented.rotate(rotateDeg, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  const rotated = await oriented
    .raw()
    .toBuffer({ resolveWithObject: true });
  const trimmed = await trimAlpha(
    Buffer.from(rotated.data),
    rotated.info.width,
    rotated.info.height,
  );
  clearTransparentRgb(trimmed.data);

  if (layout === "vertical") {
    const targetHeight = 900;
    const scale = Math.min(1.6, targetHeight / trimmed.height);
    let pipeline = sharp(trimmed.data, {
      raw: {
        width: trimmed.width,
        height: trimmed.height,
        channels: 4,
      },
    }).resize({
      height: Math.round(trimmed.height * scale),
      fit: "inside",
      kernel: "lanczos3",
    });
    if (mirror) pipeline = pipeline.flop();
    await pipeline
      .flatten({ background: { r: 0, g: 0, b: 0 } })
      .webp({ quality: 88 })
      .toFile(resolve(outDir, outFile));
  } else {
    const targetHeight = 500;
    const targetWidth = Math.round(targetHeight * 2.8);
    const stretched = await stretchArm(
      trimmed.data,
      trimmed.width,
      trimmed.height,
      targetWidth,
      targetHeight,
    );
    const stretchedRaw = await sharp(stretched)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const tight = await trimAlpha(
      Buffer.from(stretchedRaw.data),
      stretchedRaw.info.width,
      stretchedRaw.info.height,
    );
    clearTransparentRgb(tight.data);
    let pipeline = sharp(tight.data, {
      raw: { width: tight.width, height: tight.height, channels: 4 },
    });
    if (mirror) pipeline = pipeline.flop();
    await pipeline
      .flatten({ background: { r: 0, g: 0, b: 0 } })
      .webp({ quality: 88 })
      .toFile(resolve(outDir, outFile));
  }

  console.log(`  + ${outFile}`);
}

async function prepareHands(): Promise<void> {
  // Вертикальные — для сцены «Основатели».
  await renderHand("рука1.jpg", "hand-a.webp", 0, "vertical");
  await renderHand("рука2.jpg", "hand-b.webp", 0, "vertical");
  // Горизонтальные — для hero: рука2 (указующий перст) слева,
  // рука1 (расслабленная кисть) справа, ладонями к яблоку.
  await renderHand("рука2.jpg", "hand-left.webp", 90, "horizontal");
  await renderHand("рука1.jpg", "hand-right.webp", -90, "horizontal", true);
}

async function prepareBittenApple(): Promise<void> {
  const source = resolve(outDir, "apple-photo.png");
  if (!existsSync(source)) return;

  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const { width, height } = info;
  const bites = [
    { x: width * 0.86, y: height * 0.42, r: width * 0.27 },
    { x: width * 0.79, y: height * 0.27, r: width * 0.17 },
    { x: width * 0.79, y: height * 0.58, r: width * 0.17 },
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inside = bites.some(
        (bite) => (x - bite.x) ** 2 + (y - bite.y) ** 2 < bite.r ** 2,
      );
      if (inside) {
        pixels[(y * width + x) * 4 + 3] = 0;
      }
    }
  }

  await sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(resolve(outDir, "apple-bitten.webp"));

  console.log("  + apple-bitten.webp");
}

async function main(): Promise<void> {
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

  await prepareApplePhoto();
  await prepareBittenApple();
  await prepareOg();
  await prepareHands();

  console.log(
    "Готово. Это плейсхолдеры. Реальные ассеты — см. ASSETS_TODO.md (ASSET_NEEDED).",
  );
}

main().catch((error: unknown) => {
  console.error("Генерация ассетов упала:", error);
  process.exitCode = 1;
});
