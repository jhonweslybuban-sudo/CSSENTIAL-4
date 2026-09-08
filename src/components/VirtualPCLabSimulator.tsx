import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wrench,
  ShieldCheck,
  Cpu,
  Fan,
  HardDrive,
  Zap,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Award,
  Terminal,
  Settings,
  Flame,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface VirtualPCLabSimulatorProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

interface SimStage {
  id: number;
  phase: 'INSTALLATION' | 'CONFIGURATION';
  title: string;
  subTitle: string;
  taskPrompt: string;
  requiredItem: string;
  explanation: string;
  safetyTip: string;
  telemetryNote: string;
}

const SIMULATION_STAGES: SimStage[] = [
  {
    id: 1,
    phase: 'INSTALLATION',
    title: 'ESD Electrostatic Discharge Safety',
    subTitle: 'Personal Protective Equipment & Grounding',
    taskPrompt: 'Equip the Anti-Static ESD Wrist Strap and clip it to the unpainted chassis metal before touching sensitive silicon components.',
    requiredItem: 'esd_strap',
    explanation: 'Static electricity carries thousands of volts that can imperceptibly destroy delicate CMOS transistors. Grounding keeps you at 0V potential.',
    safetyTip: 'Never clip an ESD strap to an active AC power source. Only attach to unpainted chassis ground.',
    telemetryNote: 'ESD Grounding: VERIFIED (0V Body Potential)'
  },
  {
    id: 2,
    phase: 'INSTALLATION',
    title: 'Processor (CPU) Installation',
    subTitle: 'Socket Alignment & Zero-Insertion Force (ZIF)',
    taskPrompt: 'Lift the socket load lever, align the Golden Triangle Pin 1 marker on the CPU with the socket notch, and gently lower without forcing.',
    requiredItem: 'cpu',
    explanation: 'Modern CPUs have hundreds of fragile contact pads/pins. Never force or drop the processor; it drops into place with Zero Insertion Force.',
    safetyTip: 'Never touch gold contacts on the underside of the processor with bare fingers.',
    telemetryNote: 'Socket AM4/LGA: CPU LATCH LOCKED'
  },
  {
    id: 3,
    phase: 'INSTALLATION',
    title: 'Thermal Compound & CPU Cooler',
    subTitle: 'Heat Dissipation & Fan Power Connection',
    taskPrompt: 'Apply a pea-sized dot of Thermal Paste to the CPU center, remove protective plastic peel on cooler base, mount cooler, and connect the 4-pin CPU_FAN header.',
    requiredItem: 'thermal_paste',
    explanation: 'Thermal interface material fills microscopic air gaps between the CPU heat spreader and cooler base, multiplying heat transfer efficiency.',
    safetyTip: 'Ensure the clear plastic shipping film on the cooler base is removed before mounting!',
    telemetryNote: 'CPU_FAN Header: 4-Pin PWM Connected'
  },
  {
    id: 4,
    phase: 'INSTALLATION',
    title: 'Dual-Channel RAM Installation',
    subTitle: 'Memory Channels & Key Notch Seating',
    taskPrompt: 'Open the retention clips on DIMM Slots A2 and B2, align the asymmetric key notch, and press firmly until both ends click into place.',
    requiredItem: 'ram',
    explanation: 'Installing memory sticks into alternating slots (A2 and B2) enables 128-bit Dual-Channel memory bandwidth, doubling data throughput to the CPU.',
    safetyTip: 'Listen for the tactile dual-click. Uneven seating causes memory initialization POST failures (3 short beeps).',
    telemetryNote: 'DIMM Topology: Dual-Channel 16GB Detected'
  },
  {
    id: 5,
    phase: 'INSTALLATION',
    title: 'Motherboard Mounting & Standoffs',
    subTitle: 'Chassis Standoff Alignment & I/O Shield',
    taskPrompt: 'Verify all 9 ATX brass standoffs match motherboard mounting holes, snap in the rear I/O shield, lower the board, and tighten screws in a cross pattern.',
    requiredItem: 'motherboard_screws',
    explanation: 'Brass standoffs prevent the conductive solder joints on the motherboard underside from shorting out against the metal chassis tray.',
    safetyTip: 'Never leave an extra standoff where no screw hole exists—it will short out power traces!',
    telemetryNote: 'Chassis Ground: 9 Brass Standoffs Fastened'
  },
  {
    id: 6,
    phase: 'INSTALLATION',
    title: 'High-Speed NVMe Storage Drive',
    subTitle: 'M.2 PCIe Gen4 Solid State Drive',
    taskPrompt: 'Insert the M.2 NVMe SSD at a 30-degree angle into the primary M.2 slot, push down gently, and secure with the tiny standoff screw and thermal pad.',
    requiredItem: 'nvme_ssd',
    explanation: 'NVMe SSDs communicate directly with CPU PCIe lanes, offering speeds exceeding 5,000 MB/s compared to traditional SATA SSDs.',
    safetyTip: 'Do not overtighten the fragile M.2 standoff screw or strip the tiny threading.',
    telemetryNote: 'PCIe Gen4 M.2: 1TB NVMe Drive Online'
  },
  {
    id: 7,
    phase: 'INSTALLATION',
    title: 'Power Supply Unit & ATX Harness',
    subTitle: '24-Pin ATX & 8-Pin EPS 12V Power Delivery',
    taskPrompt: 'Mount the 80-Plus PSU into the bottom shroud, plug the 24-Pin main power to the motherboard, and route the 8-Pin EPS cable to upper-left CPU power.',
    requiredItem: 'psu_cables',
    explanation: 'The 24-pin connector supplies +3.3V, +5V, and +12V rails. The separate 8-pin EPS connector provides dedicated VRM power to the CPU.',
    safetyTip: 'Never mix modular cables from different PSU brands; pinouts on the power supply side are not standardized!',
    telemetryNote: 'DC Voltages: +12.05V | +5.02V | +3.31V Steady'
  },
  {
    id: 8,
    phase: 'CONFIGURATION',
    title: 'Front Panel Headers & Dedicated GPU',
    subTitle: 'System Panel Connectors & Graphics Expansion',
    taskPrompt: 'Connect Front Panel PWR_SW, RESET, and HDD_LED to the 9-pin system header, then seat the PCIe x16 GPU and plug the 8-pin PCIe auxiliary power.',
    requiredItem: 'gpu',
    explanation: 'The Power Switch (PWR_SW) momentarily shorts pins 6 and 8 to trigger motherboard power logic. LEDs have polarity (+ and -).',
    safetyTip: 'Connect monitor cable directly to the dedicated GPU display output port, NOT the motherboard I/O.',
    telemetryNote: 'PCIe 4.0 x16: GPU Detected • PWR_SW Primed'
  },
  {
    id: 9,
    phase: 'CONFIGURATION',
    title: 'First POST & UEFI BIOS Configuration',
    subTitle: 'Power-On Self-Test, Boot Order & XMP/DOCP Profile',
    taskPrompt: 'Power on system, enter UEFI BIOS (DEL/F2), enable XMP/DOCP Memory Profile (3200MHz), enable Secure Boot & TPM 2.0, and set UEFI USB as Boot #1.',
    requiredItem: 'bios_config',
    explanation: 'UEFI BIOS initializes hardware, validates POST diagnostic codes, and executes boot handoff to the OS installation media.',
    safetyTip: 'Check CPU temperature in BIOS telemetry (should be under 45°C idle) to confirm cooler mounting contact.',
    telemetryNote: 'UEFI BIOS: XMP Enabled (DDR4-3200) • TPM 2.0 Active'
  },
  {
    id: 10,
    phase: 'CONFIGURATION',
    title: 'Operating System Deployment & Testing',
    subTitle: 'GPT Partitioning, Driver Installation & Stress Test',
    taskPrompt: 'Select Unallocated Space on Drive 0 (GPT), complete OS installation, install motherboard chipset & graphics drivers, and run a 100% stability stress test.',
    requiredItem: 'os_installer',
    explanation: 'A clean installation requires modern GPT (GUID Partition Table) partitioning with UEFI boot mode for full security and drive capacity.',
    safetyTip: 'Always verify Device Manager after installation to ensure zero missing driver exclamation marks (!).',
    telemetryNote: 'OS Status: Windows 11 Pro 64-bit • All Drivers Verified OK'
  }
];

