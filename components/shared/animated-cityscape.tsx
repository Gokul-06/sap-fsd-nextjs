"use client";

/**
 * Animated SVG Cityscape — Westernacher-style line-art illustration
 * Shows SAP enterprise ecosystem: buildings, logistics, people, cloud
 * All elements animate with smooth CSS keyframes
 */
export function AnimatedCityscape() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Bottom gradient bar — Westernacher style */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B2A4A] via-[#0091DA] to-[#2A3F6E]" />

      <svg
        viewBox="0 0 1400 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Ground line */}
        <line x1="0" y1="240" x2="1400" y2="240" stroke="#0091DA" strokeWidth="2" strokeOpacity="0.3" />

        {/* === PERSON WITH CART (left) === */}
        <g className="animate-walk-person" style={{ animationDelay: "0s" }}>
          {/* Person body */}
          <circle cx="60" cy="195" r="8" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="60" y1="203" x2="60" y2="225" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="60" y1="210" x2="50" y2="218" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="60" y1="210" x2="70" y2="218" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="60" y1="225" x2="52" y2="238" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="60" y1="225" x2="68" y2="238" stroke="#0091DA" strokeWidth="1.5" />
          {/* Shopping cart */}
          <rect x="72" y="215" width="18" height="14" rx="2" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="72" y1="215" x2="68" y2="210" stroke="#0091DA" strokeWidth="1.5" />
          <circle cx="76" cy="233" r="2.5" stroke="#0091DA" strokeWidth="1" fill="none" />
          <circle cx="86" cy="233" r="2.5" stroke="#0091DA" strokeWidth="1" fill="none" />
        </g>

        {/* === OFFICE BUILDING (tall) === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.2s" }}>
          <rect x="110" y="120" width="50" height="120" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Windows - grid */}
          {[0, 1, 2, 3, 4, 5].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`win-${row}-${col}`}
                x={118 + col * 14}
                y={128 + row * 18}
                width="8"
                height="10"
                rx="1"
                fill="#0091DA"
                fillOpacity={0.12 + row * 0.03}
                stroke="#1B2A4A"
                strokeWidth="0.5"
              />
            ))
          )}
          <rect x="128" y="224" width="14" height="16" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
        </g>

        {/* === FACTORY WITH CHIMNEY === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.4s" }}>
          <rect x="175" y="155" width="65" height="85" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Chimney */}
          <rect x="185" y="130" width="12" height="25" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Smoke puffs — animated */}
          <g className="animate-smoke">
            <path d="M188 125 Q185 118 190 112" stroke="#0091DA" strokeWidth="1" fill="none" strokeOpacity="0.4" />
            <path d="M193 122 Q196 114 192 108" stroke="#0091DA" strokeWidth="1" fill="none" strokeOpacity="0.3" />
          </g>
          {/* Factory windows */}
          <rect x="183" y="165" width="18" height="12" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="207" y="165" width="18" height="12" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="183" y="195" width="18" height="12" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="207" y="195" width="18" height="12" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          {/* Sun/Cloud */}
          <g className="animate-float-fast">
            <line x1="280" y1="100" x2="280" y2="90" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="290" y1="103" x2="296" y2="95" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="270" y1="103" x2="264" y2="95" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.5" />
            <path d="M310 108 Q320 95 335 100 Q345 88 358 98 Q370 92 372 105 Q380 108 378 115 H308 Q305 112 310 108Z" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* === FORKLIFT === */}
        <g className="animate-drive-right" style={{ animationDelay: "1s" }}>
          <rect x="260" y="218" width="25" height="18" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="253" y="208" width="8" height="28" rx="1" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="251" y="200" width="12" height="10" rx="1" stroke="#0091DA" strokeWidth="1" fill="none" />
          <circle cx="263" cy="240" r="4" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="280" cy="240" r="4" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
        </g>

        {/* === WAREHOUSE === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.6s" }}>
          {/* Main structure */}
          <rect x="340" y="170" width="90" height="70" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Roof - pointed */}
          <path d="M335 170 L385 140 L435 170" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Garage door */}
          <rect x="365" y="210" width="28" height="30" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="365" y1="218" x2="393" y2="218" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="365" y1="226" x2="393" y2="226" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Trees */}
          <g>
            <circle cx="445" cy="215" r="10" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <circle cx="445" cy="208" r="8" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <line x1="445" y1="225" x2="445" y2="240" stroke="#1B2A4A" strokeWidth="1.5" />
          </g>
          <g>
            <circle cx="460" cy="220" r="7" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <circle cx="460" cy="215" r="5" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <line x1="460" y1="227" x2="460" y2="240" stroke="#1B2A4A" strokeWidth="1.5" />
          </g>
        </g>

        {/* === HOUSE/OFFICE SMALL === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.8s" }}>
          <rect x="480" y="185" width="55" height="55" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <path d="M475 185 L507 160 L540 185" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="498" y="215" width="16" height="25" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="486" y="195" width="10" height="10" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="518" y="195" width="10" height="10" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
        </g>

        {/* === DATA CENTER / SERVER === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.5s" }}>
          <rect x="570" y="180" width="35" height="60" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="570" y1="198" x2="605" y2="198" stroke="#1B2A4A" strokeWidth="0.5" />
          <line x1="570" y1="216" x2="605" y2="216" stroke="#1B2A4A" strokeWidth="0.5" />
          {/* Server lights — blinking */}
          <circle cx="578" cy="189" r="2" fill="#0091DA" className="animate-blink" />
          <circle cx="585" cy="189" r="2" fill="#10B981" className="animate-blink" style={{ animationDelay: "0.5s" }} />
          <circle cx="578" cy="207" r="2" fill="#0091DA" className="animate-blink" style={{ animationDelay: "1s" }} />
          <circle cx="585" cy="207" r="2" fill="#10B981" className="animate-blink" style={{ animationDelay: "1.5s" }} />
          <circle cx="578" cy="225" r="2" fill="#0091DA" className="animate-blink" style={{ animationDelay: "0.8s" }} />
          <circle cx="585" cy="225" r="2" fill="#F59E0B" className="animate-blink" style={{ animationDelay: "1.2s" }} />
          {/* Antenna */}
          <line x1="587" y1="180" x2="587" y2="165" stroke="#1B2A4A" strokeWidth="1.5" />
          <circle cx="587" cy="162" r="3" stroke="#0091DA" strokeWidth="1" fill="none" className="animate-pulse-ring" />
        </g>

        {/* === SILO/TANK === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.7s" }}>
          <rect x="625" y="185" width="22" height="55" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <path d="M625 185 Q636 175 647 185" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="628" y1="200" x2="644" y2="200" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="628" y1="210" x2="644" y2="210" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.5" />
        </g>

        {/* === FUEL/GAS STATION === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.3s" }}>
          <rect x="660" y="205" width="35" height="35" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="670" y="195" width="15" height="10" rx="1" stroke="#0091DA" strokeWidth="1" fill="none" />
          <line x1="695" y1="220" x2="705" y2="215" stroke="#1B2A4A" strokeWidth="1.5" />
        </g>

        {/* === MOVING TRUCK === */}
        <g className="animate-drive-left" style={{ animationDelay: "0.5s" }}>
          {/* Trailer */}
          <rect x="720" y="195" width="95" height="42" rx="3" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Cab */}
          <rect x="815" y="207" width="32" height="30" rx="3" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="822" y="212" width="18" height="12" rx="2" stroke="#0091DA" strokeWidth="1" fill="none" />
          {/* Wheels */}
          <circle cx="745" cy="240" r="5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="765" cy="240" r="5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="830" cy="240" r="5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Cargo container pattern */}
          <line x1="740" y1="195" x2="740" y2="237" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="760" y1="195" x2="760" y2="237" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="780" y1="195" x2="780" y2="237" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="800" y1="195" x2="800" y2="237" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>

        {/* === CONTAINER / SHIPPING === */}
        <g className="animate-building-rise" style={{ animationDelay: "1s" }}>
          <rect x="870" y="185" width="50" height="35" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Container bars */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`bar-${i}`}
              x1={880 + i * 8}
              y1="188"
              x2={880 + i * 8}
              y2="217"
              stroke="#1B2A4A"
              strokeWidth="1.5"
            />
          ))}
          {/* Crane hook */}
          <line x1="895" y1="150" x2="895" y2="185" stroke="#1B2A4A" strokeWidth="1" strokeDasharray="4 2" />
          <path d="M890 150 L895 143 L900 150" stroke="#0091DA" strokeWidth="1.5" fill="none" />
        </g>

        {/* === DELIVERY PERSON === */}
        <g className="animate-walk-person" style={{ animationDelay: "2s" }}>
          <circle cx="960" cy="200" r="7" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="960" y1="207" x2="960" y2="226" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="960" y1="213" x2="952" y2="220" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="960" y1="213" x2="968" y2="208" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="960" y1="226" x2="954" y2="238" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="960" y1="226" x2="966" y2="238" stroke="#0091DA" strokeWidth="1.5" />
          {/* Carrying box */}
          <rect x="966" y="204" width="14" height="12" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
        </g>

        {/* === RECYCLING / CIRCULAR ARROWS === */}
        <g className="animate-spin-slow" style={{ transformOrigin: "1020px 215px" }}>
          <path d="M1010 205 A15 15 0 0 1 1030 205" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <path d="M1030 225 A15 15 0 0 1 1010 225" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <polygon points="1030,203 1033,208 1027,208" fill="#0091DA" />
          <polygon points="1010,227 1007,222 1013,222" fill="#0091DA" />
        </g>

        {/* === DELIVERY VAN === */}
        <g className="animate-drive-right" style={{ animationDelay: "1.5s" }}>
          <rect x="1060" y="208" width="40" height="28" rx="3" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="1100" y="215" width="20" height="21" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="1104" y="218" width="12" height="8" rx="1" stroke="#0091DA" strokeWidth="1" fill="none" />
          <circle cx="1072" cy="240" r="4" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="1092" cy="240" r="4" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
        </g>

        {/* === AIRPLANE === */}
        <g className="animate-fly-plane">
          <path d="M1200 125 L1230 120 L1250 118 L1260 110 L1262 118 L1290 116 L1262 122 L1260 130 L1250 122 L1200 125Z" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Trail */}
          <line x1="1195" y1="126" x2="1175" y2="128" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
        </g>

        {/* === PERSON WITH CART (right) === */}
        <g className="animate-walk-person" style={{ animationDelay: "3s" }}>
          <circle cx="1340" cy="198" r="7" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="1340" y1="205" x2="1340" y2="224" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1340" y1="212" x2="1332" y2="219" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1340" y1="212" x2="1348" y2="219" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1340" y1="224" x2="1334" y2="238" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1340" y1="224" x2="1346" y2="238" stroke="#0091DA" strokeWidth="1.5" />
          {/* Cart */}
          <rect x="1350" y="218" width="16" height="12" rx="2" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <circle cx="1354" cy="234" r="2.5" stroke="#0091DA" strokeWidth="1" fill="none" />
          <circle cx="1362" cy="234" r="2.5" stroke="#0091DA" strokeWidth="1" fill="none" />
        </g>

        {/* === Animated data flow dots (traveling along ground line) === */}
        <circle r="3" fill="#0091DA" fillOpacity="0.6" className="animate-data-flow">
          <animateMotion dur="8s" repeatCount="indefinite" path="M0,240 L1400,240" />
        </circle>
        <circle r="2" fill="#0091DA" fillOpacity="0.4" className="animate-data-flow">
          <animateMotion dur="12s" repeatCount="indefinite" path="M1400,240 L0,240" begin="2s" />
        </circle>
        <circle r="2.5" fill="#10B981" fillOpacity="0.5" className="animate-data-flow">
          <animateMotion dur="10s" repeatCount="indefinite" path="M200,240 L1200,240" begin="4s" />
        </circle>
      </svg>
    </div>
  );
}
