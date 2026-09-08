import React from 'react';
import { Sparkles, Eye, ShieldCheck } from 'lucide-react';

interface HardwareArtProps {
  id: string;
  className?: string;
  animate?: boolean;
}

export const HardwareVisualArt: React.FC<HardwareArtProps> = ({ id, className = 'w-12 h-12', animate = false }) => {
  switch (id) {
    case 'cpu':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cpuSubstrate" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#047857" />
              <stop offset="0.5" stopColor="#065f46" />
              <stop offset="1" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="cpuIhsReflect" x1="18" y1="18" x2="82" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.25" stopColor="#e2e8f0" />
              <stop offset="0.75" stopColor="#94a3b8" />
              <stop offset="1" stopColor="#64748b" />
            </linearGradient>
            <filter id="cpuDrop" x="4" y="4" width="92" height="92" filterUnits="userSpaceOnUse">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>
          {/* Green Silicon Substrate with Chamfered Corners */}
          <rect x="8" y="8" width="84" height="84" rx="7" fill="url(#cpuSubstrate)" stroke="#10b981" strokeWidth="1.5" filter="url(#cpuDrop)" />
          
          {/* Outer Circuit Border & Test Points */}
          <rect x="12" y="12" width="76" height="76" rx="5" fill="none" stroke="#059669" strokeWidth="0.8" strokeDasharray="3 1.5" />
          <circle cx="16" cy="24" r="1" fill="#facc15" />
          <circle cx="16" cy="30" r="1" fill="#facc15" />
          <circle cx="84" cy="24" r="1" fill="#facc15" />
          <circle cx="84" cy="30" r="1" fill="#facc15" />

          {/* Key Alignment Notches on Left & Right Edges */}
          <path d="M 8 46 Q 13 50 8 54 Z" fill="#022c22" />
          <path d="M 92 46 Q 87 50 92 54 Z" fill="#022c22" />

          {/* Metallic Nickel Integrated Heat Spreader (IHS) */}
          <rect x="20" y="20" width="60" height="60" rx="6" fill="url(#cpuIhsReflect)" stroke="#cbd5e1" strokeWidth="1.8" />
          {/* Inner IHS Recess Bevel */}
          <rect x="25" y="25" width="50" height="50" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" opacity="0.9" />

          {/* Golden Pin 1 Orientation Triangle */}
          <polygon points="10,10 24,10 10,24" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <polygon points="12,12 18,12 12,18" fill="#ffffff" opacity="0.8" />

          {/* Authentic Laser-etched Specifications */}
          <text x="50" y="38" fill="#1e293b" fontSize="6.5" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.5" textAnchor="middle">CORE PROCESSOR</text>
          <text x="50" y="48" fill="#0284c7" fontSize="8" fontWeight="900" fontFamily="monospace" textAnchor="middle">i7 / RYZEN</text>
          <text x="50" y="58" fill="#334155" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3.80 - 5.10 GHz</text>
          <text x="50" y="67" fill="#64748b" fontSize="4.5" fontWeight="semibold" fontFamily="monospace" textAnchor="middle">LGA1700 • UNLOCKED</text>

          {/* High-visibility "PIN 1" identification flag */}
          <rect x="26" y="70" width="48" height="6.5" rx="2" fill="#0f172a" />
          <text x="50" y="75" fill="#fde047" fontSize="4.2" fontWeight="900" fontFamily="monospace" textAnchor="middle">▲ PIN 1 ALIGNMENT</text>
        </svg>
      );

    case 'ram':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ramBodyBlue" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#1d4ed8" />
              <stop offset="0.5" stopColor="#2563eb" />
              <stop offset="1" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="goldPinsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#fde047" />
              <stop offset="1" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          
          {/* Dual-Channel Stick 1 (Rear, angled perspective) */}
          <g opacity="0.8" transform="translate(6, 2)">
            <rect x="6" y="16" width="76" height="46" rx="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.2" />
            <path d="M 10 20 L 78 20 L 74 28 L 14 28 Z" fill="#172554" />
            <rect x="10" y="62" width="30" height="7" fill="url(#goldPinsGrad)" />
            <rect x="44" y="62" width="34" height="7" fill="url(#goldPinsGrad)" />
          </g>

          {/* Dual-Channel Stick 2 (Front, prominent detail) */}
          <g transform="translate(12, 16)">
            {/* Primary Anodized Aluminum Heatspreader Body */}
            <rect x="4" y="14" width="78" height="46" rx="4" fill="url(#ramBodyBlue)" stroke="#60a5fa" strokeWidth="1.6" />
            
            {/* Aggressive Top Cooling Fin Serrations */}
            <path d="M 8 14 L 14 6 L 22 14 L 30 6 L 38 14 L 46 6 L 54 14 L 62 6 L 70 14 L 78 14" stroke="#93c5fd" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
            
            {/* Horizontal Aluminum Heat Distribution Ridge */}
            <rect x="8" y="22" width="70" height="8" rx="2" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.8" />
            <line x1="12" y1="26" x2="74" y2="26" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />

            {/* Manufacturer Spec Label Sticker */}
            <rect x="18" y="34" width="50" height="17" rx="2.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
            <text x="43" y="42" fill="#0f172a" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">16GB DDR4 RAM</text>
            <text x="43" y="48" fill="#2563eb" fontSize="4.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3200MHz • DUAL CH</text>

            {/* Gold Edge Connector Contacts with OFF-CENTER KEY NOTCH */}
            <rect x="8" y="60" width="30" height="9" rx="1" fill="url(#goldPinsGrad)" stroke="#b45309" strokeWidth="0.5" />
            {/* Contact Pin Vertical Stripes */}
            <line x1="14" y1="61" x2="14" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="20" y1="61" x2="20" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="26" y1="61" x2="26" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="32" y1="61" x2="32" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />

            {/* The Key Notch Separation (Gap between pin groups) */}
            <rect x="43" y="60" width="35" height="9" rx="1" fill="url(#goldPinsGrad)" stroke="#b45309" strokeWidth="0.5" />
            <line x1="50" y1="61" x2="50" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="58" y1="61" x2="58" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="66" y1="61" x2="66" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="74" y1="61" x2="74" y2="68" stroke="#78350f" strokeWidth="0.5" strokeDasharray="1 1" />

            {/* Distinctive Notch Pointer Indicator */}
            <polygon points="40,58 37,53 43,53" fill="#ef4444" />
            <circle cx="40.5" cy="64.5" r="2.5" fill="#0f172a" />
          </g>
          <text x="50" y="93" fill="#60a5fa" fontSize="5" fontWeight="900" fontFamily="monospace" textAnchor="middle">KEY NOTCH ▼</text>
        </svg>
      );

    case 'cooler':
    case 'cooling_fan':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="coolerHub" cx="50" cy="50" r="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e293b" />
              <stop offset="0.7" stopColor="#0f172a" />
              <stop offset="1" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="copperPipe" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#f59e0b" />
              <stop offset="0.5" stopColor="#d97706" />
              <stop offset="1" stopColor="#92400e" />
            </linearGradient>
          </defs>
          
          {/* Heavy Square Aluminum Radiator Heatsink Base */}
          <rect x="12" y="12" width="76" height="76" rx="8" fill="#334155" stroke="#64748b" strokeWidth="2" />
          
          {/* Radiating Dense Aluminum Cooling Fins */}
          <line x1="16" y1="20" x2="84" y2="20" stroke="#94a3b8" strokeWidth="1" />
          <line x1="16" y1="26" x2="84" y2="26" stroke="#94a3b8" strokeWidth="1" />
          <line x1="16" y1="74" x2="84" y2="74" stroke="#94a3b8" strokeWidth="1" />
          <line x1="16" y1="80" x2="84" y2="80" stroke="#94a3b8" strokeWidth="1" />

          {/* 4 Pure Copper Heatpipe Tops with Metallic Solder Ends */}
          <circle cx="24" cy="24" r="5" fill="url(#copperPipe)" stroke="#fbbf24" strokeWidth="1.2" />
          <circle cx="76" cy="24" r="5" fill="url(#copperPipe)" stroke="#fbbf24" strokeWidth="1.2" />
          <circle cx="24" cy="76" r="5" fill="url(#copperPipe)" stroke="#fbbf24" strokeWidth="1.2" />
          <circle cx="76" cy="76" r="5" fill="url(#copperPipe)" stroke="#fbbf24" strokeWidth="1.2" />

          {/* Circular Axial Fan Tunnel Enclosure */}
          <circle cx="50" cy="50" r="33" fill="url(#coolerHub)" stroke="#0284c7" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="30" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />

          {/* 9 Aerodynamic Curved Fan Blades */}
          <g className={animate ? 'origin-center animate-spin' : ''}>
            <path d="M 50 50 Q 64 26 78 34 Q 68 48 50 50 Z" fill="#38bdf8" opacity="0.95" />
            <path d="M 50 50 Q 74 44 80 60 Q 66 64 50 50 Z" fill="#0ea5e9" opacity="0.95" />
            <path d="M 50 50 Q 66 72 52 82 Q 46 68 50 50 Z" fill="#38bdf8" opacity="0.95" />
            <path d="M 50 50 Q 36 74 22 66 Q 32 54 50 50 Z" fill="#0ea5e9" opacity="0.95" />
            <path d="M 50 50 Q 26 56 20 40 Q 34 36 50 50 Z" fill="#38bdf8" opacity="0.95" />
            <path d="M 50 50 Q 34 28 48 18 Q 54 32 50 50 Z" fill="#0ea5e9" opacity="0.95" />
          </g>

          {/* Center Fan Hub with Holographic Brand Emblem */}
          <circle cx="50" cy="50" r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="#0284c7" />
          <polygon points="50,46 53,52 47,52" fill="#ffffff" />

          {/* 4-Pin Braided PWM Cable extending to Motherboard */}
          <path d="M 50 83 Q 62 94 85 90" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <rect x="83" y="86" width="8" height="6" rx="1" fill="#18181b" stroke="#34d399" strokeWidth="0.8" />
        </svg>
      );

    case 'pcie':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Motherboard Base PCB Layer */}
          <rect x="6" y="20" width="88" height="60" rx="5" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
          
          {/* Copper High-Speed Differential Traces */}
          <path d="M 12 30 L 30 30 L 30 40" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M 12 70 L 40 70 L 40 60" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.7" />

          {/* Heavy Steel Armor Reinforcement Outer Shield */}
          <rect x="12" y="36" width="66" height="28" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
          <rect x="14" y="38" width="62" height="6" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />

          {/* Internal PCIe Contact Recess Channel */}
          <rect x="16" y="47" width="58" height="6" rx="1" fill="#09090b" />
          {/* Gold Pin Array */}
          <line x1="20" y1="50" x2="36" y2="50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="1.5 1" />
          <line x1="42" y1="50" x2="70" y2="50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="1.5 1" />
          
          {/* Keyed Notch Separator (x1 vs x16 lanes) */}
          <rect x="38" y="46" width="3" height="8" fill="#1e293b" />

          {/* Rear Retention Lock Latch (Crucial GPU Clip) */}
          <g transform="translate(78, 34)">
            <rect x="0" y="0" width="13" height="32" rx="3" fill="#6366f1" stroke="#c7d2fe" strokeWidth="1.5" />
            <polygon points="6,6 10,12 2,12" fill="#ffffff" />
            <text x="6.5" y="24" fill="#ffffff" fontSize="4.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">LOCK</text>
          </g>

          {/* Large Clear Identification Banner */}
          <rect x="16" y="66" width="58" height="10" rx="2" fill="#022c22" stroke="#059669" strokeWidth="0.8" />
          <text x="45" y="73" fill="#34d399" fontSize="5.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">PCIe 4.0 x16 (GPU)</text>
        </svg>
      );

    case 'motherboard':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Standard ATX Emerald PCB Form Factor */}
          <rect x="8" y="6" width="84" height="88" rx="5" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
          
          {/* Ground Plane Traces and Buses */}
          <path d="M 12 14 L 32 14 L 32 30" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M 68 62 L 86 62 L 86 82" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6" />

          {/* Standoff Screw Mount Holes with Gold Rings (4 corners + center) */}
          <circle cx="14" cy="12" r="2.5" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="86" cy="12" r="2.5" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="14" cy="88" r="2.5" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="86" cy="88" r="2.5" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="50" cy="52" r="2.5" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />

          {/* Central CPU Socket ZIF with Silver Lever */}
          <rect x="34" y="20" width="30" height="30" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="38" y="24" width="22" height="22" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="1 1" />
          <line x1="33" y1="21" x2="33" y2="48" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />

          {/* VRM Heat Sinks with Heavy Metallic Ridges */}
          <rect x="18" y="18" width="12" height="32" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <line x1="21" y1="22" x2="27" y2="22" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="21" y1="28" x2="27" y2="28" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="21" y1="34" x2="27" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
          
          <rect x="32" y="10" width="34" height="8" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* 4 DDR4/DDR5 Dual-Channel RAM DIMM Slots */}
          <rect x="68" y="18" width="3" height="36" rx="0.5" fill="#2563eb" stroke="#60a5fa" strokeWidth="0.5" />
          <rect x="73" y="18" width="3" height="36" rx="0.5" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="0.5" />
          <rect x="78" y="18" width="3" height="36" rx="0.5" fill="#2563eb" stroke="#60a5fa" strokeWidth="0.5" />
          <rect x="83" y="18" width="3" height="36" rx="0.5" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="0.5" />

          {/* PCIe x16 Primary GPU Expansion Slot */}
          <rect x="18" y="58" width="56" height="6" rx="1" fill="#18181b" stroke="#818cf8" strokeWidth="1" />
          <rect x="70" y="56" width="4" height="10" rx="1" fill="#6366f1" />

          {/* Secondary PCIe x1 Slots */}
          <rect x="18" y="68" width="28" height="4" rx="0.8" fill="#18181b" stroke="#94a3b8" strokeWidth="0.8" />
          
          {/* M.2 NVMe Slot with Aluminum Thermal Heatsink */}
          <rect x="22" y="76" width="36" height="7" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          <text x="40" y="81.5" fill="#38bdf8" fontSize="4" fontWeight="bold" fontFamily="monospace" textAnchor="middle">M.2 NVMe</text>

          {/* Round Silver 3V CR2032 CMOS Battery */}
          <circle cx="78" cy="74" r="6" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          <text x="78" y="76" fill="#0f172a" fontSize="4.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">3V</text>

          {/* Rear I/O Integrated Shield Block */}
          <rect x="9" y="14" width="8" height="38" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />

          {/* Motherboard Model Header */}
          <text x="50" y="92" fill="#34d399" fontSize="4.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">ATX MOTHERBOARD</text>
        </svg>
      );

    case 'sata_port':
    case 'sata':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sataCableRed" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ef4444" />
              <stop offset="0.5" stopColor="#dc2626" />
              <stop offset="1" stopColor="#991b1b" />
            </linearGradient>
          </defs>

          {/* Broad Red Flat Data Ribbon Cable */}
          <path d="M 16 32 C 34 10, 64 85, 84 50" stroke="url(#sataCableRed)" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 16 32 C 34 10, 64 85, 84 50" stroke="#b91c1c" strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Connector Head 1 (Left, Angled) */}
          <g transform="translate(8, 24) rotate(-35)">
            <rect x="0" y="0" width="22" height="14" rx="2" fill="#18181b" stroke="#52525b" strokeWidth="1.5" />
            {/* Stainless Steel Locking Latch */}
            <rect x="6" y="-3" width="10" height="5" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            {/* 7-Pin Distinctive L-Shape Interior Notch */}
            <path d="M 3 5 L 14 5 L 14 10 L 19 10" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="square" fill="none" />
          </g>

          {/* Connector Head 2 (Right) */}
          <g transform="translate(74, 42) rotate(25)">
            <rect x="0" y="0" width="22" height="14" rx="2" fill="#18181b" stroke="#52525b" strokeWidth="1.5" />
            <rect x="6" y="-3" width="10" height="5" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            <path d="M 3 5 L 14 5 L 14 10 L 19 10" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="square" fill="none" />
          </g>

          {/* Highly recognizable SATA 6Gb/s Pill */}
          <rect x="22" y="78" width="56" height="14" rx="3" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
          <text x="50" y="87" fill="#f87171" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">SATA 6Gb/s</text>
          <text x="50" y="91" fill="#fef08a" fontSize="3.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">L-SHAPED 7-PIN KEY</text>
        </svg>
      );

    case 'psu':
    case 'power_cable':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="psuChassis" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#27272a" />
              <stop offset="0.7" stopColor="#18181b" />
              <stop offset="1" stopColor="#09090b" />
            </linearGradient>
          </defs>

          {/* Heavy Gauge Steel Power Supply Enclosure */}
          <rect x="10" y="12" width="80" height="74" rx="5" fill="url(#psuChassis)" stroke="#52525b" strokeWidth="2.2" />
          
          {/* Hexagonal Honeycomb Ventilation Fan Intake */}
          <circle cx="42" cy="46" r="26" fill="#09090b" stroke="#eab308" strokeWidth="2" />
          <circle cx="42" cy="46" r="21" stroke="#71717a" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          <circle cx="42" cy="46" r="8" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <text x="42" y="48.5" fill="#09090b" fontSize="4.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">FAN</text>

          {/* AC Mains 3-Prong IEC Receptacle */}
          <rect x="70" y="20" width="16" height="22" rx="2.5" fill="#09090b" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="75" cy="28" r="1.6" fill="#f8fafc" />
          <circle cx="81" cy="28" r="1.6" fill="#f8fafc" />
          <circle cx="78" cy="36" r="1.6" fill="#f8fafc" />

          {/* Red/White Rocker Power I/O Switch */}
          <rect x="70" y="48" width="16" height="15" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
          <text x="78" y="58" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="monospace" textAnchor="middle">I/O</text>

          {/* Thick Bundled ATX Wiring Harness Output */}
          <path d="M 16 68 C 6 78, 14 96, 36 96" stroke="#f59e0b" strokeWidth="3.5" fill="none" />
          <path d="M 16 73 C 4 82, 10 99, 32 99" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <path d="M 16 78 C 2 86, 6 102, 28 102" stroke="#18181b" strokeWidth="3.5" fill="none" />

          {/* 80 PLUS Gold Certification Badge */}
          <rect x="22" y="72" width="42" height="11" rx="2.5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <text x="43" y="80" fill="#09090b" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">750W 80+ GOLD</text>
        </svg>
      );

    case 'storage':
    case 'ssd':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 2.5" Form Factor Brushed Aluminum Casing */}
          <rect x="14" y="12" width="72" height="76" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <rect x="18" y="16" width="64" height="58" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />

          {/* Metallic Brand & Spec Plate */}
          <rect x="24" y="24" width="52" height="30" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          <text x="50" y="38" fill="#ffffff" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">FAST SSD</text>
          <text x="50" y="47" fill="#e0f2fe" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">1TB FLASH • 560MB/s</text>

          {/* 4 Standard Side/Base Chassis Screw Mount Holes */}
          <circle cx="20" cy="18" r="2.2" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="80" cy="18" r="2.2" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="20" cy="70" r="2.2" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="80" cy="70" r="2.2" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" />

          {/* SATA 15-Pin Power & 7-Pin Data Gold Connector Fingers */}
          <rect x="26" y="82" width="28" height="7" rx="1" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
          <text x="40" y="87" fill="#78350f" fontSize="3.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">15P PWR</text>
          
          <rect x="58" y="82" width="18" height="7" rx="1" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
          <text x="67" y="87" fill="#78350f" fontSize="3.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">7P DATA</text>

          {/* 2.5" Form-factor Pill */}
          <text x="50" y="68" fill="#94a3b8" fontSize="4.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2.5-INCH SOLID STATE DRIVE</text>
        </svg>
      );

    case 'hdd':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 3.5" Cast Aluminum Chassis */}
          <rect x="12" y="8" width="76" height="84" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="2.2" />
          
          {/* Circular Magnetic Platter Mirror Well */}
          <circle cx="50" cy="44" r="28" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <circle cx="50" cy="44" r="23" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Central High-Speed Spindle Motor (7200 RPM) */}
          <circle cx="50" cy="44" r="10" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="50" cy="44" r="4" fill="#cbd5e1" />
          <circle cx="50" cy="44" r="1.5" fill="#0f172a" />

          {/* Precision Actuator Arm with Magnetic Read/Write Head */}
          <path d="M 50 44 L 72 64" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="73" cy="65" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 73 65 L 80 72" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Air Breather Filter Vent */}
          <circle cx="22" cy="20" r="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Spec & Form Factor Label */}
          <rect x="18" y="76" width="64" height="12" rx="2" fill="#0f172a" />
          <text x="50" y="83" fill="#38bdf8" fontSize="5.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">3.5&quot; SATA HDD • 4TB</text>
          <text x="50" y="87" fill="#94a3b8" fontSize="3.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">7200 RPM MECHANICAL PLATTER</text>
        </svg>
      );

    case 'screwdriver':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(10, 85) rotate(-45)">
            {/* Ergonomic Non-Slip Rubberized Handle */}
            <rect x="0" y="-10" width="50" height="20" rx="5" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            <rect x="8" y="-9" width="6" height="18" rx="1.5" fill="#18181b" />
            <rect x="18" y="-9" width="6" height="18" rx="1.5" fill="#18181b" />
            <rect x="28" y="-9" width="6" height="18" rx="1.5" fill="#18181b" />
            <rect x="38" y="-9" width="6" height="18" rx="1.5" fill="#18181b" />

            {/* Hardened Chrome Vanadium Steel Shaft */}
            <rect x="50" y="-5" width="48" height="10" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
            
            {/* Magnetic Crosshead Phillips Tip (#2) */}
            <polygon points="98,-4.5 107,0 98,4.5" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <line x1="98" y1="0" x2="105" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="102" y1="-3" x2="102" y2="3" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Magnetic Sparkle Effect */}
            <circle cx="107" cy="0" r="3.5" fill="#38bdf8" opacity="0.8" />
          </g>
          <text x="50" y="93" fill="#ef4444" fontSize="5.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">PHILLIPS #2 SCREWDRIVER</text>
        </svg>
      );

    case 'network_cable':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flexible Royal Blue Cat6 Ethernet Patch Cable */}
          <path d="M 12 70 C 30 18, 60 92, 80 42" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 12 70 C 30 18, 60 92, 80 42" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Snagless Molded Rubber Strain-Relief Boot */}
          <g transform="translate(70, 32) rotate(-35)">
            <rect x="0" y="-6" width="16" height="12" rx="2.5" fill="#1e40af" stroke="#3b82f6" strokeWidth="1" />
            
            {/* Clear Transparent 8P8C Polycarbonate Modular Plug */}
            <rect x="15" y="-5.5" width="18" height="11" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
            
            {/* 8 Gold Contact Pins with Individual Separators */}
            <line x1="29" y1="-4.5" x2="29" y2="4.5" stroke="#f59e0b" strokeWidth="2" strokeDasharray="1 0.5" />
            
            {/* Plastic Retention Clip Lock Lever */}
            <path d="M 17 -5.5 L 26 -11 L 24 -5.5" stroke="#0284c7" strokeWidth="2" fill="none" />
          </g>

          <rect x="18" y="80" width="64" height="13" rx="3" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
          <text x="50" y="89" fill="#bfdbfe" fontSize="6" fontWeight="900" fontFamily="monospace" textAnchor="middle">CAT6 RJ-45 ETHERNET</text>
        </svg>
      );

    default:
      return (
        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-black">
          PC
        </div>
      );
  }
};

