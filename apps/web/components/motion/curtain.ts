import { gsap } from "gsap";
import { Mesh, Program, Renderer, Triangle, Vec2 } from "ogl";

import { curtainFragment, curtainVertex } from "./shaders";

export type CurtainType = 1 | 2 | 3 | 6 | 9;

export type CurtainOrigin = { x: number; y: number };

type NumberUniform = { value: number };
type Vec2Uniform = { value: Vec2 };

/**
 * Полноэкранный canvas-занавес (ТЗ §6.7). Рисует только во время перехода;
 * в покое цикл остановлен, последний кадр прозрачен.
 */
export class Curtain {
  private renderer: Renderer;
  private program: Program;
  private mesh: Mesh;
  private raf = 0;
  private startedAt = performance.now();
  private running = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });

    const gl = this.renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    this.program = new Program(gl, {
      vertex: curtainVertex,
      fragment: curtainFragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uType: { value: 1 },
        uOrigin: { value: new Vec2(0.5, 0.5) },
        uAspect: { value: 1 },
        uBlood: { value: [0.7, 0.07, 0.11] },
        uBg: { value: [0.04, 0.04, 0.043] },
      },
    });

    this.mesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: this.program,
    });

    // Первый прозрачный кадр, чтобы canvas не был чёрным до перехода.
    this.resize();
    this.renderer.render({ scene: this.mesh });
  }

  private get progress(): NumberUniform {
    return this.program.uniforms.uProgress as NumberUniform;
  }

  private resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    (this.program.uniforms.uAspect as NumberUniform).value = width / height;
  };

  private loop = (): void => {
    (this.program.uniforms.uTime as NumberUniform).value =
      (performance.now() - this.startedAt) / 1000;
    this.renderer.render({ scene: this.mesh });
    this.raf = requestAnimationFrame(this.loop);
  };

  private start(): void {
    if (this.running) return;
    this.running = true;
    this.resize();
    window.addEventListener("resize", this.resize);
    this.raf = requestAnimationFrame(this.loop);
  }

  private stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
  }

  async cover(
    type: CurtainType,
    origin?: CurtainOrigin,
    duration = 0.55,
  ): Promise<void> {
    (this.program.uniforms.uType as NumberUniform).value = type;
    (this.program.uniforms.uOrigin as Vec2Uniform).value.set(
      origin?.x ?? 0.5,
      origin?.y ?? 0.5,
    );
    this.progress.value = 0;
    this.start();

    await new Promise<void>((resolve) => {
      gsap.to(this.progress, {
        value: 1,
        duration,
        ease: "power2.in",
        onComplete: resolve,
      });
    });
  }

  async reveal(duration = 0.5): Promise<void> {
    await new Promise<void>((resolve) => {
      gsap.to(this.progress, {
        value: 0,
        duration,
        ease: "power2.out",
        onComplete: resolve,
      });
    });
    this.stop();
  }

  dispose(): void {
    this.stop();
    const extension = this.renderer.gl.getExtension(
      "WEBGL_lose_context",
    ) as { loseContext?: () => void } | null;
    extension?.loseContext?.();
  }
}
