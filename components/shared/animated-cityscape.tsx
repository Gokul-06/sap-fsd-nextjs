"use client";

/**
 * Animated SVG Supply Chain Cityscape — Westernacher-style
 * WHITE background, dark navy/blue line art
 * Shows: factories, warehouses, trucks, ships, containers, forklifts, people, airplanes
 */
export function AnimatedCityscape() {
  return (
    <div className="relative w-full overflow-hidden bg-white pt-8 pb-0">
      {/* Bottom gradient bar — Westernacher style (navy to blue to purple) */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1B2A4A] via-[#0091DA] to-[#3B2667]" />

      <svg
        viewBox="0 0 1600 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Ground line */}
        <line x1="0" y1="275" x2="1600" y2="275" stroke="#0091DA" strokeWidth="2" strokeOpacity="0.25" />

        {/* === PERSON WITH SHOPPING CART (far left) === */}
        <g className="animate-walk-person" style={{ animationDelay: "0s" }}>
          <circle cx="45" cy="228" r="9" stroke="#0091DA" strokeWidth="1.8" fill="none" />
          <line x1="45" y1="237" x2="45" y2="260" stroke="#0091DA" strokeWidth="1.8" />
          <line x1="45" y1="245" x2="35" y2="253" stroke="#0091DA" strokeWidth="1.8" />
          <line x1="45" y1="245" x2="55" y2="253" stroke="#0091DA" strokeWidth="1.8" />
          <line x1="45" y1="260" x2="38" y2="274" stroke="#0091DA" strokeWidth="1.8" />
          <line x1="45" y1="260" x2="52" y2="274" stroke="#0091DA" strokeWidth="1.8" />
          {/* Cart */}
          <rect x="58" y="250" width="20" height="16" rx="2" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="58" y1="250" x2="53" y2="244" stroke="#0091DA" strokeWidth="1.5" />
          <circle cx="62" cy="270" r="3" stroke="#0091DA" strokeWidth="1.2" fill="none" />
          <circle cx="74" cy="270" r="3" stroke="#0091DA" strokeWidth="1.2" fill="none" />
        </g>

        {/* === TALL OFFICE BUILDING === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.2s" }}>
          <rect x="100" y="140" width="60" height="135" rx="2" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          {[0, 1, 2, 3, 4, 5, 6].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`owin-${row}-${col}`}
                x={107 + col * 13}
                y={148 + row * 17}
                width="7"
                height="9"
                rx="1"
                fill="#0091DA"
                fillOpacity={0.08 + row * 0.02}
                stroke="#1B2A4A"
                strokeWidth="0.5"
              />
            ))
          )}
          <rect x="122" y="260" width="16" height="15" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
        </g>

        {/* === FACTORY WITH SMOKESTACKS === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.35s" }}>
          <rect x="180" y="180" width="80" height="95" rx="2" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          {/* Two chimneys */}
          <rect x="192" y="152" width="12" height="28" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="215" y="158" width="10" height="22" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Smoke — animated */}
          <g className="animate-smoke">
            <path d="M196 148 Q192 138 198 130" stroke="#0091DA" strokeWidth="1.2" fill="none" strokeOpacity="0.4" />
            <path d="M200 145 Q204 134 199 126" stroke="#0091DA" strokeWidth="1" fill="none" strokeOpacity="0.25" />
            <path d="M218 154 Q222 144 219 136" stroke="#0091DA" strokeWidth="1" fill="none" strokeOpacity="0.3" />
          </g>
          {/* Windows */}
          <rect x="190" y="192" width="20" height="14" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="218" y="192" width="20" height="14" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="190" y="222" width="20" height="14" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="218" y="222" width="20" height="14" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="245" y="192" width="10" height="50" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          {/* Sun rays + Cloud */}
          <g className="animate-float-fast">
            <line x1="310" y1="115" x2="310" y2="103" stroke="#0091DA" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="321" y1="119" x2="328" y2="110" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="299" y1="119" x2="292" y2="110" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.4" />
            <path d="M345 125 Q355 110 372 115 Q382 100 398 110 Q412 103 415 118 Q422 122 420 130 H342 Q338 127 345 125Z" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* === FORKLIFT === */}
        <g className="animate-drive-right" style={{ animationDelay: "0.8s" }}>
          <rect x="290" y="252" width="28" height="20" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="282" y="240" width="9" height="32" rx="1" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="280" y="230" width="13" height="12" rx="1" stroke="#0091DA" strokeWidth="1.2" fill="none" />
          <circle cx="295" cy="275" r="4.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="313" cy="275" r="4.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
        </g>

        {/* === LARGE WAREHOUSE === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.5s" }}>
          <rect x="360" y="200" width="110" height="75" rx="2" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          <path d="M354 200 L415 165 L476 200" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          <rect x="392" y="244" width="32" height="31" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="392" y1="254" x2="424" y2="254" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.3" />
          <line x1="392" y1="264" x2="424" y2="264" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.3" />
          {/* Trees next to warehouse */}
          <g>
            <circle cx="485" cy="248" r="12" stroke="#1B2A4A" strokeWidth="1.2" fill="none" />
            <circle cx="485" cy="240" r="9" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <line x1="485" y1="260" x2="485" y2="275" stroke="#1B2A4A" strokeWidth="1.5" />
          </g>
          <g>
            <circle cx="504" cy="254" r="8" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <circle cx="504" cy="248" r="6" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <line x1="504" y1="262" x2="504" y2="275" stroke="#1B2A4A" strokeWidth="1.5" />
          </g>
          <g>
            <circle cx="520" cy="256" r="7" stroke="#1B2A4A" strokeWidth="1" fill="none" />
            <line x1="520" y1="263" x2="520" y2="275" stroke="#1B2A4A" strokeWidth="1.2" />
          </g>
        </g>

        {/* === SMALL HOUSE/DISTRIBUTION CENTER === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.7s" }}>
          <rect x="540" y="215" width="60" height="60" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <path d="M534 215 L570 185 L606 215" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="558" y="248" width="18" height="27" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="546" y="228" width="10" height="10" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="580" y="228" width="10" height="10" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
        </g>

        {/* === DATA CENTER / SERVER RACK === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.45s" }}>
          <rect x="625" y="210" width="40" height="65" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="625" y1="232" x2="665" y2="232" stroke="#1B2A4A" strokeWidth="0.5" />
          <line x1="625" y1="253" x2="665" y2="253" stroke="#1B2A4A" strokeWidth="0.5" />
          {/* Blinking server lights */}
          <circle cx="634" cy="221" r="2.5" fill="#0091DA" className="animate-blink" />
          <circle cx="642" cy="221" r="2.5" fill="#10B981" className="animate-blink" style={{ animationDelay: "0.5s" }} />
          <circle cx="650" cy="221" r="2" fill="#F59E0B" className="animate-blink" style={{ animationDelay: "1s" }} />
          <circle cx="634" cy="242" r="2.5" fill="#0091DA" className="animate-blink" style={{ animationDelay: "0.7s" }} />
          <circle cx="642" cy="242" r="2.5" fill="#10B981" className="animate-blink" style={{ animationDelay: "1.2s" }} />
          <circle cx="634" cy="263" r="2.5" fill="#0091DA" className="animate-blink" style={{ animationDelay: "0.3s" }} />
          <circle cx="642" cy="263" r="2" fill="#10B981" className="animate-blink" style={{ animationDelay: "1.8s" }} />
          {/* Antenna with signal */}
          <line x1="650" y1="210" x2="650" y2="192" stroke="#1B2A4A" strokeWidth="1.5" />
          <circle cx="650" cy="189" r="3.5" stroke="#0091DA" strokeWidth="1" fill="none" className="animate-pulse-ring" />
        </g>

        {/* === SILO / STORAGE TANK === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.6s" }}>
          <rect x="685" y="215" width="24" height="60" rx="3" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <path d="M685 215 Q697 203 709 215" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="689" y1="232" x2="705" y2="232" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="689" y1="248" x2="705" y2="248" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.4" />
        </g>

        {/* === CONVEYOR BELT (supply chain element) === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.9s" }}>
          <line x1="730" y1="260" x2="800" y2="260" stroke="#1B2A4A" strokeWidth="1.5" />
          <line x1="730" y1="260" x2="725" y2="275" stroke="#1B2A4A" strokeWidth="1.5" />
          <line x1="800" y1="260" x2="805" y2="275" stroke="#1B2A4A" strokeWidth="1.5" />
          {/* Boxes on conveyor — animated */}
          <g className="animate-drive-right" style={{ animationDelay: "0s" }}>
            <rect x="738" y="247" width="12" height="12" rx="1" stroke="#0091DA" strokeWidth="1.2" fill="none" />
            <rect x="758" y="247" width="12" height="12" rx="1" stroke="#1B2A4A" strokeWidth="1.2" fill="none" />
            <rect x="778" y="247" width="12" height="12" rx="1" stroke="#0091DA" strokeWidth="1.2" fill="none" />
          </g>
          {/* Rollers */}
          <circle cx="740" cy="263" r="3" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <circle cx="755" cy="263" r="3" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <circle cx="770" cy="263" r="3" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <circle cx="785" cy="263" r="3" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <circle cx="800" cy="263" r="3" stroke="#1B2A4A" strokeWidth="1" fill="none" />
        </g>

        {/* === LARGE TRUCK WITH TRAILER === */}
        <g className="animate-drive-left" style={{ animationDelay: "0.3s" }}>
          <rect x="830" y="225" width="105" height="46" rx="3" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          <rect x="935" y="238" width="35" height="33" rx="3" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          <rect x="942" y="244" width="20" height="13" rx="2" stroke="#0091DA" strokeWidth="1.2" fill="none" />
          <circle cx="858" cy="275" r="5.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="880" cy="275" r="5.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="950" cy="275" r="5.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Container stripes */}
          <line x1="855" y1="225" x2="855" y2="271" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.25" />
          <line x1="878" y1="225" x2="878" y2="271" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.25" />
          <line x1="901" y1="225" x2="901" y2="271" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.25" />
          <line x1="924" y1="225" x2="924" y2="271" stroke="#1B2A4A" strokeWidth="0.5" strokeOpacity="0.25" />
        </g>

        {/* === SHIPPING CONTAINER WITH CRANE === */}
        <g className="animate-building-rise" style={{ animationDelay: "0.85s" }}>
          <rect x="1000" y="218" width="55" height="38" rx="2" stroke="#1B2A4A" strokeWidth="1.8" fill="none" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`cbar-${i}`}
              x1={1010 + i * 8}
              y1="221"
              x2={1010 + i * 8}
              y2="253"
              stroke="#1B2A4A"
              strokeWidth="1.5"
            />
          ))}
          {/* Crane arm */}
          <line x1="1028" y1="178" x2="1028" y2="218" stroke="#1B2A4A" strokeWidth="1" strokeDasharray="4 2" />
          <path d="M1022 178 L1028 168 L1034 178" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="1028" y1="168" x2="1028" y2="155" stroke="#1B2A4A" strokeWidth="1.2" />
          {/* Crane base */}
          <line x1="1020" y1="155" x2="1036" y2="155" stroke="#1B2A4A" strokeWidth="1.5" />
        </g>

        {/* === CARGO SHIP (supply chain!) === */}
        <g className="animate-drive-right" style={{ animationDelay: "2s" }}>
          <path d="M1080 260 L1090 275 L1160 275 L1165 260Z" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="1095" y="242" width="55" height="18" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          {/* Containers on ship */}
          <rect x="1100" y="245" width="12" height="12" rx="1" stroke="#0091DA" strokeWidth="1" fill="none" />
          <rect x="1115" y="245" width="12" height="12" rx="1" stroke="#1B2A4A" strokeWidth="1" fill="none" />
          <rect x="1130" y="245" width="12" height="12" rx="1" stroke="#0091DA" strokeWidth="1" fill="none" />
          {/* Smokestack */}
          <rect x="1108" y="232" width="8" height="10" stroke="#1B2A4A" strokeWidth="1.2" fill="none" />
          <g className="animate-smoke">
            <path d="M1111 228 Q1108 220 1113 215" stroke="#0091DA" strokeWidth="0.8" fill="none" strokeOpacity="0.3" />
          </g>
        </g>

        {/* === DELIVERY PERSON WITH PACKAGE === */}
        <g className="animate-walk-person" style={{ animationDelay: "1.5s" }}>
          <circle cx="1200" cy="230" r="8" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="1200" y1="238" x2="1200" y2="260" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1200" y1="246" x2="1192" y2="253" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1200" y1="246" x2="1210" y2="240" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1200" y1="260" x2="1194" y2="274" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1200" y1="260" x2="1206" y2="274" stroke="#0091DA" strokeWidth="1.5" />
          <rect x="1208" y="236" width="15" height="13" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
        </g>

        {/* === RECYCLING / CIRCULAR SUPPLY CHAIN === */}
        <g className="animate-spin-slow" style={{ transformOrigin: "1260px 252px" }}>
          <path d="M1248 240 A18 18 0 0 1 1272 240" stroke="#0091DA" strokeWidth="1.8" fill="none" />
          <path d="M1272 264 A18 18 0 0 1 1248 264" stroke="#0091DA" strokeWidth="1.8" fill="none" />
          <polygon points="1272,238 1276,244 1268,244" fill="#0091DA" />
          <polygon points="1248,266 1244,260 1252,260" fill="#0091DA" />
        </g>

        {/* === DELIVERY VAN === */}
        <g className="animate-drive-right" style={{ animationDelay: "1s" }}>
          <rect x="1310" y="242" width="44" height="30" rx="3" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="1354" y="250" width="22" height="22" rx="2" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <rect x="1358" y="254" width="14" height="9" rx="1" stroke="#0091DA" strokeWidth="1" fill="none" />
          <circle cx="1324" cy="275" r="4.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <circle cx="1346" cy="275" r="4.5" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
        </g>

        {/* === AIRPLANE === */}
        <g className="animate-fly-plane">
          <path d="M1400 140 L1435 134 L1458 132 L1470 122 L1472 132 L1505 130 L1472 136 L1470 146 L1458 136 L1400 140Z" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
          <line x1="1394" y1="141" x2="1370" y2="144" stroke="#0091DA" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 3" />
        </g>

        {/* === PERSON WITH CART (far right) === */}
        <g className="animate-walk-person" style={{ animationDelay: "2.5s" }}>
          <circle cx="1550" cy="232" r="8" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <line x1="1550" y1="240" x2="1550" y2="260" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1550" y1="248" x2="1542" y2="255" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1550" y1="248" x2="1558" y2="255" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1550" y1="260" x2="1544" y2="274" stroke="#0091DA" strokeWidth="1.5" />
          <line x1="1550" y1="260" x2="1556" y2="274" stroke="#0091DA" strokeWidth="1.5" />
          <rect x="1562" y="254" width="18" height="14" rx="2" stroke="#0091DA" strokeWidth="1.5" fill="none" />
          <circle cx="1566" cy="272" r="2.5" stroke="#0091DA" strokeWidth="1" fill="none" />
          <circle cx="1576" cy="272" r="2.5" stroke="#0091DA" strokeWidth="1" fill="none" />
        </g>

        {/* === Animated data-flow dots traveling along ground === */}
        <circle r="3.5" fill="#0091DA" fillOpacity="0.6" className="animate-data-flow">
          <animateMotion dur="10s" repeatCount="indefinite" path="M0,275 L1600,275" />
        </circle>
        <circle r="2.5" fill="#0091DA" fillOpacity="0.35" className="animate-data-flow">
          <animateMotion dur="14s" repeatCount="indefinite" path="M1600,275 L0,275" begin="3s" />
        </circle>
        <circle r="3" fill="#10B981" fillOpacity="0.45" className="animate-data-flow">
          <animateMotion dur="11s" repeatCount="indefinite" path="M300,275 L1300,275" begin="5s" />
        </circle>
      </svg>
    </div>
  );
}
