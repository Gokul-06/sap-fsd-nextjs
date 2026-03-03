"use client";

import { motion } from "framer-motion";

/* ───── Cloud SVG shapes ───── */
function CloudShape1() {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M160 60H40c-11 0-20-9-20-20s9-20 20-20c1.5 0 3 .15 4.4.45C49.5 10.2 59 3 70 3c8 0 15 3.8 19.5 9.6C93 7.5 99 4 106 4c13.3 0 24 10.7 24 24 0 1.2-.1 2.3-.3 3.4C135.5 33 140 37.7 140 43.5c0 .5 0 1-.1 1.5h20c11 0 20 9 20 20s-9 15-20 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloudShape2() {
  return (
    <svg viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M200 70H40c-13 0-24-10-24-23s11-23 24-23c2 0 4 .2 5.8.6C52 12 64 3 78 3c10 0 18 4.5 23 11.5C106 8 113 4 122 4c16 0 29 13 29 29 0 1.5-.1 2.8-.4 4.1C158 39 164 44.5 164 51.5c0 .6 0 1.2-.1 1.8h36c13 0 24 10 24 18s-11 18.7-24 18.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloudShape3() {
  return (
    <svg viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M150 55H30c-10 0-18-8-18-18s8-18 18-18c1.3 0 2.6.12 3.8.38C38 8.5 46.5 2 57 2c7 0 13 3.3 17 8.3C77.5 5.5 83 3 89 3c11.5 0 21 9.3 21 21 0 1-.1 2-.2 3C115 28.5 119 32.7 119 38c0 .4 0 .9-.1 1.3h31c10 0 18 7 18 18s-8 13.7-18 13.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

const cloudShapes = [CloudShape1, CloudShape2, CloudShape3];

/* ───── Cloud that drifts horizontally across the page ───── */
interface DriftingCloudProps {
  size: number;
  top: string;
  opacity: number;
  duration: number;
  delay: number;
  direction: "left" | "right";
  shapeIndex: number;
}

function DriftingCloud({ size, top, opacity, duration, delay, direction, shapeIndex }: DriftingCloudProps) {
  const Shape = cloudShapes[shapeIndex % cloudShapes.length];
  const startX = direction === "right" ? "-15vw" : "110vw";
  const endX = direction === "right" ? "110vw" : "-15vw";

  return (
    <motion.div
      className="absolute pointer-events-none text-sky-200/80"
      style={{ top, width: size, opacity }}
      initial={{ x: startX, y: 0 }}
      animate={{
        x: [startX, endX],
        y: [0, -15, 8, -10, 0],
      }}
      transition={{
        x: { duration, delay, repeat: Infinity, ease: "linear" },
        y: { duration: duration * 0.4, delay, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Shape />
    </motion.div>
  );
}

/**
 * Page-wide floating clouds overlay.
 * Place this in the root layout or page wrapper with `fixed inset-0 z-0 pointer-events-none`.
 */
export function FloatingClouds() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1 — Large slow clouds */}
      <DriftingCloud size={260} top="5%"  opacity={0.12} duration={45} delay={0}  direction="right" shapeIndex={0} />
      <DriftingCloud size={300} top="18%" opacity={0.08} duration={55} delay={8}  direction="left"  shapeIndex={1} />

      {/* Layer 2 — Medium clouds */}
      <DriftingCloud size={180} top="35%" opacity={0.10} duration={38} delay={5}  direction="right" shapeIndex={2} />
      <DriftingCloud size={200} top="50%" opacity={0.07} duration={50} delay={15} direction="left"  shapeIndex={0} />

      {/* Layer 3 — Small faster clouds */}
      <DriftingCloud size={140} top="65%" opacity={0.09} duration={32} delay={3}  direction="right" shapeIndex={1} />
      <DriftingCloud size={160} top="78%" opacity={0.06} duration={42} delay={20} direction="left"  shapeIndex={2} />
      <DriftingCloud size={120} top="88%" opacity={0.08} duration={35} delay={12} direction="right" shapeIndex={0} />
    </div>
  );
}
