import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Wrench,
  Cpu,
  Zap,
  Gauge,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Play,
  Flame,
  Award,
  ShieldCheck,
  ChevronRight,
  HardDrive,
  Fan,
  Layers,
  Thermometer,
  Activity,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { HardwareVisualArt } from './games/HardwareVisualAssets';

interface PCBuildSimulatorProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

type BuildMode = 'SELECT' | 'GUIDED' | 'FREE';

interface PartOption {
  id: string;
  category: 'cpu' | 'cooler' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'psu' | 'case';
  name: string;
  brand: string;
  specs: string;
  tdp: number;
  price: number;
  basePerf: number;
  heatCoeff: number;
  svgId: string;
  socket?: string;
  ramType?: string;
}

const AVAILABLE_PARTS: PartOption[] = [
  // CPUs
  { id: 'cpu_i5', category: 'cpu', name: 'Core i5-13400F', brand: 'Intel', specs: '10 Cores (6P+4E), 4.6 GHz Turbo, 65W TDP', tdp: 65, price: 195, basePerf: 14500, heatCoeff: 1.0, socket: 'LGA1700', svgId: 'cpu' },
  { id: 'cpu_i7', category: 'cpu', name: 'Core i7-14700K', brand: 'Intel', specs: '20 Cores, 5.6 GHz Turbo, Unlocked OC, 125W TDP', tdp: 125, price: 389, basePerf: 28200, heatCoeff: 1.45, socket: 'LGA1700', svgId: 'cpu' },
  { id: 'cpu_ryzen7', category: 'cpu', name: 'Ryzen 7 7800X3D', brand: 'AMD', specs: '8 Cores 3D V-Cache, 5.0 GHz, 120W TDP', tdp: 120, price: 370, basePerf: 29800, heatCoeff: 1.25, socket: 'AM5', svgId: 'cpu' },

  // Motherboards
  { id: 'mobo_z790', category: 'motherboard', name: 'Pro Z790-A WiFi', brand: 'Intel/ATX', specs: 'LGA1700, DDR5, PCIe 5.0, 16+1+1 Power Phases', tdp: 35, price: 219, basePerf: 1200, heatCoeff: 0.9, socket: 'LGA1700', ramType: 'DDR5', svgId: 'motherboard' },
  { id: 'mobo_b650', category: 'motherboard', name: 'TUF Gaming B650-Plus', brand: 'AMD/ATX', specs: 'Socket AM5, DDR5, 2.5G LAN, Dual M.2 PCIe 5.0', tdp: 30, price: 189, basePerf: 1100, heatCoeff: 0.9, socket: 'AM5', ramType: 'DDR5', svgId: 'motherboard' },

  // Coolers
  { id: 'cool_air', category: 'cooler', name: 'Dual Tower Air Cooler', brand: 'DeepCool', specs: '6 Heatpipes, 2x 120mm PWM Fans, 220W TDP Dissipation', tdp: 10, price: 55, basePerf: 500, heatCoeff: 0.75, svgId: 'cooler' },
  { id: 'cool_aio', category: 'cooler', name: '360mm Liquid AIO Radiator', brand: 'Corsair', specs: 'Triple 120mm Fans, Micro-channel Copper Coldplate, 320W TDP', tdp: 20, price: 149, basePerf: 1500, heatCoeff: 0.45, svgId: 'cooler' },

  // RAM
  { id: 'ram_16', category: 'ram', name: '16GB DDR5-5600 Kit', brand: 'Crucial', specs: '2x 8GB Dual Channel, CL36, 1.25V', tdp: 15, price: 65, basePerf: 4500, heatCoeff: 1.0, ramType: 'DDR5', svgId: 'ram' },
  { id: 'ram_32', category: 'ram', name: '32GB DDR5-6000 RGB Kit', brand: 'G.Skill', specs: '2x 16GB Dual Channel, CL30 Low Latency, Intel XMP & AMD EXPO', tdp: 20, price: 115, basePerf: 7800, heatCoeff: 1.05, ramType: 'DDR5', svgId: 'ram' },

  // GPUs
  { id: 'gpu_4060', category: 'gpu', name: 'GeForce RTX 4060 Dual', brand: 'NVIDIA', specs: '8GB GDDR6, DLSS 3, Ray Tracing Gen 3, 115W TDP', tdp: 115, price: 299, basePerf: 19500, heatCoeff: 1.0, svgId: 'gpu' },
  { id: 'gpu_4080', category: 'gpu', name: 'GeForce RTX 4080 Super', brand: 'NVIDIA', specs: '16GB GDDR6X, Triple Fan, 320W TDP, 4K High Framerates', tdp: 320, price: 999, basePerf: 54000, heatCoeff: 1.4, svgId: 'gpu' },

  // Storage
  { id: 'ssd_1tb', category: 'storage', name: '1TB NVMe M.2 PCIe 4.0 SSD', brand: 'Samsung', specs: 'Up to 7,450 MB/s Sequential Read, TLC V-NAND', tdp: 8, price: 85, basePerf: 4200, heatCoeff: 0.8, svgId: 'storage' },
  { id: 'ssd_2tb', category: 'storage', name: '2TB NVMe M.2 PCIe 4.0 SSD', brand: 'Kingston', specs: 'Up to 7,300 MB/s Read, High Endurance 1600 TBW', tdp: 10, price: 145, basePerf: 5100, heatCoeff: 0.85, svgId: 'storage' },

  // PSUs
  { id: 'psu_650', category: 'psu', name: '650W 80+ Gold Semi-Modular', brand: 'EVGA', specs: 'Japanese Capacitors, Active PFC, Single +12V Rail', tdp: 0, price: 89, basePerf: 0, heatCoeff: 0.9, svgId: 'psu' },
  { id: 'psu_850', category: 'psu', name: '850W 80+ Gold ATX 3.0 Full Modular', brand: 'Seasonic', specs: '12VHPWR Cable Ready, Zero-RPM Fan Mode', tdp: 0, price: 139, basePerf: 500, heatCoeff: 0.85, svgId: 'psu' },

  // Case
  { id: 'case_mid', category: 'case', name: 'Mid-Tower High Airflow ATX Case', brand: 'Fractal', specs: 'Mesh Front, Tempered Glass Side, 3x 140mm Intake Fans', tdp: 0, price: 99, basePerf: 500, heatCoeff: 0.85, svgId: 'chassis' }
];

