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
          {/* Green Silicon Substrate */}
          <rect x="10" y="10" width="80" height="80" rx="6" fill="#047857" stroke="#065f46" strokeWidth="2" />
          {/* Gold Edge Interconnect Pads */}
          <rect x="14" y="14" width="72" height="72" rx="4" fill="#064e3b" stroke="#059669" strokeWidth="1" strokeDasharray="3 2" />
          {/* Metallic Nickel Integrated Heat Spreader (IHS) */}
          <rect x="22" y="22" width="56" height="56" rx="4" fill="url(#cpuGrad)" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Gold Pin 1 Triangle */}
          <polygon points="12,12 20,12 12,20" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
          {/* Laser-etched Markings */}
          <text x="50" y="44" fill="#334155" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">INTEL/AMD</text>
          <text x="50" y="55" fill="#475569" fontSize="6.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">3.80 GHz</text>
          <text x="50" y="65" fill="#64748b" fontSize="4.5" fontFamily="monospace" textAnchor="middle">LGA 1700 / AM5</text>
          <defs>
            <linearGradient id="cpuGrad" x1="22" y1="22" x2="78" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f8fafc" />
              <stop offset="0.5" stopColor="#e2e8f0" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'ram':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stick 1 (Rear) */}
          <g opacity="0.9" transform="translate(6, 4)">
            <rect x="10" y="20" width="68" height="42" rx="3" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1.5" />
            {/* Heatspreader Grooves */}
            <line x1="16" y1="26" x2="72" y2="26" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="33" x2="72" y2="33" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
            {/* Gold Pins with Notch */}
            <rect x="12" y="62" width="28" height="6" fill="#facc15" />
            <rect x="44" y="62" width="32" height="6" fill="#facc15" />
          </g>
          {/* Stick 2 (Front) */}
          <g transform="translate(16, 18)">
            <rect x="10" y="20" width="68" height="42" rx="3" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1.8" />
            {/* Aluminum Heat Spreader Ridge */}
            <path d="M 12 24 L 76 24 L 74 34 L 14 34 Z" fill="#2563eb" />
            <line x1="20" y1="28" x2="68" y2="28" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
            {/* Spec Sticker */}
            <rect x="22" y="38" width="44" height="14" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
            <text x="44" y="47" fill="#0f172a" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">16GB DDR4</text>
            <text x="44" y="51" fill="#475569" fontSize="3.5" fontFamily="monospace" textAnchor="middle">3200MHz CL16</text>
            {/* Gold Contact Pins with Center Key Notch */}
            <rect x="12" y="62" width="28" height="6" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
            <rect x="44" y="62" width="32" height="6" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
            <circle cx="42" cy="65" r="2" fill="#0f172a" />
          </g>
        </svg>
      );

    case 'cooler':
    case 'cooling_fan':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Aluminum Fin Base */}
          <rect x="18" y="18" width="64" height="64" rx="6" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
          {/* Radial Heatsink Fins */}
          <circle cx="50" cy="50" r="30" fill="#334155" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          {/* Copper Heatpipes */}
          <circle cx="28" cy="28" r="4" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="72" cy="28" r="4" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="28" cy="72" r="4" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="72" cy="72" r="4" fill="#b45309" stroke="#f59e0b" strokeWidth="1" />
          {/* Fan Housing Ring */}
          <circle cx="50" cy="50" r="26" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
          {/* Curved Aerodynamic Fan Blades */}
          <g className={animate ? 'origin-center animate-spin' : ''}>
            <path d="M 50 50 Q 62 30 74 36 Q 64 48 50 50 Z" fill="#e0f2fe" opacity="0.9" />
            <path d="M 50 50 Q 70 62 64 74 Q 52 64 50 50 Z" fill="#bae6fd" opacity="0.9" />
            <path d="M 50 50 Q 38 70 26 64 Q 36 52 50 50 Z" fill="#e0f2fe" opacity="0.9" />
            <path d="M 50 50 Q 30 38 36 26 Q 48 36 50 50 Z" fill="#bae6fd" opacity="0.9" />
          </g>
          {/* Center Hub with Hologram Logo */}
          <circle cx="50" cy="50" r="10" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="4" fill="#38bdf8" />
          {/* 4-Pin PWM Braided Wire */}
          <path d="M 50 76 Q 60 88 80 84" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'pcie':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Motherboard Surface Traces */}
          <rect x="10" y="24" width="80" height="52" rx="4" fill="#064e3b" stroke="#059669" strokeWidth="1" />
          {/* PCIe x16 Plastic Connector Body */}
          <rect x="16" y="40" width="62" height="18" rx="2" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
          {/* Metallic Reinforcement Armor Shielding */}
          <rect x="18" y="42" width="58" height="5" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
          {/* Contact Receiver Notch */}
          <line x1="28" y1="42" x2="28" y2="54" stroke="#fbbf24" strokeWidth="2" />
          <line x1="20" y1="50" x2="72" y2="50" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
          {/* Rear Locking Retention Latch */}
          <rect x="76" y="37" width="10" height="24" rx="2" fill="#6366f1" stroke="#818cf8" strokeWidth="1.2" />
          <polygon points="81,41 85,45 81,49" fill="#ffffff" />
          {/* Expansion Bracket Label */}
          <text x="45" y="70" fill="#a7f3d0" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">PCIe 4.0 x16 (GPU)</text>
        </svg>
      );

    case 'motherboard':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ATX Main PCB */}
          <rect x="10" y="8" width="80" height="84" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
          {/* Copper Ground Plane Traces */}
          <path d="M 14 16 L 36 16 L 36 32 L 20 32" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M 64 64 L 84 64 L 84 82" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6" />
          {/* CPU Socket Location */}
          <rect x="36" y="22" width="28" height="28" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="40" y="26" width="20" height="20" fill="#64748b" />
          {/* VRM Heatsinks */}
          <rect x="22" y="20" width="10" height="30" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="34" y="12" width="32" height="8" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          {/* RAM DIMM Slots */}
          <rect x="68" y="20" width="3" height="34" fill="#2563eb" />
          <rect x="74" y="20" width="3" height="34" fill="#1d4ed8" />
          <rect x="80" y="20" width="3" height="34" fill="#2563eb" />
          {/* PCIe Slots */}
          <rect x="22" y="60" width="52" height="5" fill="#18181b" stroke="#6366f1" strokeWidth="0.8" />
          <rect x="22" y="72" width="52" height="4" fill="#18181b" stroke="#94a3b8" strokeWidth="0.8" />
          {/* CMOS Battery */}
          <circle cx="78" cy="74" r="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
          <text x="78" y="76" fill="#0f172a" fontSize="3" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3V</text>
          {/* Rear I/O Shield Ports */}
          <rect x="12" y="16" width="8" height="26" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
        </svg>
      );

    case 'sata_port':
    case 'sata':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* SATA Red Ribbon Cable */}
          <path d="M 18 30 C 35 15, 60 75, 78 45" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" fill="none" />
          {/* Flat Cable Shading */}
          <path d="M 18 30 C 35 15, 60 75, 78 45" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Black Plug 1 */}
          <g transform="translate(10, 24) rotate(-30)">
            <rect x="0" y="0" width="16" height="12" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
            {/* L-Shape 7-Pin Notch */}
            <path d="M 2 4 L 10 4 L 10 8 L 14 8" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
            {/* Metal Locking Clip */}
            <rect x="5" y="-2" width="6" height="4" rx="0.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
          {/* Black Plug 2 */}
          <g transform="translate(72, 38) rotate(20)">
            <rect x="0" y="0" width="16" height="12" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
            <path d="M 2 4 L 10 4 L 10 8 L 14 8" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
            <rect x="5" y="-2" width="6" height="4" rx="0.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          </g>
          <text x="50" y="86" fill="#ef4444" fontSize="6.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">SATA 6Gb/s</text>
        </svg>
      );

    case 'psu':
    case 'power_cable':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Black Steel Chassis Box */}
          <rect x="14" y="16" width="72" height="66" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          {/* Hexagonal Honeycomb Exhaust Grill */}
          <circle cx="44" cy="48" r="22" fill="#09090b" stroke="#eab308" strokeWidth="1.5" />
          <circle cx="44" cy="48" r="18" stroke="#71717a" strokeWidth="1" strokeDasharray="3 2" fill="none" />
          <circle cx="44" cy="48" r="6" fill="#eab308" />
          {/* 3-Prong AC Power Inlet Socket */}
          <rect x="68" y="24" width="12" height="18" rx="2" fill="#09090b" stroke="#52525b" strokeWidth="1" />
          <circle cx="72" cy="30" r="1.2" fill="#e2e8f0" />
          <circle cx="76" cy="30" r="1.2" fill="#e2e8f0" />
          <circle cx="74" cy="36" r="1.2" fill="#e2e8f0" />
          {/* Red/White Rocker Power Switch (I/O) */}
          <rect x="68" y="48" width="12" height="12" rx="1" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
          <text x="74" y="56" fill="#ffffff" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">I</text>
          {/* Bundled Power Wires Output */}
          <path d="M 18 64 C 10 75, 20 88, 36 88" stroke="#f59e0b" strokeWidth="3" fill="none" />
          <path d="M 18 68 C 8 78, 16 92, 34 92" stroke="#ef4444" strokeWidth="3" fill="none" />
          <text x="44" y="76" fill="#eab308" fontSize="6.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">750W GOLD</text>
        </svg>
      );

    case 'storage':
    case 'ssd':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 2.5" SSD Brushed Metal Body */}
          <rect x="18" y="16" width="64" height="68" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.8" />
          {/* Brushed Surface Sheen */}
          <rect x="22" y="20" width="56" height="50" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          {/* Capacity & Logo Badge */}
          <rect x="28" y="26" width="44" height="24" rx="2" fill="#0284c7" />
          <text x="50" y="38" fill="#ffffff" fontSize="7" fontWeight="black" fontFamily="sans-serif" textAnchor="middle">FAST SSD</text>
          <text x="50" y="46" fill="#e0f2fe" fontSize="5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">1TB FLASH</text>
          {/* 4 Corner Chassis Screw Mounts */}
          <circle cx="24" cy="22" r="2" fill="#94a3b8" />
          <circle cx="76" cy="22" r="2" fill="#94a3b8" />
          <circle cx="24" cy="64" r="2" fill="#94a3b8" />
          <circle cx="76" cy="64" r="2" fill="#94a3b8" />
          {/* Gold L-Shaped SATA Power + Data Teeth */}
          <rect x="30" y="74" width="22" height="7" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
          <rect x="56" y="74" width="14" height="7" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        </svg>
      );

    case 'hdd':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 3.5" Heavy Cast Aluminum Body */}
          <rect x="16" y="12" width="68" height="76" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          {/* Circular Platter Recess */}
          <circle cx="50" cy="44" r="26" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="50" cy="44" r="22" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Central Platter Motor Spindle */}
          <circle cx="50" cy="44" r="9" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
          <circle cx="50" cy="44" r="3" fill="#e2e8f0" />
          {/* Actuator Arm */}
          <path d="M 50 44 L 66 60" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          <circle cx="68" cy="62" r="3.5" fill="#0f172a" />
          {/* Breather Filter Hole */}
          <circle cx="26" cy="24" r="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.6" />
          <text x="50" y="80" fill="#94a3b8" fontSize="5.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3.5&quot; SATA HDD 4TB</text>
        </svg>
      );

    case 'screwdriver':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tool Angle Transformation */}
          <g transform="translate(10, 80) rotate(-45)">
            {/* Ergonomic Ribbed Handle */}
            <rect x="0" y="-8" width="46" height="16" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <rect x="6" y="-7" width="6" height="14" rx="1" fill="#18181b" />
            <rect x="16" y="-7" width="6" height="14" rx="1" fill="#18181b" />
            <rect x="26" y="-7" width="6" height="14" rx="1" fill="#18181b" />
            <rect x="36" y="-7" width="6" height="14" rx="1" fill="#18181b" />
            {/* Chrome Vanadium Steel Shaft */}
            <rect x="46" y="-4" width="44" height="8" rx="1" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            {/* Darkened Magnetic Phillips Tip */}
            <polygon points="90,-3.5 98,0 90,3.5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Magnetic Energy Sparkle */}
            <circle cx="98" cy="0" r="3" fill="#38bdf8" opacity="0.6" />
          </g>
        </svg>
      );

    case 'network_cable':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Royal Blue Ethernet Patch Cable */}
          <path d="M 15 65 C 30 20, 60 85, 78 40" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Snagless Molded Boot */}
          <g transform="translate(68, 30) rotate(-35)">
            <rect x="0" y="-5" width="14" height="10" rx="2" fill="#1d4ed8" />
            {/* Clear 8P8C Polycarbonate Modular Plug */}
            <rect x="12" y="-4.5" width="16" height="9" rx="1.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" opacity="0.9" />
            {/* 8 Gold Contact Pins */}
            <line x1="25" y1="-3.5" x2="25" y2="3.5" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="1 1" />
            {/* Plastic Retention Clip Lever */}
            <path d="M 14 -4.5 L 22 -9 L 20 -4.5" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          </g>
          <text x="50" y="88" fill="#2563eb" fontSize="6.5" fontWeight="black" fontFamily="monospace" textAnchor="middle">CAT6 RJ-45</text>
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