interface InventoryItem {
  id: string;
  name: string;
  category: 'Tools' | 'Core Silicon' | 'Power & Cables' | 'Software & Config';
  desc: string;
  iconName: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'esd_strap', name: 'Anti-Static Wrist Strap', category: 'Tools', desc: '1-Megaohm resistor wrist strap for electrostatic grounding.', iconName: 'shield' },
  { id: 'cpu', name: 'Multi-Core Desktop CPU', category: 'Core Silicon', desc: 'Silicon processor with gold contact pads and triangle alignment notch.', iconName: 'cpu' },
  { id: 'thermal_paste', name: 'Thermal Compound & Cooler', category: 'Core Silicon', desc: 'Zinc oxide thermal paste and 4-pin PWM tower heatsink.', iconName: 'fan' },
  { id: 'ram', name: '16GB DDR4 RAM Sticks', category: 'Core Silicon', desc: 'Dual-channel matched memory modules with gold edge contacts.', iconName: 'layers' },
  { id: 'motherboard_screws', name: 'ATX Standoffs & Screws', category: 'Tools', desc: '9 hexagonal brass standoffs and Phillips-head chassis screws.', iconName: 'wrench' },
  { id: 'nvme_ssd', name: '1TB M.2 PCIe Gen4 NVMe SSD', category: 'Core Silicon', desc: 'High-speed solid-state drive with M-Key connector.', iconName: 'harddrive' },
  { id: 'psu_cables', name: '80+ Gold PSU & Cables', category: 'Power & Cables', desc: '24-Pin ATX main power and 8-Pin EPS CPU 12V harness.', iconName: 'zap' },
  { id: 'gpu', name: 'PCIe Graphics Card & FP Cables', category: 'Core Silicon', desc: 'Dedicated discrete GPU and Front Panel PWR_SW header leads.', iconName: 'monitor' },
  { id: 'bios_config', name: 'UEFI BIOS Configuration Tool', category: 'Software & Config', desc: 'Motherboard firmware setup utility for XMP and boot order.', iconName: 'settings' },
  { id: 'os_installer', name: 'UEFI Bootable Installation Media', category: 'Software & Config', desc: 'USB drive containing modern 64-bit OS and chipset driver packages.', iconName: 'terminal' }
];