const GUIDED_STEPS = [
  { step: 1, category: 'case', title: 'Chassis & Workspace Prep', prompt: 'Select the Desktop PC Case to provide proper airflow channels and structural standoffs.' },
  { step: 2, category: 'motherboard', title: 'Motherboard Foundation', prompt: 'Choose the Motherboard. It provides the chipset and sockets to link all components.' },
  { step: 3, category: 'cpu', title: 'Central Processing Unit (CPU)', prompt: 'Install the CPU into the socket. Remember to match Socket compatibility (LGA1700 / AM5)!' },
  { step: 4, category: 'ram', title: 'System Memory (RAM)', prompt: 'Insert DDR5 RAM modules into DIMM slots 2 & 4 for dual-channel memory bandwidth.' },
  { step: 5, category: 'storage', title: 'M.2 NVMe Solid State Drive', prompt: 'Mount the High-Speed NVMe PCIe SSD under the motherboard heatsink for operating system storage.' },
  { step: 6, category: 'cooler', title: 'CPU Thermal Cooler', prompt: 'Apply thermal paste and clamp the CPU Cooler down to conduct heat away from the silicon die.' },
  { step: 7, category: 'psu', title: 'Power Supply Unit (PSU)', prompt: 'Mount the 80+ Certified Power Supply to deliver steady +12V, +5V, and +3.3V power rails.' },
  { step: 8, category: 'gpu', title: 'Dedicated Graphics Card (GPU)', prompt: 'Seat the dedicated PCIe Graphics Card into the top primary PCIe x16 slot.' }
];

