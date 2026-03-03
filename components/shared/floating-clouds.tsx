"use client";

import { motion } from "framer-motion";

/* ───── Soft blurred cloud using layered divs ───── */
function SoftCloud({ size, blur, color }: { size: number; blur: number; color: string }) {
  const blobSize = size * 0.45;
  return (
    <div className="relative" style={{ width: size, height: size * 0.4 }}>
      {/* Main body */}
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size * 0.35,
          bottom: 0,
          left: 0,
          background: color,
          filter: `blur(${blur}px)`,
        }}
      />
      {/* Top bumps */}
      <div
        className="absolute rounded-full"
        style={{
          width: blobSize,
          height: blobSize,
          bottom: size * 0.12,
          left: size * 0.15,
          background: color,
          filter: `blur(${blur * 0.9}px)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: blobSize * 1.3,
          height: blobSize * 1.3,
          bottom: size * 0.15,
          left: size * 0.35,
          background: color,
          filter: `blur(${blur}px)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: blobSize * 0.8,
          height: blobSize * 0.8,
          bottom: size * 0.1,
          right: size * 0.15,
          background: color,
          filter: `blur(${blur * 0.8}px)`,
        }}
      />
    </div>
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
  blur: number;
  color?: string;
  startOffset?: string;
}

function DriftingCloud({
  size,
  top,
  opacity,
  duration,
  delay,
  direction,
  blur,
  color = "rgba(186, 230, 253, 0.7)",
  startOffset,
}: DriftingCloudProps) {
  const startX = startOffset ?? (direction === "right" ? "-20vw" : "110vw");
  const endX = direction === "right" ? "110vw" : "-20vw";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top, opacity }}
      initial={{ x: startX }}
      animate={{
        x: [startX, endX],
        y: [0, -15, 10, -6, 0],
      }}
      transition={{
        x: { duration, delay, repeat: Infinity, ease: "linear" },
        y: { duration: duration * 0.35, delay, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <SoftCloud size={size} blur={blur} color={color} />
    </motion.div>
  );
}

/**
 * Page-wide floating clouds overlay.
 * Soft blurred clouds that drift across the entire viewport.
 * z-[1] sits above the bg gradient (z-0) but below content (z-10).
 */
export function FloatingClouds() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Layer 1 — Large soft distant clouds */}
      <DriftingCloud
        size={380} top="5%" opacity={0.55} duration={55} delay={0}
        direction="right" blur={35} color="rgba(186, 230, 253, 0.6)"
        startOffset="10vw"
      />
      <DriftingCloud
        size={420} top="18%" opacity={0.4} duration={65} delay={8}
        direction="left" blur={45} color="rgba(191, 219, 254, 0.55)"
        startOffset="60vw"
      />

      {/* Layer 2 — Medium clouds */}
      <DriftingCloud
        size={280} top="40%" opacity={0.5} duration={45} delay={2}
        direction="right" blur={28} color="rgba(186, 230, 253, 0.55)"
        startOffset="40vw"
      />
      <DriftingCloud
        size={320} top="55%" opacity={0.35} duration={52} delay={15}
        direction="left" blur={32} color="rgba(224, 242, 254, 0.6)"
      />

      {/* Layer 3 — Smaller closer clouds */}
      <DriftingCloud
        size={200} top="70%" opacity={0.45} duration={38} delay={1}
        direction="right" blur={20} color="rgba(186, 230, 253, 0.5)"
        startOffset="25vw"
      />
      <DriftingCloud
        size={240} top="82%" opacity={0.3} duration={48} delay={18}
        direction="left" blur={25} color="rgba(191, 219, 254, 0.45)"
        startOffset="75vw"
      />

      {/* Extra cloud for hero area — immediately visible */}
      <DriftingCloud
        size={300} top="8%" opacity={0.45} duration={50} delay={0}
        direction="left" blur={30} color="rgba(224, 242, 254, 0.55)"
        startOffset="50vw"
      />
    </div>
  );
}
