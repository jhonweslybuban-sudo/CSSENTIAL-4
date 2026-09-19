import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Gauge,
  Monitor,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';

interface HardwareCompatibilityCalculatorProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

interface CPUItem {
  id: string;
  name: string;
  socket: 'LGA1700' | 'LGA1200' | 'AM5' | 'AM4';
  tdp: number; // Watts
  win11Supported: boolean;
  integratedGpu: boolean;
}

interface MoboItem {
  id: string;
  name: string;
  socket: 'LGA1700' | 'LGA1200' | 'AM5' | 'AM4';
  memoryType: 'DDR5' | 'DDR4';
  chipset: string;
  tpmSupport: boolean;
  pcieGen: 'Gen 5' | 'Gen 4' | 'Gen 3';
}

interface RAMItem {
  id: string;
  name: string;
  type: 'DDR5' | 'DDR4';
  capacityGb: number;
  speedMhz: number;
}

interface CoolerItem {
  id: string;
  name: string;
  ratedTdp: number; // Watts dissipation capacity
  type: 'AIO_LIQUID' | 'DUAL_TOWER_AIR' | 'STOCK_AIR';
}

interface GPUItem {
  id: string;
  name: string;
  powerDraw: number; // Watts
  minPsu: number;
  dx12Support: boolean;
}

interface PSUItem {
  id: string;
  name: string;
  wattage: number;
  rating: string;
}

