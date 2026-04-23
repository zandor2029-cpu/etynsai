import { ReactNode, useEffect, useRef, useState } from "react";

interface ThanosDissolveProps {
  children: ReactNode;
  className?: string;
  /** Direction the element drifts when dissolving away */
  direction?: "up" | "down";
  /** Disable on mobile / reduced-motion (default true) */
  disableOnMobile?: boolean;
  /** Unique id seed for the SVG filter (auto-generated if omitted) */
  filterId?: string;
}

/**
 * "Thanos snap" dissolve effect using SVG turbulence + displacement.
 * - Element exits viewport: dissolves into drifting dust particles.
 * - Element re-enters: rebuilds from dust back into solid form.
 * Pure CSS/SVG — no canvas capture, very performant.
 */
export const ThanosDissolve = ({
  children,
  className,
  direction = "up",
  disableOnMobile = true,
  filterId,
}: ThanosDissolveProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const rafRef = useRef<number>();
  const stateRef = useRef<"visible" | "hidden">("visible");
  const [isEnabled, setIsEnabled] = useState(true);
  const [uid] = useState(
    () => filterId ?? `thanos-${Math.random().toString(36).slice(2, 9)}`
  );

  useEffect(() => {
    if (!disableOnMobile) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    if (reduced || small) setIsEnabled(false);
  }, [disableOnMobile]);

  const stopAnim = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
  };

  const animate = (
    from: number,
    to: number,
    duration: number,
    onUpdate: (t: number, eased: number) => void,
    onDone?: () => void
  ) => {
    stopAnim();
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // easeInOutQuad
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const value = from + (to - from) * eased;
      onUpdate(value, eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = undefined;
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const dissolveOut = () => {
    const el = innerRef.current;
    const disp = displacementRef.current;
    if (!el || !disp) return;
    stateRef.current = "hidden";
    const driftSign = direction === "up" ? -1 : 1;
    animate(0, 1, 800, (_v, e) => {
      // displacement scale grows -> particles scatter
      disp.setAttribute("scale", String(e * 180));
      el.style.opacity = String(1 - e);
      el.style.filter = `blur(${e * 4}px)`;
      el.style.transform = `translateY(${driftSign * e * 30}px) scale(${1 - e * 0.05})`;
    });
  };

  const dissolveIn = () => {
    const el = innerRef.current;
    const disp = displacementRef.current;
    if (!el || !disp) return;
    stateRef.current = "visible";
    const driftSign = direction === "up" ? -1 : 1;
    // start from dissolved state
    animate(0, 1, 800, (_v, e) => {
      disp.setAttribute("scale", String((1 - e) * 180));
      el.style.opacity = String(e);
      el.style.filter = `blur(${(1 - e) * 4}px)`;
      el.style.transform = `translateY(${driftSign * (1 - e) * 30}px) scale(${0.95 + e * 0.05})`;
    }, () => {
      // reset
      el.style.filter = "";
      el.style.transform = "";
      disp.setAttribute("scale", "0");
    });
  };

  useEffect(() => {
    if (!isEnabled) return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0.1;
          if (visible && stateRef.current === "hidden") {
            dissolveIn();
          } else if (!visible && entry.intersectionRatio < 0.05 && stateRef.current === "visible") {
            dissolveOut();
          }
        }
      },
      { threshold: [0, 0.05, 0.1, 0.3] }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stopAnim();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  if (!isEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={wrapperRef} className={className} style={{ position: "relative" }}>
      {/* SVG filter definition (hidden) */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <filter id={uid} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={innerRef}
        style={{
          filter: `url(#${uid})`,
          willChange: "opacity, filter, transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ThanosDissolve;
