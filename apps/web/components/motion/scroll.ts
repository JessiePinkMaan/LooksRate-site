import type Lenis from "lenis";

/** Синглтон Lenis, чтобы переходы могли мгновенно сбросить скролл. */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}