export const VirtualPCLabSimulator: React.FC<VirtualPCLabSimulatorProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [simLog, setSimLog] = useState<string[]>([
    'Virtual PC Hardware & Configuration Laboratory Initialized.',
    'Workbench ready: ESD Mat at 0V. Power disconnected.'
  ]);

  const currentStage = SIMULATION_STAGES[currentStageIdx];

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, startTime]);

  // Handle item application to current stage
  const handleApplyItem = (itemId: string) => {
    if (isFinished) return;

    if (itemId === currentStage.requiredItem) {
      // Success!
      setFeedback({
        text: `✓ EXCELLENT WORK! ${currentStage.title} completed with correct procedure.`,
        isError: false
      });

      const nextCompleted = [...completedStages, currentStage.id];
      setCompletedStages(nextCompleted);

      setSimLog(prev => [
        `[STEP ${currentStage.id}] SUCCESS: ${currentStage.title} -> ${currentStage.telemetryNote}`,
        ...prev.slice(0, 15)
      ]);

      api.logAction(
        studentId,
        sessionId,
        `Virtual Lab: Completed Stage ${currentStage.id} (${currentStage.title}) in ${elapsedSeconds}s`
      );

      // Check if finished
      if (currentStageIdx + 1 >= SIMULATION_STAGES.length) {
        setIsFinished(true);
        const finalScore = Math.max(70, 100 - (mistakes * 5));
        api.recordGameResult({
          student_id: studentId,
          session_id: sessionId,
          game_name: 'Virtual PC Lab Simulator',
          score: finalScore,
          level: 10,
          duration_seconds: elapsedSeconds,
          completed: true
        });
      } else {
        setTimeout(() => {
          setCurrentStageIdx(prev => prev + 1);
          setSelectedItemId(null);
          setFeedback(null);
        }, 1200);
      }
    } else {
      // Mistake!
      setMistakes(prev => prev + 1);
      const chosenItem = INVENTORY_ITEMS.find(i => i.id === itemId);
      setFeedback({
        text: `✕ INCORRECT COMPONENT: You attempted to apply "${chosenItem?.name}". Review the prompt and required task step carefully!`,
        isError: true
      });

      setSimLog(prev => [
        `[STEP ${currentStage.id}] ERROR: Incorrect part selected (${chosenItem?.name || itemId}).`,
        ...prev.slice(0, 15)
      ]);

      api.logAction(
        studentId,
        sessionId,
        `Virtual Lab Mistake on Stage ${currentStage.id}: Attempted "${chosenItem?.name || itemId}"`
      );
    }
  };

  const handleReset = () => {
    setCurrentStageIdx(0);
    setSelectedItemId(null);
    setCompletedStages([]);
    setMistakes(0);
    setFeedback(null);
    setIsFinished(false);
    setSimLog([
      'Virtual PC Simulator Reset.',
      'Workbench ready: ESD Mat at 0V. Power disconnected.'
    ]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const calculateScore = () => {
    return Math.max(60, 100 - (mistakes * 4));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-gray-500 hover:text-blue-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Return to Games Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full">
                HANDS-ON VIRTUAL LABORATORY SIMULATOR
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 rounded-full">
                Lesson 2 &amp; Lesson 3
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              Virtual PC Assembly &amp; System Configuration Lab
            </h2>
            <p className="text-xs text-gray-500">
              Practice realistic physical system assembly, ESD safety compliance, and UEFI BIOS configuration step-by-step.
            </p>
          </div>
        </div>

        {/* Telemetry Metrics Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <div className="text-[10px] font-bold text-blue-700 uppercase">Stage</div>
            <div className="text-sm font-black text-blue-950 font-mono">
              {currentStageIdx + 1} / {SIMULATION_STAGES.length}
            </div>
          </div>

          <div className="px-3.5 py-2 bg-amber-50 border border-amber-100 rounded-xl text-center">
            <div className="text-[10px] font-bold text-amber-700 uppercase">Mistakes</div>
            <div className="text-sm font-black text-amber-950 font-mono">{mistakes}</div>
          </div>

          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Lab Timer</div>
            <div className="text-sm font-black text-emerald-950 font-mono">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            title="Reset Simulator"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Simulation View or Final Certificate */}
      {!isFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLS: INTERACTIVE VIRTUAL WORKBENCH & ACTIVE STAGE */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Active Stage Directive Box */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {currentStage.phase === 'INSTALLATION' ? 'Phase 1: Physical Assembly' : 'Phase 2: UEFI & OS Configuration'}
                </span>
                <span className="text-xs font-mono font-bold text-gray-500">
                  Step {currentStage.id} of 10
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">
                  {currentStage.title}
                </h3>
                <p className="text-xs font-bold text-blue-700 mt-0.5">
                  {currentStage.subTitle}
                </p>
              </div>

              {/* Task Directive */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="text-xs font-black text-blue-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-700" />
                  <span>Hands-on Laboratory Directive:</span>
                </div>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  {currentStage.taskPrompt}
                </p>
              </div>

              {/* Technical Explanation & Safety Warning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-800 block mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" /> Technical Principles:
                  </span>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    {currentStage.explanation}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Safety &amp; Caution:
                  </span>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    {currentStage.safetyTip}
                  </p>
                </div>
              </div>

              {/* Feedback Banner */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                    feedback.isError
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}
                >
                  {feedback.isError ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}
            </div>

            {/* Visual Hardware Workbench SVG Diagram */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-300 text-xs font-mono mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>VIRTUAL HARDWARE WORKBENCH (ESD MAT)</span>
                </div>
                <span>Status: {currentStage.telemetryNote}</span>
              </div>

              {/* Graphical Workbench Illustration */}
              <div className="w-full h-72 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden p-3">
                {/* ESD Grid Pattern */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* SVG PC Chassis & Motherboard Architecture */}
                <svg viewBox="0 0 500 280" className="w-full h-full max-h-full select-none">
                  {/* Outer Chassis Frame */}
                  <rect x="20" y="10" width="460" height="260" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  
                  {/* Motherboard PCB Area */}
                  <rect
                    x="40"
                    y="25"
                    width="310"
                    height="230"
                    rx="6"
                    fill={completedStages.includes(5) ? '#064e3b' : '#1e293b'}
                    stroke={completedStages.includes(5) ? '#059669' : '#475569'}
                    strokeWidth="2"
                  />
                  <text x="50" y="42" fill="#94a3b8" fontSize="8" fontFamily="monospace">ATX MOTHERBOARD B550 v2.4</text>

                  {/* CPU Socket Area */}
                  <rect
                    x="80"
                    y="60"
                    width="70"
                    height="70"
                    rx="4"
                    fill={completedStages.includes(2) ? '#0284c7' : '#334155'}
                    stroke={completedStages.includes(2) ? '#38bdf8' : '#64748b'}
                    strokeWidth="1.5"
                  />
                  <circle cx="115" cy="95" r="22" fill={completedStages.includes(3) ? '#0369a1' : '#1e293b'} />
                  {completedStages.includes(3) && (
                    <text x="115" y="99" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">COOLER</text>
                  )}
                  <text x="115" y="142" fill="#cbd5e1" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    {completedStages.includes(2) ? 'CPU INSTALLED' : 'AM4 SOCKET'}
                  </text>

                  {/* RAM Slots (A1, A2, B1, B2) */}
                  <g transform="translate(175, 55)">
                    <rect x="0" y="0" width="8" height="85" rx="1" fill="#1e293b" stroke="#475569" />
                    <rect x="12" y="0" width="8" height="85" rx="1" fill={completedStages.includes(4) ? '#10b981' : '#1e293b'} stroke="#475569" />
                    <rect x="24" y="0" width="8" height="85" rx="1" fill="#1e293b" stroke="#475569" />
                    <rect x="36" y="0" width="8" height="85" rx="1" fill={completedStages.includes(4) ? '#10b981' : '#1e293b'} stroke="#475569" />
                    <text x="22" y="100" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">
                      {completedStages.includes(4) ? 'DUAL-CH RAM' : 'DIMM SLOTS'}
                    </text>
                  </g>

                  {/* M.2 NVMe Slot */}
                  <rect
                    x="80"
                    y="155"
                    width="80"
                    height="16"
                    rx="2"
                    fill={completedStages.includes(6) ? '#0d9488' : '#1e293b'}
                    stroke="#475569"
                  />
                  <text x="120" y="166" fill="#e2e8f0" fontSize="7" textAnchor="middle" fontFamily="monospace">
                    {completedStages.includes(6) ? 'M.2 NVMe SSD' : 'M.2 PCIe Gen4'}
                  </text>

                  {/* PCIe x16 GPU Slot */}
                  <rect
                    x="80"
                    y="185"
                    width="180"
                    height="35"
                    rx="4"
                    fill={completedStages.includes(8) ? '#4338ca' : '#1e293b'}
                    stroke={completedStages.includes(8) ? '#818cf8' : '#475569'}
                  />
                  <text x="170" y="206" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                    {completedStages.includes(8) ? 'DISCRETE GPU (PCIe x16) ONLINE' : 'PCIe x16 GPU EXPANSION SLOT'}
                  </text>

                  {/* 24-Pin ATX Power Header */}
                  <rect
                    x="235"
                    y="60"
                    width="14"
                    height="50"
                    rx="2"
                    fill={completedStages.includes(7) ? '#eab308' : '#334155'}
                  />
                  <text x="242" y="122" fill="#94a3b8" fontSize="6" textAnchor="middle" fontFamily="monospace">24-PIN</text>

                  {/* Power Supply Unit Bay */}
                  <rect
                    x="365"
                    y="170"
                    width="105"
                    height="85"
                    rx="4"
                    fill={completedStages.includes(7) ? '#1e293b' : '#0f172a'}
                    stroke={completedStages.includes(7) ? '#eab308' : '#334155'}
                    strokeWidth="1.5"
                  />
                  <text x="417" y="210" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    {completedStages.includes(7) ? '80+ GOLD PSU' : 'PSU BAY'}
                  </text>
                  <text x="417" y="224" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">
                    {completedStages.includes(7) ? '+12V / +5V OK' : 'EMPTY'}
                  </text>

                  {/* Diagnostic LED Array */}
                  <g transform="translate(325, 35)">
                    <circle cx="0" cy="0" r="3" fill={completedStages.includes(2) ? '#22c55e' : '#ef4444'} />
                    <circle cx="10" cy="0" r="3" fill={completedStages.includes(4) ? '#22c55e' : '#ef4444'} />
                    <circle cx="20" cy="0" r="3" fill={completedStages.includes(8) ? '#22c55e' : '#ef4444'} />
                    <circle cx="30" cy="0" r="3" fill={completedStages.includes(9) ? '#22c55e' : '#ef4444'} />
                    <text x="15" y="12" fill="#64748b" fontSize="6" textAnchor="middle" fontFamily="monospace">DEBUG LEDs</text>
                  </g>
                </svg>

                {/* Live Telemetry Overlay */}
                <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400">
                  {completedStages.length >= 8 ? 'POST: ALL PASSED • UEFI ACTIVE' : 'POST: SYSTEM IN PROGRESS'}
                </div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Assembly Pipeline Progress:
                </span>
                <div className="flex items-center gap-1">
                  {SIMULATION_STAGES.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                        completedStages.includes(s.id)
                          ? 'bg-emerald-500 text-white'
                          : idx === currentStageIdx
                          ? 'bg-blue-600 text-white animate-pulse ring-2 ring-blue-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                      title={s.title}
                    >
                      {completedStages.includes(s.id) ? '✓' : s.id}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Laboratory Terminal Output Log */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Laboratory Telemetry Console</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 text-slate-300">
                {simLog.map((log, lIdx) => (
                  <div key={lIdx} className="leading-tight">
                    <span className="text-blue-400">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLS: COMPONENT & TOOL INVENTORY TRAY */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>Hardware &amp; Tool Inventory Tray</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Select the appropriate part or tool required for the current active directive.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                10 Items
              </span>
            </div>

            {/* Inventory Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[580px] overflow-y-auto pr-1">
              {INVENTORY_ITEMS.map((item) => {
                const isItemUsed = completedStages.some(id => {
                  const s = SIMULATION_STAGES.find(st => st.id === id);
                  return s?.requiredItem === item.id;
                });
                const isSelected = selectedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isItemUsed) {
                        setSelectedItemId(item.id);
                        handleApplyItem(item.id);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                      isItemUsed
                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                          {item.category}
                        </span>
                        {isItemUsed && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            <Check className="w-3 h-3" /> Used
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400 font-medium">
                        {isItemUsed ? 'Installed' : 'Click to apply'}
                      </span>
                      <button
                        type="button"
                        disabled={isItemUsed}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          isItemUsed
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                        }`}
                      >
                        {isItemUsed ? 'Installed' : 'Select & Mount'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="font-bold block mb-0.5">Need guidance?</span>
              <p className="text-[11px] text-blue-800 leading-normal">
                Ask the <strong>CSSENTIAL AI Assistant</strong> on the right for hints regarding standoff grounding, XMP profiles, or dual-channel slot configurations!
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* SIMULATION COMPLETION ASSESSMENT TRANSCRIPT */
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border-2 border-emerald-300">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              LABORATORY PRACTICAL SIMULATION COMPLETED
            </span>
            <h3 className="text-2xl font-black text-gray-900 mt-3">
              Official PC Assembly &amp; Configuration Practical Certificate
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Computer Systems Servicing NC II • Lesson 2 &amp; Lesson 3 Laboratory Simulation
            </p>
          </div>

          {/* Results Summary Grid */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <div>
              <div className="text-[10px] font-bold uppercase text-gray-500">Mastery Grade</div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                {calculateScore()}%
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-gray-500">Total Duration</div>
              <div className="text-2xl font-black text-blue-700 font-mono mt-0.5">
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-gray-500">Mistakes Incurred</div>
              <div className="text-2xl font-black text-gray-800 font-mono mt-0.5">
                {mistakes}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
            Your telemetry results have been registered into your permanent academic record. You have successfully demonstrated competence in ESD safety, component alignment, thermal dissipation, dual-channel RAM topology, and UEFI configuration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
            >
              Practice Again
            </button>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              Return to Games Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
