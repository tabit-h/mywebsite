import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDelta: number;
  color: string;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "rgba(212, 168, 67, ",   // gold
      "rgba(255, 220, 120, ",  // bright gold
      "rgba(180, 140, 60, ",   // dim gold
      "rgba(255, 255, 200, ",  // warm white
    ];

    // Init particles
    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4 + 0.05,
      opacityDelta: (Math.random() - 0.5) * 0.003,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw light rays
      const rayGrad = ctx.createLinearGradient(canvas.width * 0.7, 0, canvas.width, canvas.height * 0.5);
      rayGrad.addColorStop(0, "rgba(212, 168, 67, 0.03)");
      rayGrad.addColorStop(0.5, "rgba(212, 168, 67, 0.015)");
      rayGrad.addColorStop(1, "rgba(212, 168, 67, 0)");
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.85, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width * 0.3, canvas.height);
      ctx.lineTo(canvas.width * 0.1, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opacityDelta;

        if (p.opacity <= 0.02) p.opacityDelta = Math.abs(p.opacityDelta);
        if (p.opacity >= 0.45) p.opacityDelta = -Math.abs(p.opacityDelta);

        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ")";
        ctx.fill();

        // Glow
        if (p.size > 1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color + (p.opacity * 0.15) + ")";
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
