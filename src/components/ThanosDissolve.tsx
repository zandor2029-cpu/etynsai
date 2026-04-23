import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";

interface ThanosDissolveProps {
  children: ReactNode;
  className?: string;
  /** Direction the particles drift when dissolving away on scroll */
  direction?: "up" | "down";
  /** Disable on mobile for performance (default true) */
  disableOnMobile?: boolean;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
};

const PARTICLE_STEP = 6; // sample every Nth pixel — lower = more particles, heavier
const DISSOLVE_DURATION = 900; // ms

/**
 * Wraps children with a "Thanos snap" dissolve effect triggered by viewport visibility.
 * - When element exits viewport: dissolves into particles drifting in `direction`.
 * - When element re-enters: rebuilds from particles.
 */
export const ThanosDissolve = ({
  children,
  className,
  direction = "up",
  disableOnMobile = true,
}: ThanosDissolveProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>();
  const stateRef = useRef<"visible" | "dissolving" | "hidden" | "rebuilding">("visible");
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (disableOnMobile && typeof window !== "undefined") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.matchMedia("(max-width: 768px)").matches;
      if (reduced || small) setIsEnabled(false);
    }
  }, [disableOnMobile]);

  const stopAnim = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
  };

  const captureParticles = useCallback(async () => {
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!content || !canvas) return false;

    try {
      const snapshot = await html2canvas(content, {
        backgroundColor: null,
        scale: 1,
        logging: false,
        useCORS: true,
      });
      const w = snapshot.width;
      const h = snapshot.height;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${content.offsetWidth}px`;
      canvas.style.height = `${content.offsetHeight}px`;

      const sctx = snapshot.getContext("2d");
      if (!sctx) return false;
      const data = sctx.getImageData(0, 0, w, h).data;

      const particles: Particle[] = [];
      const drift = direction === "up" ? -1 : 1;

      for (let y = 0; y < h; y += PARTICLE_STEP) {
        for (let x = 0; x < w; x += PARTICLE_STEP) {
          const i = (y * w + x) * 4;
          const a = data[i + 3];
          if (a < 20) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // horizontal drift biased by x position (creates that swept-away curve)
          const xBias = (x / w) * 1.2 + 0.3;
          particles.push({
            x,
            y,
            vx: (Math.random() * 1.5 + 0.5) * xBias,
            vy: (Math.random() * 1.2 + 0.3) * drift - 0.4,
            size: PARTICLE_STEP * (0.8 + Math.random() * 0.6),
            color: `rgba(${r},${g},${b},`,
            alpha: a / 255,
            life: Math.random() * 0.4, // staggered start
          });
        }
      }
      particlesRef.current = particles;
      return true;
    } catch (e) {
      console.warn("[ThanosDissolve] capture failed", e);
      return false;
    }
  }, [direction]);

  const animateDissolve = useCallback((reverse = false) => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const start = performance.now();
    const total = DISSOLVE_DURATION;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / total, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // each particle has its own life offset so they don't all start at once
        const localT = reverse
          ? Math.max(0, Math.min(1, (1 - t - p.life) / 0.6))
          : Math.max(0, Math.min(1, (t - p.life) / 0.6));

        const progress = reverse ? 1 - localT : localT;
        const x = p.x + p.vx * progress * 60;
        const y = p.y + p.vy * progress * 60;
        const alpha = p.alpha * (1 - progress);
        if (alpha <= 0.01) continue;
        ctx.fillStyle = p.color + alpha + ")";
        ctx.fillRect(x, y, p.size, p.size);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stopAnim();
        if (reverse) {
          // rebuild done — show real content
          canvas.style.opacity = "0";
          content.style.opacity = "1";
          stateRef.current = "visible";
        } else {
          // dissolve done — hide
          canvas.style.opacity = "0";
          stateRef.current = "hidden";
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const triggerDissolve = useCallback(async () => {
    if (stateRef.current === "dissolving" || stateRef.current === "hidden") return;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!content || !canvas) return;
    stateRef.current = "dissolving";
    const ok = await captureParticles();
    if (!ok) {
      stateRef.current = "visible";
      return;
    }
    content.style.opacity = "0";
    canvas.style.opacity = "1";
    stopAnim();
    animateDissolve(false);
  }, [animateDissolve, captureParticles]);

  const triggerRebuild = useCallback(async () => {
    if (stateRef.current === "visible" || stateRef.current === "rebuilding") return;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!content || !canvas) return;
    stateRef.current = "rebuilding";
    // capture current visual to rebuild from same particles
    content.style.opacity = "0";
    const ok = await captureParticles();
    if (!ok) {
      content.style.opacity = "1";
      stateRef.current = "visible";
      return;
    }
    canvas.style.opacity = "1";
    stopAnim();
    animateDissolve(true);
  }, [animateDissolve, captureParticles]);

  useEffect(() => {
    if (!isEnabled) return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            if (stateRef.current === "hidden") triggerRebuild();
          } else if (entry.intersectionRatio < 0.05) {
            if (stateRef.current === "visible") triggerDissolve();
          }
        }
      },
      { threshold: [0, 0.05, 0.15, 0.3] }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stopAnim();
    };
  }, [isEnabled, triggerDissolve, triggerRebuild]);

  if (!isEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={wrapperRef} className={className} style={{ position: "relative" }}>
      <div
        ref={contentRef}
        style={{ transition: "opacity 0.05s linear", willChange: "opacity" }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default ThanosDissolve;