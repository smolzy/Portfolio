"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

export default function HyperspaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const STAR_COUNT = 1000;
    // Speed: 2.5 feels like gentle warp — not too crazy
    const SPEED = 10;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const setup = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    setup();

    // Initialize stars spread across 3D space
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => {
      const z = Math.random() * W;
      return {
        x: (Math.random() - 0.5) * W * 2.5,
        y: (Math.random() - 0.5) * H * 2.5,
        z,
        pz: z,
      };
    });

    let raf: number;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED;

        // Reset star that has passed the viewer
        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * W * 2.5;
          s.y = (Math.random() - 0.5) * H * 2.5;
          s.z = W;
          s.pz = s.z;
          continue;
        }

        // 3D → 2D projection
        const sx = (s.x / s.z) * W + cx;
        const sy = (s.y / s.z) * H + cy;
        const px = (s.x / s.pz) * W + cx;
        const py = (s.y / s.pz) * H + cy;

        // Cull off-screen stars early
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) {
          s.z = 0;
          continue;
        }

        // Stars go from invisible (far) to opaque (close)
        const progress = 1 - s.z / W; // 0 = far, 1 = near
        const size = Math.max(0.15, progress * 2.2);
        const opacity = progress * 0.28;

        // Dark navy streaks — visible on light background but unobtrusive
        ctx.beginPath();
        ctx.strokeStyle = `rgba(18, 32, 100, ${opacity})`;
        ctx.lineWidth = size;
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    window.addEventListener("resize", setup);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setup);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        // Sits behind everything, never captures pointer events
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