interface VisualFieldGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualFieldGuideModal: React.FC<VisualFieldGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hardwareGuide = [
    {
      id: 'cpu',
      name: 'CPU Processor & Socket',
      category: 'Processing Core',
      howToSpot: 'Square shape with a flat silver nickel heatspreader (IHS), gold alignment corner triangle, and laser-etched frequency numbers (e.g. 3.8 GHz). The motherboard socket has a shiny metallic locking lever arm.',
      dangerToAvoid: 'Never touch the gold pins or drop the processor; align the gold corner triangle with the triangle on the socket.'
    },
    {
      id: 'ram',
      name: 'RAM DIMM Modules & Slots',
      category: 'System Memory',
      howToSpot: 'Long rectangular circuit boards with grooved blue aluminum heatspreaders and gold bottom pins with an off-center notch. DIMM slots have snap clips on each end.',
      dangerToAvoid: 'Make sure the notch matches the plastic ridge in the DIMM slot. Press evenly until both retention clips snap into place.'
    },
    {
      id: 'cooler',
      name: 'CPU Cooler / Fan',
      category: 'Thermal Cooling',
      howToSpot: 'A circular 9-blade radial fan mounted on an aluminum finned heatsink with curved copper heatpipes and a 4-pin braided PWM header wire.',
      dangerToAvoid: 'Always apply thermal paste before clamping the heatsink down, and plug the 4-pin cable into CPU_FAN.'
    },
    {
      id: 'pcie',
      name: 'PCIe x16 Expansion Slot',
      category: 'Graphics / Expansion Bus',
      howToSpot: 'Long horizontal slot located below the CPU socket, equipped with silver metal shielding armor and a plastic locking hook on the rear right.',
      dangerToAvoid: 'Align your GPU bracket with the chassis rear slot and verify the rear retention hook clicks shut.'
    },
    {
      id: 'motherboard',
      name: 'Motherboard PCB',
      category: 'Main Circuit Board',
      howToSpot: 'Large deep-green or matte-black printed circuit board (ATX) with golden copper trace lines, VRM fin heatsinks, round capacitors, and a round silver CR2032 3V CMOS coin cell.',
      dangerToAvoid: 'Always install brass standoffs in the case first to prevent solder points underneath from shorting against the metal chassis.'
    },
    {
      id: 'sata',
      name: 'SATA Data Cable & Motherboard Ports',
      category: 'Storage Data Interconnect',
      howToSpot: 'Flexible bright red flat ribbon cable with black 7-pin L-shaped connector heads and silver metal spring locking clips. Motherboard ports are stacked right-angle L-headers.',
      dangerToAvoid: 'SATA is keyed with an L-shape; do not force it upside down.'
    },
    {
      id: 'psu',
      name: 'Power Supply Unit (PSU) & 24-Pin Harness',
      category: 'System Power Delivery',
      howToSpot: 'Heavy black metal enclosure with a honeycomb hexagonal ventilation mesh, 3-prong AC power inlet, and I/O rocker switch. It supplies a thick bundle of yellow (+12V), red (+5V), and orange (+3.3V) wires in a 24-pin dual-row plug.',
      dangerToAvoid: 'Installed in the bottom chassis basement shroud so its heavy weight stays grounded and its fan exhausts heat directly outward.'
    },
    {
      id: 'storage',
      name: 'Storage Drive Bays & SSD/HDD',
      category: 'Permanent Storage',
      howToSpot: '2.5" SSD is a thin brushed-metal drive with high-speed flash branding; 3.5" HDD is a thick cast-metal drive with a round silver platter spindle hub. Drive bays are slide-out sled caddies in the front right case.',
      dangerToAvoid: 'Secure drives with 4 side screws or tool-less caddy pins to prevent vibration.'
    },
    {
      id: 'screwdriver',
      name: 'Magnetic Technician Screwdriver',
      category: 'Assembly Tool',
      howToSpot: 'Hand tool with a textured non-slip red rubber grip, chrome vanadium shaft, and blackened magnetic Phillips #2 cross-head tip.',
      dangerToAvoid: 'Use magnetic tips to hold screws so they do not fall loose onto the motherboard circuitry.'
    },
    {
      id: 'network_cable',
      name: 'RJ-45 Ethernet Patch Cable',
      category: 'Network Connectivity',
      howToSpot: 'Bright blue flexible twisted-pair cable with a snagless molded rubber boot and clear polycarbonate 8P8C plug showing 8 gold contact pins.',
      dangerToAvoid: 'Press the top plastic latch lever down when disconnecting from the Ethernet port.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide flex items-center gap-2">
                <span>Computer Hardware Visual Field Guide</span>
                <span className="text-[10px] bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full font-black uppercase">
                  Reference
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Visual inspection traits to recognize every physical part and socket immediately.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(90vh-130px)]">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Technician Tip:</strong> Look closely at distinctive physical cues such as socket latches, metal locking clips, notch keyings, and color codes. This prevents wrong answers and teaches real-world assembly!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {hardwareGuide.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4 hover:border-blue-400 transition-colors"
              >
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-xs">
                    <HardwareVisualArt id={item.id} className="w-14 h-14" />
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase mt-1 tracking-wider text-center">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-sm font-black text-gray-900">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="text-blue-700">How to Spot: </strong>
                    {item.howToSpot}
                  </p>
                  <p className="text-[11px] text-amber-800 bg-amber-100/60 px-2 py-1 rounded-md">
                    <strong>Rule: </strong>
                    {item.dangerToAvoid}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Got It, Return to Game
          </button>
        </div>

      </div>
    </div>
  );
};
