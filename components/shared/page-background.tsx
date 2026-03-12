"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function PageBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.3 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: (e.clientY + window.scrollY) / document.body.scrollHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      {/* Base subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50/20 to-white" />

      {/* Top-left sky orb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute w-[800px] h-[800px] -top-60 -left-60 bg-sky-200/40 rounded-full blur-[120px] animate-float-slow"
      />

      {/* Top-right violet orb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute w-[700px] h-[700px] -top-20 -right-48 bg-violet-200/30 rounded-full blur-[110px] animate-float-medium"
      />

      {/* Middle-left blue orb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute w-[600px] h-[600px] top-[40%] -left-40 bg-blue-200/25 rounded-full blur-[100px] animate-float-fast"
      />

      {/* Bottom-right sky orb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute w-[600px] h-[600px] top-[70%] -right-40 bg-sky-200/25 rounded-full blur-[100px] animate-float-slow"
      />

      {/* Mouse-follow glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-sky-200/15 transition-all duration-[3000ms] ease-out"
        style={{
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
