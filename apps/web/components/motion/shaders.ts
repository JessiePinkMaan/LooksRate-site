/** Шейдеры занавеса переходов (ТЗ §6.2, §6.7). GLSL ES 1.0 для OGL. */

export const curtainVertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const curtainFragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uProgress;
uniform float uType;
uniform vec2 uOrigin;
uniform float uAspect;
uniform vec3 uBlood;
uniform vec3 uBg;

varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 uv = vUv;
  vec2 auv = vec2(uv.x * uAspect, uv.y);
  vec2 ao = vec2(uOrigin.x * uAspect, uOrigin.y);
  float d = distance(auv, ao);

  float p = clamp(uProgress, 0.0, 1.0);
  float a = 0.0;
  vec3 col = uBg;

  if (uType < 1.5) {
    // T1 - Трещина (шумный фронт + красная кромка)
    float n = noise2(uv * 9.0 + uTime * 0.15);
    float radius = p * 2.0 + (n - 0.5) * 0.35;
    a = 1.0 - smoothstep(radius - 0.03, radius + 0.03, d);
    float edge = smoothstep(0.07, 0.0, abs(d - radius));
    col = mix(uBg, uBlood, edge * 0.9);
  } else if (uType < 2.5) {
    // T2 - Люк (радиальная диафрагма)
    float radius = p * 2.0;
    a = 1.0 - smoothstep(radius - 0.02, radius + 0.02, d);
    col = uBg;
  } else if (uType < 3.5) {
    // T3 - Падение яблока (красная волна от точки)
    float radius = p * 2.1;
    a = 1.0 - smoothstep(radius - 0.04, radius + 0.04, d);
    float ring = smoothstep(0.1, 0.0, abs(d - radius));
    col = mix(uBg, uBlood, 0.35 + ring * 0.6);
  } else if (uType < 6.5) {
    // T6 - Плёнка (вертикальный сдвиг + зерно + cue mark)
    float jitter = (hash21(vec2(floor(uTime * 24.0), 1.0)) - 0.5) * 0.06;
    a = step(1.0 - p, uv.y + jitter);
    float grain = hash21(uv * 512.0 + floor(uTime * 30.0));
    col = mix(uBg, vec3(0.16, 0.15, 0.14), grain * 0.5 * p);
    float cue = smoothstep(0.025, 0.0, distance(uv, vec2(0.88, 0.1)));
    col = mix(col, uBlood, cue);
  } else {
    // T9 - Глитч-шов (горизонтальные полосы + RGB-расслоение)
    float bands = 20.0;
    float band = floor(uv.y * bands);
    float n = hash21(vec2(band, floor(uTime * 16.0)));
    a = step(1.0 - p, n);
    float shift = (n - 0.5) * 0.12 * (1.0 - p);
    col = uBg;
    col.r += abs(shift) * 1.6;
  }

  // Гарантируем полную прозрачность в покое (uProgress=0),
  // иначе шумовой фронт T1 оставляет красное пятно на странице.
  a *= smoothstep(0.0, 0.04, p);

  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;