export const HardwareCompatibilityCalculator: React.FC<HardwareCompatibilityCalculatorProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  // Preset Catalog
  const cpus: CPUItem[] = [
    { id: 'i9-14900k', name: 'Intel Core i9-14900K (24-Core, 6.0 GHz)', socket: 'LGA1700', tdp: 253, win11Supported: true, integratedGpu: true },
    { id: 'i5-13600k', name: 'Intel Core i5-13600K (14-Core, 5.1 GHz)', socket: 'LGA1700', tdp: 181, win11Supported: true, integratedGpu: true },
    { id: 'i5-10400', name: 'Intel Core i5-10400 (6-Core, 4.3 GHz)', socket: 'LGA1200', tdp: 65, win11Supported: true, integratedGpu: true },
    { id: 'r9-7950x', name: 'AMD Ryzen 9 7950X (16-Core, 5.7 GHz)', socket: 'AM5', tdp: 170, win11Supported: true, integratedGpu: true },
    { id: 'r7-7800x3d', name: 'AMD Ryzen 7 7800X3D (8-Core 3D V-Cache)', socket: 'AM5', tdp: 120, win11Supported: true, integratedGpu: true },
    { id: 'r5-5600x', name: 'AMD Ryzen 5 5600X (6-Core, 4.6 GHz)', socket: 'AM4', tdp: 65, win11Supported: true, integratedGpu: false }
  ];

  const motherboards: MoboItem[] = [
    { id: 'z790', name: 'ASUS ROG Strix Z790-E Gaming (LGA1700, DDR5, PCIe 5.0)', socket: 'LGA1700', memoryType: 'DDR5', chipset: 'Intel Z790', tpmSupport: true, pcieGen: 'Gen 5' },
    { id: 'b760', name: 'MSI B760 Gaming Plus WiFi (LGA1700, DDR5)', socket: 'LGA1700', memoryType: 'DDR5', chipset: 'Intel B760', tpmSupport: true, pcieGen: 'Gen 4' },
    { id: 'x670', name: 'Gigabyte X670 AORUS Elite AX (AM5, DDR5)', socket: 'AM5', memoryType: 'DDR5', chipset: 'AMD X670', tpmSupport: true, pcieGen: 'Gen 5' },
    { id: 'b550', name: 'MSI MAG B550 TOMAHAWK (AM4, DDR4)', socket: 'AM4', memoryType: 'DDR4', chipset: 'AMD B550', tpmSupport: true, pcieGen: 'Gen 4' },
    { id: 'b460', name: 'ASUS Prime B460M-A (LGA1200, DDR4)', socket: 'LGA1200', memoryType: 'DDR4', chipset: 'Intel B460', tpmSupport: true, pcieGen: 'Gen 3' }
  ];

  const rams: RAMItem[] = [
    { id: 'ddr5-6000-32', name: 'Corsair Vengeance 32GB (2x16GB) DDR5-6000 CL30', type: 'DDR5', capacityGb: 32, speedMhz: 6000 },
    { id: 'ddr5-5200-16', name: 'Crucial 16GB (2x8GB) DDR5-5200 CL42', type: 'DDR5', capacityGb: 16, speedMhz: 5200 },
    { id: 'ddr4-3600-32', name: 'G.Skill Ripjaws V 32GB (2x16GB) DDR4-3600 CL16', type: 'DDR4', capacityGb: 32, speedMhz: 3600 },
    { id: 'ddr4-3200-16', name: 'Kingston Fury Beast 16GB (2x8GB) DDR4-3200 CL16', type: 'DDR4', capacityGb: 16, speedMhz: 3200 },
    { id: 'ddr4-2666-4', name: 'OEM 4GB (1x4GB) DDR4-2666 (Below Modern Spec)', type: 'DDR4', capacityGb: 4, speedMhz: 2666 }
  ];

  const coolers: CoolerItem[] = [
    { id: 'aio-360', name: '360mm Triple-Fan AIO Liquid Cooler (300W Dissipation)', ratedTdp: 300, type: 'AIO_LIQUID' },
    { id: 'air-dual', name: 'Dual-Tower 6-Heatpipe Air Cooler (240W Dissipation)', ratedTdp: 240, type: 'DUAL_TOWER_AIR' },
    { id: 'stock-air', name: 'OEM Stock Down-Draft Cooler (65W Dissipation)', ratedTdp: 65, type: 'STOCK_AIR' }
  ];

  const gpus: GPUItem[] = [
    { id: 'rtx-4090', name: 'NVIDIA GeForce RTX 4090 24GB GDDR6X', powerDraw: 450, minPsu: 850, dx12Support: true },
    { id: 'rtx-4070s', name: 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X', powerDraw: 220, minPsu: 650, dx12Support: true },
    { id: 'rx-7800xt', name: 'AMD Radeon RX 7800 XT 16GB GDDR6', powerDraw: 263, minPsu: 700, dx12Support: true },
    { id: 'rtx-3060', name: 'NVIDIA GeForce RTX 3060 12GB GDDR6', powerDraw: 170, minPsu: 550, dx12Support: true },
    { id: 'igpu', name: 'Integrated Processor Graphics (No discrete GPU)', powerDraw: 15, minPsu: 350, dx12Support: true }
  ];

  const psus: PSUItem[] = [
    { id: '1000w', name: '1000W 80 Plus Gold Modular PSU', wattage: 1000, rating: '80+ Gold' },
    { id: '850w', name: '850W 80 Plus Gold Modular PSU', wattage: 850, rating: '80+ Gold' },
    { id: '750w', name: '750W 80 Plus Bronze Semi-Modular PSU', wattage: 750, rating: '80+ Bronze' },
    { id: '650w', name: '650W 80 Plus Bronze PSU', wattage: 650, rating: '80+ Bronze' },
    { id: '500w', name: '500W 80 Plus White Entry PSU', wattage: 500, rating: '80+ White' },
    { id: '350w', name: '350W Generic Office PSU (Low Power)', wattage: 350, rating: 'Standard' }
  ];

  // User selections
  const [selectedCpuId, setSelectedCpuId] = useState('i5-13600k');
  const [selectedMoboId, setSelectedMoboId] = useState('b760');
  const [selectedRamId, setSelectedRamId] = useState('ddr5-6000-32');
  const [selectedCoolerId, setSelectedCoolerId] = useState('air-dual');
  const [selectedGpuId, setSelectedGpuId] = useState('rtx-4070s');
  const [selectedPsuId, setSelectedPsuId] = useState('750w');
  const [targetOS, setTargetOS] = useState<'WIN11' | 'WIN10' | 'LINUX'>('WIN11');

  const selectedCpu = cpus.find(c => c.id === selectedCpuId)!;
  const selectedMobo = motherboards.find(m => m.id === selectedMoboId)!;
  const selectedRam = rams.find(r => r.id === selectedRamId)!;
  const selectedCooler = coolers.find(c => c.id === selectedCoolerId)!;
  const selectedGpu = gpus.find(g => g.id === selectedGpuId)!;
  const selectedPsu = psus.find(p => p.id === selectedPsuId)!;

  // Compatibility Calculations
  const analysis = useMemo(() => {
    const issues: Array<{ type: 'ERROR' | 'WARNING' | 'PASS'; title: string; desc: string }> = [];

    // 1. Socket Check
    if (selectedCpu.socket !== selectedMobo.socket) {
      issues.push({
        type: 'ERROR',
        title: 'CPU Socket Incompatibility',
        desc: `Physical socket mismatch! ${selectedCpu.name} requires socket ${selectedCpu.socket}, but ${selectedMobo.name} has socket ${selectedMobo.socket}. This CPU cannot be inserted into this motherboard.`
      });
    } else {
      issues.push({
        type: 'PASS',
        title: 'Socket Alignment Valid',
        desc: `Both CPU and Motherboard utilize the ${selectedCpu.socket} pin interface.`
      });
    }

    // 2. RAM Standard Check
    if (selectedMobo.memoryType !== selectedRam.type) {
      issues.push({
        type: 'ERROR',
        title: 'Memory Interface Notch Incompatibility',
        desc: `Physical RAM key mismatch! Motherboard requires ${selectedMobo.memoryType} memory, but selected RAM is ${selectedRam.type}. DDR4 and DDR5 modules have different pin counts (288 vs 288 with different key positions) and cannot be interchanged.`
      });
    } else {
      issues.push({
        type: 'PASS',
        title: 'Memory Standard Valid',
        desc: `Motherboard and RAM both use the ${selectedRam.type} interface standard.`
      });
    }

    // 3. Thermal Headroom Check
    if (selectedCooler.ratedTdp < selectedCpu.tdp) {
      issues.push({
        type: 'ERROR',
        title: 'Severe Thermal Throttling Warning',
        desc: `Cooler capacity deficit! The selected cooler is rated for only ${selectedCooler.ratedTdp}W, but the ${selectedCpu.name} draws up to ${selectedCpu.tdp}W under heavy load. The system will hit 100°C TJMax and thermal throttle heavily.`
      });
    } else if (selectedCooler.ratedTdp < selectedCpu.tdp * 1.15) {
      issues.push({
        type: 'WARNING',
        title: 'Tight Thermal Dissipation Margin',
        desc: `Cooler rated for ${selectedCooler.ratedTdp}W with CPU drawing ${selectedCpu.tdp}W. Operating temperatures may exceed 85°C during sustained rendering or heavy gaming.`
      });
    } else {
      issues.push({
        type: 'PASS',
        title: 'Thermal Headroom Adequate',
        desc: `Cooler capacity (${selectedCooler.ratedTdp}W) comfortably exceeds peak CPU draw (${selectedCpu.tdp}W).`
      });
    }

    // 4. Power Supply Budget & Overhead Check
    const baseSystemDraw = 70; // Motherboard, SSDs, fans, RGB, RAM
    const estimatedTotalWattage = selectedCpu.tdp + selectedGpu.powerDraw + baseSystemDraw;
    const recommendedPsu = Math.round(estimatedTotalWattage * 1.25); // +25% safety overhead for transient spikes

    if (selectedPsu.wattage < estimatedTotalWattage) {
      issues.push({
        type: 'ERROR',
        title: 'Dangerous Power Supply Deficit',
        desc: `Total estimated system draw is ${estimatedTotalWattage}W, which exceeds the PSU rated output (${selectedPsu.wattage}W). High GPU/CPU transient spikes will trip OCP (Over Current Protection) and cause sudden shutdowns.`
      });
    } else if (selectedPsu.wattage < recommendedPsu) {
      issues.push({
        type: 'WARNING',
        title: 'Suboptimal PSU Overhead',
        desc: `PSU (${selectedPsu.wattage}W) handles estimated draw (${estimatedTotalWattage}W), but falls below the recommended ${recommendedPsu}W (25% safety overhead for peak transient excursions and 50% efficiency curve).`
      });
    } else {
      issues.push({
        type: 'PASS',
        title: 'Power Delivery & Efficiency Optimized',
        desc: `PSU (${selectedPsu.wattage}W) provides ample headroom over ${estimatedTotalWattage}W estimated load, operating near the peak 50-70% efficiency sweet spot.`
      });
    }

    // 5. Windows 11 OS Prerequisites Check
    if (targetOS === 'WIN11') {
      if (selectedRam.capacityGb < 4) {
        issues.push({
          type: 'ERROR',
          title: 'Windows 11 Memory Requirement Failed',
          desc: 'Windows 11 strictly requires a minimum of 4 GB RAM. Selected capacity is below requirement.'
        });
      }
      if (!selectedMobo.tpmSupport) {
        issues.push({
          type: 'ERROR',
          title: 'Windows 11 TPM 2.0 Prerequisite Failed',
          desc: 'Motherboard lacks TPM 2.0 module or firmware fTPM support.'
        });
      }
      if (!selectedCpu.win11Supported) {
        issues.push({
          type: 'WARNING',
          title: 'Unsupported Processor Generation',
          desc: 'Processor is not on Microsoft official Windows 11 compatibility whitelist.'
        });
      }
    }

    const hasErrors = issues.some(i => i.type === 'ERROR');
    const hasWarnings = issues.some(i => i.type === 'WARNING');

    return {
      issues,
      estimatedTotalWattage,
      recommendedPsu,
      status: hasErrors ? 'INCOMPATIBLE' : hasWarnings ? 'COMPATIBLE_WITH_WARNINGS' : 'FULLY_COMPATIBLE'
    };
  }, [selectedCpu, selectedMobo, selectedRam, selectedCooler, selectedGpu, selectedPsu, targetOS]);

  const handleSaveBuildCheck = () => {
    api.logAction(studentId, sessionId, `Ran Hardware Compatibility Calculator: Status ${analysis.status}`);
    api.saveGameResult({
      student_id: studentId,
      session_id: sessionId,
      game_name: 'Hardware Compatibility Calculator',
      start_time: new Date(Date.now() - 60000).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 60,
      score: analysis.status === 'FULLY_COMPATIBLE' ? 100 : analysis.status === 'COMPATIBLE_WITH_WARNINGS' ? 85 : 50,
      level: 1,
      completed: true,
      extra_stats: {
        cpu: selectedCpu.name,
        motherboard: selectedMobo.name,
        ram: selectedRam.name,
        estimatedWatts: analysis.estimatedTotalWattage,
        status: analysis.status
      }
    });
    alert('Hardware configuration telemetry logged successfully to student profile!');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[750px] animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                Hardware &amp; OS Compatibility Engine (Wattage &amp; Socket Calculator)
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                Item #7 Practice
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive physical socket matching, DDR generation validation, cooler thermal dissipation, and PSU power budget analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400">Estimated Power Draw:</span>
            <div className="font-mono font-bold text-emerald-400 text-sm">
              ~{analysis.estimatedTotalWattage} W
            </div>
          </div>
          <button
            onClick={handleSaveBuildCheck}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
          >
            Log Build Telemetry
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-slate-50 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: COMPONENT SELECTION FORM */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-700" />
              <span>System Configuration Selector</span>
            </h2>
            <span className="text-xs text-gray-500 font-mono">6 Components</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* CPU */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">Processor (CPU):</label>
              <select
                value={selectedCpuId}
                onChange={(e) => setSelectedCpuId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {cpus.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} • Socket {c.socket} • {c.tdp}W TDP
                  </option>
                ))}
              </select>
            </div>

            {/* Motherboard */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">Motherboard (Chipset &amp; Socket):</label>
              <select
                value={selectedMoboId}
                onChange={(e) => setSelectedMoboId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {motherboards.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Memory RAM */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">System Memory (RAM Standard):</label>
              <select
                value={selectedRamId}
                onChange={(e) => setSelectedRamId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {rams.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CPU Cooler */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">CPU Thermal Cooling Solution:</label>
              <select
                value={selectedCoolerId}
                onChange={(e) => setSelectedCoolerId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {coolers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* GPU Video Card */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">Discrete GPU (Video Card):</label>
              <select
                value={selectedGpuId}
                onChange={(e) => setSelectedGpuId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {gpus.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.powerDraw}W Draw)
                  </option>
                ))}
              </select>
            </div>

            {/* PSU Power Supply */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">Power Supply Unit (PSU):</label>
              <select
                value={selectedPsuId}
                onChange={(e) => setSelectedPsuId(e.target.value)}
                className="w-full bg-slate-50 border border-gray-300 rounded p-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {psus.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Operating System */}
            <div>
              <label className="font-bold text-gray-800 block mb-1">Target Operating System:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'WIN11', label: 'Windows 11 (64-bit)' },
                  { id: 'WIN10', label: 'Windows 10 (64-bit)' },
                  { id: 'LINUX', label: 'Ubuntu Linux 22.04' }
                ].map((os) => (
                  <button
                    key={os.id}
                    type="button"
                    onClick={() => setTargetOS(os.id as any)}
                    className={`p-2 rounded border text-center font-bold cursor-pointer transition-all ${
                      targetOS === os.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {os.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME COMPATIBILITY & TELEMETRY REPORT */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            analysis.status === 'FULLY_COMPATIBLE'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : analysis.status === 'COMPATIBLE_WITH_WARNINGS'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}>
            <div className="flex items-center gap-3">
              {analysis.status === 'FULLY_COMPATIBLE' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : analysis.status === 'COMPATIBLE_WITH_WARNINGS' ? (
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
              )}
              <div>
                <h3 className="text-base font-black">
                  {analysis.status === 'FULLY_COMPATIBLE' && '100% Fully Compatible System'}
                  {analysis.status === 'COMPATIBLE_WITH_WARNINGS' && 'Compatible with Operational Warnings'}
                  {analysis.status === 'INCOMPATIBLE' && 'Hardware Incompatibilities Detected'}
                </h3>
                <p className="text-xs mt-0.5 opacity-90">
                  {analysis.status === 'FULLY_COMPATIBLE' && 'All physical pinouts, memory buses, thermal ratings, and power overhead checks passed.'}
                  {analysis.status === 'COMPATIBLE_WITH_WARNINGS' && 'Components will physically fit, but performance bottlenecks or thermal/power constraints exist.'}
                  {analysis.status === 'INCOMPATIBLE' && 'Critical physical or electrical conflict prevents successful assembly or booting.'}
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic Checks Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Automated Diagnostic Telemetry Checks
            </h3>

            <div className="space-y-2.5">
              {analysis.issues.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                    item.type === 'PASS'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : item.type === 'WARNING'
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-red-50/80 border-red-200'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {item.type === 'PASS' && <Check className="w-4 h-4 text-emerald-600" />}
                    {item.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {item.type === 'ERROR' && <X className="w-4 h-4 text-red-600 font-black" />}
                  </div>
                  <div>
                    <div className={`font-bold ${
                      item.type === 'PASS' ? 'text-emerald-950' : item.type === 'WARNING' ? 'text-amber-950' : 'text-red-950'
                    }`}>
                      {item.title}
                    </div>
                    <div className="text-gray-700 mt-0.5 leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power Budget Gauge Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-gray-800">Power Delivery Budget:</span>
              <div className="text-gray-500">
                Load: <strong className="text-gray-900 font-mono">{analysis.estimatedTotalWattage}W</strong> | Recommended PSU: <strong className="text-blue-700 font-mono">{analysis.recommendedPsu}W</strong>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[11px] text-gray-400 block">Installed PSU</span>
              <span className="font-black text-gray-900 text-sm">{selectedPsu.wattage}W ({selectedPsu.rating})</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
