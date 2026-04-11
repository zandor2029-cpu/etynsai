import { useEffect, useRef } from "react";

const AnimatedGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridSize = 60;
      const cols = Math.ceil(canvas.width / gridSize) + 1;
      const rows = Math.ceil(canvas.height / gridSize) + 1;

      // Vertical lines
      for (let i = 0; i <= cols; i++) {
        const x = i * gridSize;
        const wave = Math.sin(time + i * 0.15) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.strokeStyle = `hsla(210, 100%, 55%, ${0.04 * wave})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Horizontal lines
      for (let j = 0; j <= rows; j++) {
        const y = j * gridSize;
        const wave = Math.sin(time * 0.8 + j * 0.12) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = `hsla(260, 100%, 65%, ${0.03 * wave})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Glowing intersection points
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          const dist = Math.sin(time * 2 + i * 0.3 + j * 0.3);
          if (dist > 0.6) {
            const alpha = (dist - 0.6) * 2.5;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
            gradient.addColorStop(0, `hsla(210, 100%, 65%, ${alpha * 0.6})`);
            gradient.addColorStop(1, `hsla(210, 100%, 65%, 0)`);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        }
      }

      // Traveling light beams on random lines
      const beamCount = 3;
      for (let b = 0; b < beamCount; b++) {
        const progress = ((time * 0.4 + b * 1.2) % 3) / 3;
        const row = Math.floor((b * 7.3) % rows);
        const y = row * gridSize;
        const xPos = progress * canvas.width;
        const beamGrad = ctx.createLinearGradient(xPos - 120, y, xPos + 120, y);
        beamGrad.addColorStop(0, "hsla(210, 100%, 60%, 0)");
        beamGrad.addColorStop(0.5, "hsla(190, 100%, 55%, 0.15)");
        beamGrad.addColorStop(1, "hsla(260, 100%, 65%, 0)");
        ctx.beginPath();
        ctx.moveTo(xPos - 120, y);
        ctx.lineTo(xPos + 120, y);
        ctx.strokeStyle = beamGrad as unknown as string;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default AnimatedGridBackground;
