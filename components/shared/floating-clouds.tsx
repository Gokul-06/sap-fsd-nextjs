"use client";

import { motion } from "framer-motion";

/* ───── Clean crisp cloud using SVG ───── */
function CloudShape({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M170 80H30c-11 0-20-9-20-20 0-9.4 6.5-17.3 15.3-19.4C26.5 23.8 40.8 12 58 12c5.8 0 11.3 1.5 16 4.1C80.5 8.2 90.5 3 102 3c17.7 0 32.5 11.8 37.2 28 1.8-.5 3.7-.8 5.8-.8 11 0 20 9 20 20v.5c8.4 2.5 14.5 10.3 14.5 19.5 0 11-9 19.8-20 19.8H170z"
        fill={color}
      />
    </svg>
  );
}

/* Alternate cloud shape for variety */
function CloudShape2({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size * 0.45}
      viewBox="0 0 220 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M190 82H32c-13 0-24-10-24-22 0-10 7-18.5 16.5-21C28 20 44 6 64 6c8 0 15.5 2.5 21.5 6.5C92 5 102 0 114 0c15 0 28 8.5 34 21 3-1.5 6.5-2.5 10-2.5 12.5 0 22.5 9.5 23.8 21.5C193 43.5 202 53 202 65c0 9.5-5.5 17.5-13.5 21H190z"
        fill={color}
      />
    </svg>
  );
}

/* Small puffy cloud */
function CloudShape3({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 160 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M140 72H24c-8.8 0-16-7.2-16-16 0-7.5 5.2-13.8 12.2-15.5C22.5 22 35.5 10 52 10c4.5 0 8.8 1 12.5 2.8C70.5 5.5 79 1 89 1c13 0 24 8 28.5 19.5 2-.8 4.2-1.2 6.5-1.2 9.5 0 17.2 7.3 18 16.5C150.5 38 157 45.5 157 55c0 9.4-7.6 17-17 17z"
        fill={color}
      />
    </svg>
  );
}

/* ───── Drifting cloud that moves across the viewport ───── */
interface DriftingCloudProps {
  size: number;
  top: string;
  opacity: number;
  duration: number;
  delay: number;
  direction: "left" | "right";
  startOffset?: string;
  shape?: 1 | 2 | 3;
  color?: string;
}

function DriftingCloud({
  size,
  top,
  opacity,
  duration,
  delay,
  direction,
  startOffset,
  shape = 1,
  color = "rgba(186, 230, 253, 0.7)",
}: DriftingCloudProps) {
  const startX = startOffset ?? (direction === "right" ? "-20vw" : "110vw");
  const endX = direction === "right" ? "110vw" : "-20vw";

  const Cloud =
    shape === 1 ? CloudShape : shape === 2 ? CloudShape2 : CloudShape3;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top, opacity }}
      initial={{ x: startX }}
      animate={{
        x: [startX, endX],
        y: [0, -12, 8, -5, 0],
      }}
      transition={{
        x: { duration, delay, repeat: Infinity, ease: "linear" },
        y: {
          duration: duration * 0.35,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <Cloud size={size} color={color} />
    </motion.div>
  );
}

/**
 * Page-wide floating clouds overlay.
 * Crisp SVG clouds that drift across the entire viewport.
 * z-[1] sits above the bg gradient (z-0) but below content (z-10).
 */
export function FloatingClouds() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Layer 1 — Large distant clouds */}
      <DriftingCloud
        size={320}
        top="4%"
        opacity={0.4}
        duration={55}
        delay={0}
        direction="right"
        shape={1}
        color="rgba(186, 230, 253, 0.55)"
        startOffset="15vw"
      />
      <DriftingCloud
        size={360}
        top="16%"
        opacity={0.3}
        duration={65}
        delay={10}
        direction="left"
        shape={2}
        color="rgba(191, 219, 254, 0.45)"
        startOffset="55vw"
      />

      {/* Layer 2 — Medium clouds */}
      <DriftingCloud
        size={240}
        top="38%"
        opacity={0.35}
        duration={45}
        delay={3}
        direction="right"
        shape={3}
        color="rgba(186, 230, 253, 0.5)"
        startOffset="35vw"
      />
      <DriftingCloud
        size={280}
        top="52%"
        opacity={0.25}
        duration={52}
        delay={18}
        direction="left"
        shape={1}
        color="rgba(224, 242, 254, 0.5)"
      />

      {/* Layer 3 — Smaller closer clouds */}
      <DriftingCloud
        size={180}
        top="68%"
        opacity={0.35}
        duration={38}
        delay={1}
        direction="right"
        shape={2}
        color="rgba(186, 230, 253, 0.45)"
        startOffset="20vw"
      />
      <DriftingCloud
        size={200}
        top="82%"
        opacity={0.22}
        duration={48}
        delay={22}
        direction="left"
        shape={3}
        color="rgba(191, 219, 254, 0.4)"
        startOffset="70vw"
      />

      {/* Extra cloud near hero — visible immediately */}
      <DriftingCloud
        size={260}
        top="8%"
        opacity={0.35}
        duration={50}
        delay={0}
        direction="left"
        shape={2}
        color="rgba(224, 242, 254, 0.5)"
        startOffset="50vw"
      />
    </div>
  );
}
