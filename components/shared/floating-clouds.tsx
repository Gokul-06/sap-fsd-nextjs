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
}

function DriftingCloud({
  size,
  top,
  opacity,
  duration,
  delay,
  direction,
  blur,
  color = "rgba(186, 230, 253, 0.6)",
}: DriftingCloudProps) {
  const startX = direction === "right" ? "-20vw" : "110vw";
  const endX = direction === "right" ? "110vw" : "-20vw";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top, opacity }}
      initial={{ x: startX }}
      animate={{
        x: [startX, endX],
        y: [0, -20, 12, -8, 0],
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
 */
export function FloatingClouds() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1 — Large soft distant clouds */}
      <DriftingCloud
        size={350} top="3%" opacity={0.35} duration={60} delay={0}
        direction="right" blur={40} color="rgba(186, 230, 253, 0.5)"
      />
      <DriftingCloud
        size={400} top="15%" opacity={0.25} duration={70} delay={12}
        direction="left" blur={50} color="rgba(191, 219, 254, 0.4)"
      />

      {/* Layer 2 — Medium clouds */}
      <DriftingCloud
        size={250} top="38%" opacity={0.3} duration={48} delay={6}
        direction="right" blur={30} color="rgba(186, 230, 253, 0.45)"
      />
      <DriftingCloud
        size={280} top="52%" opacity={0.2} duration={55} delay={20}
        direction="left" blur={35} color="rgba(224, 242, 254, 0.5)"
      />

      {/* Layer 3 — Smaller closer clouds */}
      <DriftingCloud
        size={180} top="68%" opacity={0.28} duration={40} delay={4}
        direction="right" blur={22} color="rgba(186, 230, 253, 0.4)"
      />
      <DriftingCloud
        size={220} top="80%" opacity={0.18} duration={52} delay={25}
        direction="left" blur={28} color="rgba(191, 219, 254, 0.35)"
      />
    </div>
  );
}