export const PCBuildSimulator: React.FC<PCBuildSimulatorProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [mode, setMode] = useState<BuildMode>('SELECT');
  const [selectedParts, setSelectedParts] = useState<Record<string, PartOption>>({});
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'warning' | 'error' | 'info' } | null>(null);

  // Overclock & CSSMark Benchmark State (Free Build)
  const [cpuClockMhz, setCpuClockMhz] = useState<number>(4000); // 3200 - 5800 MHz
  const [voltageOffset, setVoltageOffset] = useState<number>(0); // -100mV to +250mV
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState<number>(0);
  const [benchmarkResults, setBenchmarkResults] = useState<{
    cssMarkScore: number;
    cpuScore: number;
    gpuScore: number;
    peakTempC: number;
    peakPowerW: number;
    stability: 'STABLE' | 'THERMAL_THROTTLING' | 'CRASH_BLUE_SCREEN';
    tier: string;
  } | null>(null);

  // Calculate power requirements
  const totalTdp = (Object.values(selectedParts) as PartOption[]).reduce((acc: number, part: PartOption) => acc + (part.tdp || 0), 50);
  const psuCapacity = selectedParts['psu']?.id === 'psu_850' ? 850 : selectedParts['psu']?.id === 'psu_650' ? 650 : 0;
  const isPsuSufficient = psuCapacity === 0 || psuCapacity >= totalTdp * 1.2;

  // Compatibility checking
  const checkCompatibility = (part: PartOption): { ok: boolean; reason?: string } => {
    if (part.category === 'cpu') {
      const currentMobo = selectedParts['motherboard'];
      if (currentMobo && currentMobo.socket !== part.socket) {
        return { ok: false, reason: `Incompatible Socket! ${part.name} uses ${part.socket}, but motherboard is ${currentMobo.socket}.` };
      }
    }
    if (part.category === 'motherboard') {
      const currentCpu = selectedParts['cpu'];
      if (currentCpu && currentCpu.socket !== part.socket) {
        return { ok: false, reason: `Incompatible Socket! Motherboard is ${part.socket}, but installed CPU is ${currentCpu.socket}.` };
      }
    }
    return { ok: true };
  };

  const handleSelectPart = (part: PartOption) => {
    const compat = checkCompatibility(part);
    if (!compat.ok) {
      setFeedback({ text: compat.reason || 'Hardware mismatch detected!', type: 'error' });
      return;
    }

    const updated = { ...selectedParts, [part.category]: part };
    setSelectedParts(updated);
    setFeedback({ text: `Equipped ${part.name} successfully!`, type: 'success' });

    if (mode === 'GUIDED') {
      if (guidedStepIndex < GUIDED_STEPS.length - 1) {
        setGuidedStepIndex(prev => prev + 1);
      } else {
        setFeedback({ text: 'All 8 core components installed! System is ready to POST & Benchmark.', type: 'success' });
        // Log telemetry
        api.recordGameResult({
          student_id: studentId,
          session_id: sessionId,
          game_name: 'PC Build Simulator - Guided Build',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration_seconds: 120,
          score: 100,
          level: 1,
          completed: true
        });
      }
    }
  };

  const handleRemovePart = (category: string) => {
    const updated = { ...selectedParts };
    delete updated[category];
    setSelectedParts(updated);
    setBenchmarkResults(null);
  };

  const handleResetBuild = () => {
    setSelectedParts({});
    setGuidedStepIndex(0);
    setBenchmarkResults(null);
    setFeedback({ text: 'Workbench cleared. Ready to start new build configuration.', type: 'info' });
  };

  // Run CSSMark Benchmark
  const runCSSMarkBenchmark = () => {
    const hasCpu = !!selectedParts['cpu'];
    const hasMobo = !!selectedParts['motherboard'];
    const hasRam = !!selectedParts['ram'];
    const hasGpu = !!selectedParts['gpu'];
    const hasStorage = !!selectedParts['storage'];
    const hasPsu = !!selectedParts['psu'];
    const hasCooler = !!selectedParts['cooler'];

    if (!hasCpu || !hasMobo || !hasRam || !hasGpu || !hasPsu || !hasCooler) {
      setFeedback({
        text: 'Missing essential components! System requires CPU, Motherboard, RAM, GPU, Cooler, and PSU to POST.',
        type: 'error'
      });
      return;
    }

    setIsBenchmarking(true);
    setBenchmarkProgress(10);
    setFeedback(null);

    const interval = setInterval(() => {
      setBenchmarkProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finalizeBenchmark();
          return 100;
        }
        return prev + 18;
      });
    }, 400);
  };

  const finalizeBenchmark = () => {
    setIsBenchmarking(false);

    const cpu = selectedParts['cpu']!;
    const gpu = selectedParts['gpu']!;
    const ram = selectedParts['ram']!;
    const cooler = selectedParts['cooler']!;
    const psu = selectedParts['psu']!;

    // Overclock calculation
    const ocMultiplier = cpuClockMhz / 4200; // ratio
    const voltageHeatRatio = 1 + (voltageOffset / 300);

    // Heat calculation
    const baseHeat = (cpu.tdp * ocMultiplier * voltageHeatRatio * cooler.heatCoeff) + 25;
    const peakTemp = Math.round(baseHeat);

    // Power calculation
    const peakPower = Math.round((cpu.tdp * ocMultiplier * voltageHeatRatio) + gpu.tdp + 60);

    // Stability evaluation
    const psuMax = psu.id === 'psu_850' ? 850 : 650;
    let stability: 'STABLE' | 'THERMAL_THROTTLING' | 'CRASH_BLUE_SCREEN' = 'STABLE';

    if (peakPower > psuMax || voltageOffset > 180 || (cpuClockMhz > 5500 && voltageOffset < 50)) {
      stability = 'CRASH_BLUE_SCREEN';
    } else if (peakTemp >= 95) {
      stability = 'THERMAL_THROTTLING';
    }

    let cpuScore = Math.round(cpu.basePerf * ocMultiplier * (stability === 'THERMAL_THROTTLING' ? 0.75 : 1));
    let gpuScore = Math.round(gpu.basePerf);
    if (stability === 'CRASH_BLUE_SCREEN') {
      cpuScore = 0;
      gpuScore = 0;
    }

    const cssMarkScore = Math.round(cpuScore * 0.45 + gpuScore * 0.45 + ram.basePerf * 0.1);

    let tier = 'Standard Desktop';
    if (cssMarkScore > 40000) tier = 'Ultra Enthusiast Titan';
    else if (cssMarkScore > 25000) tier = 'High Performance Pro Rig';
    else if (cssMarkScore > 15000) tier = 'Mid-Range Powerhouse';

    setBenchmarkResults({
      cssMarkScore,
      cpuScore,
      gpuScore,
      peakTempC: peakTemp,
      peakPowerW: peakPower,
      stability,
      tier
    });

    // Save telemetry to local and server database
    api.recordGameResult({
      student_id: studentId,
      session_id: sessionId,
      game_name: 'PC Build Simulator - CSSMark Benchmark',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 60,
      score: stability === 'CRASH_BLUE_SCREEN' ? 20 : Math.min(100, Math.round(cssMarkScore / 500)),
      level: 1,
      completed: stability === 'STABLE'
    });
  };

  // --- MODE SELECTION SCREEN ---
  if (mode === 'SELECT') {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO GAMES HUB</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">
              SIMULATION LAB
            </span>
            <h1 className="text-xl font-black text-gray-900">PC Build Simulator</h1>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-black rounded-full border border-blue-400/30 uppercase tracking-wider">
              3 Modes • Full Hardware Compatibility
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Hands-on System-Building Simulator
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Step into the virtual hardware laboratory. Choose the mode matching your learning goals: follow step-by-step master guidelines, build freely with custom component pairings, or test overclocking limits with the official CSSMark synthetic stress benchmark.
            </p>
          </div>
        </div>

        {/* 2 Main Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Option 1: Guided Build */}
          <div
            onClick={() => {
              setSelectedParts({});
              setGuidedStepIndex(0);
              setMode('GUIDED');
            }}
            className="bg-white border-2 border-gray-200 hover:border-blue-600 rounded-3xl p-7 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Beginner / Step-by-Step
                </span>
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                  Guided Build Mode
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ideal for students mastering physical assembly sequence. Follow an interactive 8-step chronological roadmap covering chassis prep, motherboard seating, socket alignment, dual-channel RAM, and PCIe GPU insertion.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Interactive chronological milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time socket &amp; TDP validation checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Detailed hardware laboratory explanations</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all">
              <span>Start Guided Build</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Free Build Mode + Overclock & CSSMark */}
          <div
            onClick={() => {
              setSelectedParts({});
              setMode('FREE');
            }}
            className="bg-white border-2 border-gray-200 hover:border-indigo-600 rounded-3xl p-7 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sliders className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Advanced Lab Sandbox
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md">
                    Includes CSSMark
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-700 transition-colors">
                  Free Build Mode
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Total creative and technical freedom. Select custom CPUs, GPUs, RAM speeds, and AIO water cooling. Adjust live <strong>overclocking sliders</strong> (Core Clock &amp; Voltage) and execute the <strong>CSSMark</strong> stress benchmark to measure thermal stability.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>CPU Core Frequency (MHz) &amp; Voltage Offset tuning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-indigo-600" />
                  <span>Official CSSMark synthetic graphics &amp; compute benchmark</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-rose-600" />
                  <span>Thermal throttling &amp; Blue Screen (BSOD) physics</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all">
              <span>Enter Free Build &amp; Overclocking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    );
  }

  // --- GUIDED OR FREE WORKBENCH INTERFACE ---
  const currentGuidedStep = GUIDED_STEPS[guidedStepIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('SELECT')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Mode</span>
          </button>
          <div className="h-4 w-px bg-gray-200"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-900">
                {mode === 'GUIDED' ? 'Guided Build Mode' : 'Free Build & Overclocking Sandbox'}
              </h2>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                mode === 'GUIDED' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {mode === 'GUIDED' ? `Step ${guidedStepIndex + 1} of ${GUIDED_STEPS.length}` : 'Unlocked Workspace'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {mode === 'GUIDED'
                ? currentGuidedStep.title
                : 'Select parts freely, adjust frequency & voltage, and benchmark performance.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleResetBuild}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Workbench</span>
          </button>
        </div>
      </div>

      {/* Guided Mode Step Roadmap Banner */}
      {mode === 'GUIDED' && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
              Step {currentGuidedStep.step}: {currentGuidedStep.title}
            </span>
            <span className="text-xs font-bold text-blue-700">
              {Object.keys(selectedParts).length} / {GUIDED_STEPS.length} Installed
            </span>
          </div>
          <p className="text-xs text-blue-950 font-medium">
            {currentGuidedStep.prompt}
          </p>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {GUIDED_STEPS.map((s, idx) => {
              const isDone = !!selectedParts[s.category];
              const isCurrent = idx === guidedStepIndex;
              return (
                <button
                  key={s.step}
                  onClick={() => setGuidedStepIndex(idx)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : isCurrent
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span>{s.step}.</span>}
                  <span className="line-clamp-1">{s.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
          feedback.type === 'error' ? 'bg-red-50 text-red-900 border border-red-200' :
          feedback.type === 'warning' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
          'bg-blue-50 text-blue-900 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[11px] text-gray-500 hover:text-gray-900">Dismiss</button>
        </div>
      )}

      {/* Main Simulation Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): Virtual PC Tower Chassis & Installed Parts Slot */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                  Virtual Tower Assembly
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Est. Power Draw</span>
                <span className={`text-xs font-black ${isPsuSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalTdp}W {psuCapacity > 0 ? `/ ${psuCapacity}W PSU` : ''}
                </span>
              </div>
            </div>

            {/* Virtual Chassis Cutaway Visualization */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3 relative overflow-hidden">
              
              {/* Chassis internal slots */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Motherboard / CPU Slot */}
                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center min-h-[90px] transition-all ${
                  selectedParts['motherboard'] ? 'bg-slate-800/90 border-blue-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <HardwareVisualArt id="motherboard" className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {selectedParts['motherboard'] ? selectedParts['motherboard'].name : 'Motherboard Slot'}
                  </span>
                  {selectedParts['motherboard'] && (
                    <button
                      onClick={() => handleRemovePart('motherboard')}
                      className="text-[9px] text-rose-400 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* CPU Slot */}
                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center min-h-[90px] transition-all ${
                  selectedParts['cpu'] ? 'bg-slate-800/90 border-emerald-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <HardwareVisualArt id="cpu" className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {selectedParts['cpu'] ? selectedParts['cpu'].name : 'CPU Socket'}
                  </span>
                  {selectedParts['cpu'] && (
                    <button
                      onClick={() => handleRemovePart('cpu')}
                      className="text-[9px] text-rose-400 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* RAM Slot */}
                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center min-h-[90px] transition-all ${
                  selectedParts['ram'] ? 'bg-slate-800/90 border-cyan-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <HardwareVisualArt id="ram" className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {selectedParts['ram'] ? selectedParts['ram'].name : 'DIMM RAM Slots'}
                  </span>
                  {selectedParts['ram'] && (
                    <button
                      onClick={() => handleRemovePart('ram')}
                      className="text-[9px] text-rose-400 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Cooler Slot */}
                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center min-h-[90px] transition-all ${
                  selectedParts['cooler'] ? 'bg-slate-800/90 border-indigo-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <HardwareVisualArt id="cooler" className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {selectedParts['cooler'] ? selectedParts['cooler'].name : 'Thermal Cooler'}
                  </span>
                  {selectedParts['cooler'] && (
                    <button
                      onClick={() => handleRemovePart('cooler')}
                      className="text-[9px] text-rose-400 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* GPU Slot */}
                <div className={`col-span-2 p-3 rounded-xl border flex items-center justify-between transition-all ${
                  selectedParts['gpu'] ? 'bg-slate-800/90 border-purple-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <HardwareVisualArt id="gpu" className="w-10 h-10" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        {selectedParts['gpu'] ? selectedParts['gpu'].name : 'PCIe x16 GPU Slot'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {selectedParts['gpu'] ? selectedParts['gpu'].specs : 'Empty primary expansion slot'}
                      </span>
                    </div>
                  </div>
                  {selectedParts['gpu'] && (
                    <button
                      onClick={() => handleRemovePart('gpu')}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Storage & PSU Slots */}
                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                  selectedParts['storage'] ? 'bg-slate-800/90 border-amber-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <HardwareVisualArt id="storage" className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {selectedParts['storage'] ? selectedParts['storage'].name : 'M.2 NVMe Slot'}
                  </span>
                  {selectedParts['storage'] && (
                    <button onClick={() => handleRemovePart('storage')} className="text-[9px] text-rose-400 hover:underline mt-1">Remove</button>
                  )}
                </div>

                <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
                  selectedParts['psu'] ? 'bg-slate-800/90 border-yellow-500/50' : 'bg-slate-900/50 border-dashed border-slate-700'
                }`}>
                  <HardwareVisualArt id="psu" className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold text-slate-300">
                    {selectedParts['psu'] ? selectedParts['psu'].name : 'PSU Shroud'}
                  </span>
                  {selectedParts['psu'] && (
                    <button onClick={() => handleRemovePart('psu')} className="text-[9px] text-rose-400 hover:underline mt-1">Remove</button>
                  )}
                </div>

              </div>

            </div>

            {/* Free Build: Overclocking Panel */}
            {mode === 'FREE' && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase text-slate-200">
                      Overclocking Engine (Unlocked CPU)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Live Tuning
                  </span>
                </div>

                {/* CPU Clock Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Core Frequency Target</span>
                    <span className="font-black text-emerald-400 font-mono text-sm">{cpuClockMhz} MHz</span>
                  </div>
                  <input
                    type="range"
                    min={3200}
                    max={5800}
                    step={100}
                    value={cpuClockMhz}
                    onChange={(e) => {
                      setCpuClockMhz(Number(e.target.value));
                      setBenchmarkResults(null);
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>3.2 GHz (Stock)</span>
                    <span>4.5 GHz</span>
                    <span>5.8 GHz (Extreme)</span>
                  </div>
                </div>

                {/* Voltage Offset Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">VCore Voltage Offset</span>
                    <span className="font-black text-amber-400 font-mono text-sm">
                      {voltageOffset >= 0 ? `+${voltageOffset}` : voltageOffset} mV
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={250}
                    step={25}
                    value={voltageOffset}
                    onChange={(e) => {
                      setVoltageOffset(Number(e.target.value));
                      setBenchmarkResults(null);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-100mV (Undervolt)</span>
                    <span>0mV</span>
                    <span>+250mV (Overvolt)</span>
                  </div>
                </div>

                {/* Run CSSMark Button */}
                <button
                  onClick={runCSSMarkBenchmark}
                  disabled={isBenchmarking}
                  className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all ${
                    isBenchmarking
                      ? 'bg-slate-800 text-slate-400 cursor-wait'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}
                >
                  <Gauge className="w-4 h-4" />
                  <span>{isBenchmarking ? `Running CSSMark Stress Test (${benchmarkProgress}%)` : 'Run "CSSMark" Benchmark Test'}</span>
                </button>
              </div>
            )}

          </div>

          {/* CSSMark Benchmark Results Panel */}
          {benchmarkResults && (
            <div className={`rounded-3xl p-6 shadow-xl border animate-in zoom-in-95 duration-200 ${
              benchmarkResults.stability === 'STABLE'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-white'
                : benchmarkResults.stability === 'THERMAL_THROTTLING'
                ? 'bg-amber-950/90 border-amber-500/50 text-white'
                : 'bg-rose-950/90 border-rose-500/50 text-white'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                      CSSMark Score
                    </span>
                    <div className="text-3xl font-black font-mono">
                      {benchmarkResults.cssMarkScore.toLocaleString()} PTS
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      benchmarkResults.stability === 'STABLE'
                        ? 'bg-emerald-500 text-emerald-950'
                        : benchmarkResults.stability === 'THERMAL_THROTTLING'
                        ? 'bg-amber-500 text-amber-950'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {benchmarkResults.stability === 'STABLE' ? 'PASS (100% STABLE)' : benchmarkResults.stability === 'THERMAL_THROTTLING' ? 'THERMAL THROTTLE' : 'BSOD CRASH'}
                    </span>
                    <span className="text-[10px] block text-slate-300 mt-1">{benchmarkResults.tier}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <span className="text-slate-300 block text-[10px]">CPU Compute Score</span>
                    <strong className="text-sm font-mono">{benchmarkResults.cpuScore.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <span className="text-slate-300 block text-[10px]">GPU Graphics Score</span>
                    <strong className="text-sm font-mono">{benchmarkResults.gpuScore.toLocaleString()}</strong>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <span className="text-slate-300 block text-[10px]">Peak Die Temperature</span>
                    <strong className={`text-sm font-mono ${benchmarkResults.peakTempC > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {benchmarkResults.peakTempC}°C
                    </strong>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl">
                    <span className="text-slate-300 block text-[10px]">Peak Power Draw</span>
                    <strong className="text-sm font-mono">{benchmarkResults.peakPowerW} Watts</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (7 Cols): Component Catalog & Parts Selector */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {mode === 'GUIDED' ? `Step ${guidedStepIndex + 1}: Select ${currentGuidedStep.title}` : 'Hardware Component Catalog'}
                </h3>
                <p className="text-xs text-gray-500">
                  {mode === 'GUIDED'
                    ? `Pick the component that fulfills Step ${guidedStepIndex + 1}`
                    : 'Click any hardware part to equip it into your virtual build'}
                </p>
              </div>
            </div>

            {/* List of hardware cards */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {AVAILABLE_PARTS
                .filter(part => mode === 'FREE' || part.category === currentGuidedStep.category)
                .map((part) => {
                  const isEquipped = selectedParts[part.category]?.id === part.id;
                  const compat = checkCompatibility(part);

                  return (
                    <div
                      key={part.id}
                      onClick={() => handleSelectPart(part)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isEquipped
                          ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                          : !compat.ok
                          ? 'bg-gray-50/50 border-gray-200 opacity-60 hover:opacity-100 hover:border-red-300'
                          : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 p-1">
                          <HardwareVisualArt id={part.svgId} className="w-full h-full" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/60 px-2 py-0.5 rounded-md">
                              {part.category.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-gray-400">{part.brand}</span>
                          </div>
                          <h4 className="text-sm font-black text-gray-900 leading-tight truncate">
                            {part.name}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {part.specs}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-sm font-black text-gray-900">${part.price}</div>
                        <button
                          type="button"
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                            isEquipped
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-700 hover:bg-blue-800 text-white'
                          }`}
                        >
                          {isEquipped ? 'Equipped ✓' : 'Equip Part'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
