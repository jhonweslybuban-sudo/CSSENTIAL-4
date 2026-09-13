import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Terminal,
  Monitor,
  Cpu,
  Clock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  Layers,
  Zap,
  Lock,
  Flame,
  Power
} from 'lucide-react';
import { api } from '../services/api';

interface BiosSimulatorProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

type BiosTab = 'MAIN' | 'ADVANCED' | 'OVERCLOCK' | 'BOOT' | 'SECURITY' | 'EXIT';

interface BiosState {
  systemDate: string;
  systemTime: string;
  hyperThreading: boolean;
  virtualizationVTX: boolean;
  sataMode: 'AHCI' | 'RAID' | 'IDE';
  xmpProfile: 'DISABLED' | 'PROFILE_1_6000' | 'PROFILE_2_5600';
  cpuMultiplier: number; // e.g. 45 -> 4.5 GHz
  vcoreVoltage: number; // e.g. 1.25V
  fastBoot: boolean;
  secureBoot: boolean;
  bootOrder: string[];
  administratorPasswordSet: boolean;
  tpm20Enabled: boolean;
}

interface SettingDetail {
  id: string;
  name: string;
  section: string;
  summary: string;
  explanation: string;
  whyItMatters: string;
  recommended: string;
  examTip: string;
}

const SETTING_EXPLANATIONS: Record<string, SettingDetail> = {
  bios_version: {
    id: 'bios_version',
    name: 'BIOS / UEFI Firmware Revision',
    section: 'Firmware Identification',
    summary: 'Hardware-level firmware stored in non-volatile ROM/flash memory on the motherboard.',
    explanation: 'Unified Extensible Firmware Interface (UEFI) initializes all hardware components (CPU, RAM, PCIe, storage) before handing execution off to the operating system bootloader.',
    whyItMatters: 'Flashing/updating BIOS resolves CPU socket compatibility (e.g. newer generation chips) and fixes memory instability bugs.',
    recommended: 'Latest stable release from official motherboard manufacturer.',
    examTip: 'Never power down or unplug the computer during a BIOS flash update; doing so corrupts the EEPROM chip (bricking the board).'
  },
  processor_info: {
    id: 'processor_info',
    name: 'Processor Core & Clock Telemetry',
    section: 'Processor & Silicon Telemetry',
    summary: 'Central Processing Unit specifications, current clock multiplier, and core count.',
    explanation: 'Displays physical P-cores, efficiency E-cores, base clock frequency, and L3 cache size identified directly from CPU microcode.',
    whyItMatters: 'Verifies that the installed CPU is authentic, seated correctly in the socket, and operating at rated clock frequencies.',
    recommended: 'Stock manufacturer profile or stable XMP/all-core turbo curve.',
    examTip: 'If CPU temperature reads above 80°C in BIOS idle, thermal paste is missing, uneven, or the cooler plastic film was not removed.'
  },
  ram_telemetry: {
    id: 'ram_telemetry',
    name: 'RAM Dual-Channel Topology & Speed',
    section: 'Memory Subsystem',
    summary: 'Identified capacity, DDR generation, and active channel architecture.',
    explanation: 'Verifies whether system RAM is detected in Dual-Channel configuration (Slots A2 & B2) to double effective memory bus bandwidth.',
    whyItMatters: 'If only one stick is detected or running in Single-Channel mode, frame rates and rendering performance drop by 20–30%.',
    recommended: 'Dual-Channel active in slots 2 and 4 (A2 & B2) with XMP profile enabled.',
    examTip: 'CompTIA/NC II rule: If 32GB is installed but BIOS reports only 16GB, reseat the sticks and inspect for bent socket pins.'
  },
  hyper_threading: {
    id: 'hyper_threading',
    name: 'Intel Hyper-Threading Technology (SMT)',
    section: 'Sub-System: CPU Architecture',
    summary: 'Allows each physical CPU core to execute two concurrent instruction threads.',
    explanation: 'Simultaneous Multi-Threading (SMT) duplicates core architectural registers so the processor pipeline is rarely idle, creating two logical processors per physical core in Windows Task Manager.',
    whyItMatters: 'Dramatically improves workstation rendering, multi-tasking, and video compression throughput.',
    recommended: 'Enabled for all modern general computing and gaming setups.',
    examTip: 'Disabling HT is rarely done today, but historically reduced thermal load on competitive single-threaded benchmarking.'
  },
  virtualization_vtx: {
    id: 'virtualization_vtx',
    name: 'Intel VT-x / AMD-V Virtualization',
    section: 'Sub-System: CPU Architecture',
    summary: 'Hardware-assisted virtualization extensions for hypervisors and virtual machines.',
    explanation: 'Provides hardware virtualization privilege rings (Ring -1), allowing guest operating systems (Windows, Linux) to run inside VirtualBox, VMware, Hyper-V, or Docker WSL2 with native performance.',
    whyItMatters: 'Without VT-x enabled in BIOS, 64-bit virtual machines will fail to boot and WSL2/Docker will refuse to launch.',
    recommended: 'Enabled. Essential for IT students, developers, and server labs.',
    examTip: 'Common CSS NC II assessment task: Enable VT-x in BIOS when preparing client workstations for virtualization labs.'
  },
  sata_mode: {
    id: 'sata_mode',
    name: 'SATA Storage Controller Protocol (AHCI vs IDE)',
    section: 'Sub-System: Mass Storage Protocol',
    summary: 'Controls the communication protocol between the motherboard and SATA/SSD drives.',
    explanation: 'AHCI (Advanced Host Controller Interface) supports Native Command Queuing (NCQ), drive hot-plugging, and essential SSD TRIM commands. Legacy IDE emulates 1990s ribbon-cable controllers.',
    whyItMatters: 'Setting SATA to IDE cripples modern SSD speed by up to 60% and prevents TRIM garbage collection.',
    recommended: 'AHCI (mandatory for all modern SATA SSDs and HDDs).',
    examTip: 'Never switch SATA mode from AHCI to IDE after Windows is installed; Windows will fail to boot with INACCESSIBLE_BOOT_DEVICE BSOD.'
  },
  xmp_profile: {
    id: 'xmp_profile',
    name: 'Extreme Memory Profile (XMP / EXPO)',
    section: 'Frequency & Voltage Tuning: Memory',
    summary: 'One-click factory memory overclocking profile programmed by the RAM manufacturer.',
    explanation: 'DDR5 memory defaults to conservative JEDEC baseline speeds (4800 MT/s). Enabling XMP applies certified higher frequencies, lower CAS latencies, and rated voltages (1.35V).',
    whyItMatters: 'Provides free 15–25% memory throughput boost without manually calculating hundreds of sub-timings.',
    recommended: 'Profile 1 (Manufacturer Tested Stability).',
    examTip: 'If PC fails to POST after enabling XMP, the memory controller (IMC) is unstable; clear CMOS or choose Profile 2 with lower frequency.'
  },
  cpu_multiplier: {
    id: 'cpu_multiplier',
    name: 'CPU Core Clock Ratio Multiplier',
    section: 'Frequency & Voltage Tuning: Processor',
    summary: 'Determines processor operating speed by multiplying the Base Clock (BCLK).',
    explanation: 'Formula: 100.0 MHz Base Clock × Multiplier = Final Core Frequency. (e.g. 100 MHz × 46 = 4.60 GHz).',
    whyItMatters: 'Allows enthusiasts to overclock "unlocked" CPUs (Intel -K series or AMD Ryzen) for higher single-core instructions per second.',
    recommended: '46x–50x (or Auto Turbo Boost defaults for 24/7 stability).',
    examTip: 'Increasing multiplier without adequate voltage causes instantaneous OS crash under heavy prime95 or Cinebench load.'
  },
  vcore_voltage: {
    id: 'vcore_voltage',
    name: 'CPU Core Voltage (VCore)',
    section: 'Frequency & Voltage Tuning: Processor',
    summary: 'Direct electrical voltage delivered to the CPU silicon die by motherboard VRMs.',
    explanation: 'Higher core clock speeds require increased voltage to maintain signal integrity across billions of transistors.',
    whyItMatters: 'Too low = system crash (Blue Screen of Death). Too high = silicon electro-migration, extreme heat, and permanent chip death.',
    recommended: '1.200V – 1.300V for LGA1700 air/AIO coolers. Do not exceed 1.35V without custom watercooling.',
    examTip: 'Always adjust voltage in tiny increments (0.01V) when testing stability.'
  },
  boot_order: {
    id: 'boot_order',
    name: 'Boot Priority Sequence',
    section: 'Boot Priority & Startup Order',
    summary: 'The sequential list of storage devices the BIOS queries to find a bootable operating system.',
    explanation: 'When powered on, the UEFI firmware checks Device #1 for an EFI System Partition (ESP) with bootx64.efi. If found, it boots; if not, it queries Device #2.',
    whyItMatters: 'When reinstalling Windows from a USB installer, the USB flash drive must be temporarily placed at position #1.',
    recommended: '#1: UEFI NVMe SSD (for normal daily use); #1: UEFI USB Installer (during fresh OS installation).',
    examTip: 'If a computer shows "No bootable device found", inspect boot order and verify SATA/NVMe drive detection.'
  },
  fast_boot: {
    id: 'fast_boot',
    name: 'Fast Boot Initialization',
    section: 'Boot Acceleration',
    summary: 'Shortens POST boot time by skipping detailed component diagnostic checks.',
    explanation: 'Disables USB device enumeration and skips full memory write/read scans before loading the OS.',
    whyItMatters: 'Shaves 5–10 seconds off system boot time on modern fast NVMe SSDs.',
    recommended: 'Enabled. Disable only when troubleshooting faulty RAM or unrecognized USB keyboards.',
    examTip: 'With Ultra Fast Boot enabled, pressing DEL to enter BIOS on reboot may be ignored because USB keyboard polling is bypassed.'
  },
  secure_boot: {
    id: 'secure_boot',
    name: 'UEFI Secure Boot',
    section: 'Firmware Security & Cryptography',
    summary: 'Verifies the cryptographic digital signature of bootloaders and drivers.',
    explanation: 'UEFI checks the public key inside the motherboard firmware against Microsoft/OEM root certificates before allowing bootmgr or kernel drivers to load.',
    whyItMatters: 'Completely blocks insidious bootkits and rootkits that attempt to compromise the OS before antivirus software can start.',
    recommended: 'Enabled (mandatory for Windows 11 and riot/valorant vanguard anti-cheat).',
    examTip: 'To boot legacy non-UEFI Linux distros or repair utilities, Secure Boot must be temporarily toggled to Disabled or Standard mode.'
  },
  tpm_module: {
    id: 'tpm_module',
    name: 'Intel PTT / AMD fTPM (TPM 2.0 Module)',
    section: 'Firmware Security & Cryptography',
    summary: 'Hardware-based cryptographic vault for encryption keys and system integrity measurements.',
    explanation: 'Trusted Platform Module 2.0 stores BitLocker disk encryption keys, Windows Hello biometric credentials, and system posture measurements.',
    whyItMatters: 'Windows 11 strictly requires TPM 2.0. The Windows installer will show "This PC doesn\'t meet Windows 11 requirements" if disabled.',
    recommended: 'Enabled (Intel PTT or AMD fTPM).',
    examTip: 'Do NOT clear TPM keys if BitLocker is active without having your 48-digit recovery key saved, or all drive data will be permanently locked!'
  }
};

const INITIAL_BIOS: BiosState = {
  systemDate: new Date().toLocaleDateString('en-US'),
  systemTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
  hyperThreading: true,
  virtualizationVTX: true,
  sataMode: 'AHCI',
  xmpProfile: 'PROFILE_1_6000',
  cpuMultiplier: 46,
  vcoreVoltage: 1.25,
  fastBoot: true,
  secureBoot: true,
  bootOrder: [
    'UEFI NVMe: Samsung 990 PRO 2TB (Windows Boot Manager)',
    'UEFI USB: Kingston DataTraveler 3.0 (CSS Installation Media)',
    'UEFI SATA: Crucial MX500 SSD',
    'UEFI Network: Realtek PXE IPv4/IPv6'
  ],
  administratorPasswordSet: false,
  tpm20Enabled: true
};

export const BiosSimulator: React.FC<BiosSimulatorProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<BiosTab>('MAIN');
  const [bios, setBios] = useState<BiosState>(INITIAL_BIOS);
  const [activeSettingKey, setActiveSettingKey] = useState<string>('bios_version');
  const [expandedSettingKey, setExpandedSettingKey] = useState<string | null>(null);
  const [selectedSettingIndex, setSelectedSettingIndex] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<string>('Press F10 to Save & Reboot, or navigate settings with mouse/arrows.');
  const [bootSequenceActive, setBootSequenceActive] = useState<boolean>(false);
  const [bootOutput, setBootOutput] = useState<string[]>([]);

  // Telemetry logging
  const logBiosAction = (action: string) => {
    setStatusLog(action);
    api.logAction(studentId, sessionId, `BIOS Config: ${action}`);
  };

  const handleToggleBootOrder = (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...bios.bootOrder];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setBios(prev => ({ ...prev, bootOrder: list }));
    logBiosAction(`Changed Boot Priority: 1st Device is now [${list[0]}]`);
  };

  const handleSaveAndReboot = () => {
    setBootSequenceActive(true);
    setBootOutput([
      'POST Initializing: Checking RAM integrity...',
      'LGA1700 Core i7-14700K @ ' + (bios.cpuMultiplier / 10).toFixed(1) + ' GHz Detected.',
      'Memory: 32768 MB OK (XMP ' + bios.xmpProfile + ')',
      'TPM 2.0 Security Module: ' + (bios.tpm20Enabled ? 'ENABLED (Ready for Windows 11)' : 'DISABLED'),
      'Secure Boot State: ' + (bios.secureBoot ? 'ACTIVE' : 'LEGACY'),
      'Storage Controller: ' + bios.sataMode + ' mode initialized.',
      'Booting Primary Target: ' + bios.bootOrder[0] + ' ...',
      'Success: Operating System kernel hand-off verified!'
    ]);

    // Record completed score
    api.recordGameResult({
      student_id: studentId,
      session_id: sessionId,
      game_name: 'BIOS/UEFI Configuration Simulator',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 90,
      score: 100,
      level: 1,
      completed: true,
      extra_stats: {
        secureBoot: bios.secureBoot,
        tpm20: bios.tpm20Enabled,
        xmp: bios.xmpProfile,
        firstBootDevice: bios.bootOrder[0]
      }
    });
  };

  const handleResetDefaults = () => {
    setBios(INITIAL_BIOS);
    logBiosAction('Optimized Defaults Restored (Factory Settings)');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO GAMES HUB</span>
          </button>
          <div className="h-4 w-px bg-gray-200"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-900">BIOS / UEFI Setup Utility</h2>
              <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-800 rounded-full uppercase">
                Zero-Risk Simulator
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Practice tweaking CPU frequency, XMP profiles, TPM 2.0, Secure Boot, and Boot Priority with zero risk to physical hardware.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>F9: Load Defaults</span>
          </button>
          <button
            onClick={handleSaveAndReboot}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            <span>F10: Save &amp; Reboot</span>
          </button>
        </div>
      </div>

      {/* Realistic BIOS Screen Mockup */}
      <div className="bg-[#0b1021] text-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-700 font-mono space-y-6 relative overflow-hidden">
        
        {/* Top Header of BIOS */}
        <div className="border-b border-blue-500/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-blue-400 font-bold text-sm tracking-wide">
              CSSENTIAL Aptio Setup Utility - UEFI Version 2.24
            </span>
            <div className="text-[11px] text-gray-400">
              Motherboard: Pro-Z790 Series • BIOS Build Date: 09/10/2026
            </div>
          </div>
          <div className="text-right text-[11px] text-gray-300">
            <div>CPU Temp: <strong className="text-emerald-400">38°C / 100°F</strong></div>
            <div>Motherboard Temp: <strong className="text-blue-400">31°C</strong></div>
          </div>
        </div>

        {/* BIOS Tab Navigation */}
        <div className="space-y-2">
          {/* Quick Beginner Mode Helper Banner */}
          <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
              <span className="font-bold">Simplified Section Guide:</span>
              <span className="text-gray-300">
                {activeTab === 'MAIN' && 'View CPU specs, memory capacity, and system date/time.'}
                {activeTab === 'ADVANCED' && 'Configure storage controller AHCI/NVMe modes and VT-x virtualization.'}
                {activeTab === 'OVERCLOCK' && 'Adjust XMP memory speed profiles and CPU multiplier clocking safely.'}
                {activeTab === 'BOOT' && 'Change boot order priorities (e.g. boot from USB flash drive for Windows install).'}
                {activeTab === 'SECURITY' && 'Enable TPM 2.0 and Secure Boot for modern Windows 11 compatibility.'}
                {activeTab === 'EXIT' && 'Save all customized settings or reset to factory defaults with 0 hardware risk.'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-blue-300 shrink-0 bg-blue-900/50 px-2 py-0.5 rounded border border-blue-700">
              Active: [{activeTab}]
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-700 pb-2">
            {[
              { id: 'MAIN', defaultSetting: 'bios_version', label: '1. Main (System)', desc: 'Specs & Time' },
              { id: 'ADVANCED', defaultSetting: 'hyper_threading', label: '2. Advanced (Drives)', desc: 'AHCI / VT-x' },
              { id: 'OVERCLOCK', defaultSetting: 'xmp_profile', label: '3. Ai Tweaker (OC)', desc: 'XMP & Multiplier' },
              { id: 'BOOT', defaultSetting: 'boot_order', label: '4. Boot Priority', desc: 'USB & SSD Order' },
              { id: 'SECURITY', defaultSetting: 'secure_boot', label: '5. Security (TPM)', desc: 'Secure Boot & TPM' },
              { id: 'EXIT', defaultSetting: 'fast_boot', label: '6. Save & Exit', desc: 'Commit Changes' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setActiveSettingKey(t.defaultSetting);
                }}
                className={`px-3.5 py-2 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider flex flex-col items-start ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[9px] font-normal lowercase tracking-normal ${activeTab === t.id ? 'text-blue-200' : 'text-gray-500'}`}>
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Tab Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
          
          {/* Left Setting Pane (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-5 text-xs">
            
            {/* TAB 1: MAIN */}
            {activeTab === 'MAIN' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-blue-300 font-bold uppercase tracking-wider">
                    System Overview &amp; Hardware Detection
                  </div>
                  <span className="text-[10px] text-gray-400">Click any item for detailed setting explanation</span>
                </div>

                {/* Sub-section 1.1: Platform Identification */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Section 1.1: Platform &amp; Firmware Identification</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveSettingKey('bios_version');
                      setExpandedSettingKey(expandedSettingKey === 'bios_version' ? null : 'bios_version');
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeSettingKey === 'bios_version'
                        ? 'bg-blue-900/30 border-blue-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-300 font-bold block">BIOS Firmware Revision</span>
                        <span className="text-[10px] text-gray-400">Motherboard EEPROM image build identifier</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-slate-700">
                          2.24.1350 (x64 UEFI)
                        </span>
                        <span className="text-[10px] text-blue-400 underline">Explain</span>
                      </div>
                    </div>

                    {expandedSettingKey === 'bios_version' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 What this setting does:</p>
                        <p>{SETTING_EXPLANATIONS.bios_version.summary}</p>
                        <p className="text-gray-400 text-[10px]">{SETTING_EXPLANATIONS.bios_version.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-section 1.2: Processor & Memory Specs */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Section 1.2: Processor &amp; Memory Detection</span>
                  </div>

                  <div
                    onClick={() => {
                      setActiveSettingKey('processor_info');
                      setExpandedSettingKey(expandedSettingKey === 'processor_info' ? null : 'processor_info');
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeSettingKey === 'processor_info'
                        ? 'bg-blue-900/30 border-blue-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-300 font-bold block">Central Processing Unit</span>
                        <span className="text-[10px] text-gray-400">Intel 14th Gen Socket LGA1700</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-mono font-bold block">
                          {(bios.cpuMultiplier / 10).toFixed(2)} GHz
                        </span>
                        <span className="text-[9px] text-gray-400">i7-14700K (20 Cores)</span>
                      </div>
                    </div>

                    {expandedSettingKey === 'processor_info' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 What this setting does:</p>
                        <p>{SETTING_EXPLANATIONS.processor_info.summary}</p>
                        <p className="text-gray-400 text-[10px]">{SETTING_EXPLANATIONS.processor_info.whyItMatters}</p>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => {
                      setActiveSettingKey('ram_telemetry');
                      setExpandedSettingKey(expandedSettingKey === 'ram_telemetry' ? null : 'ram_telemetry');
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeSettingKey === 'ram_telemetry'
                        ? 'bg-blue-900/30 border-blue-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-300 font-bold block">Installed Physical Memory</span>
                        <span className="text-[10px] text-gray-400">Dual-Channel Architecture (Slots A2 &amp; B2)</span>
                      </div>
                      <span className="text-white font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-slate-700">
                        32,768 MB DDR5
                      </span>
                    </div>

                    {expandedSettingKey === 'ram_telemetry' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 What this setting does:</p>
                        <p>{SETTING_EXPLANATIONS.ram_telemetry.summary}</p>
                        <p className="text-gray-400 text-[10px]">{SETTING_EXPLANATIONS.ram_telemetry.whyItMatters}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-section 1.3: Real-Time Clock */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Section 1.3: Real-Time Clock &amp; Language</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-[10px] text-gray-400 block">System Date:</span>
                      <span className="font-bold text-white font-mono">{bios.systemDate}</span>
                    </div>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-[10px] text-gray-400 block">System Time:</span>
                      <span className="font-bold text-white font-mono">{bios.systemTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ADVANCED */}
            {activeTab === 'ADVANCED' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-blue-300 font-bold uppercase tracking-wider">
                    Sub-System &amp; Controller Configuration
                  </div>
                  <span className="text-[10px] text-gray-400">Divided into CPU &amp; Storage sub-sections</span>
                </div>

                {/* Sub-section 2.1: CPU Core Features */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Section 2.1: CPU Core Features &amp; Virtualization</span>
                  </div>

                  {/* Hyper-Threading */}
                  <div
                    onClick={() => setActiveSettingKey('hyper_threading')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'hyper_threading' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">Intel Hyper-Threading Technology</span>
                        <span className="text-[10px] text-gray-400">Provides 2 logical execution threads per physical performance core.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBios(p => ({ ...p, hyperThreading: !p.hyperThreading }));
                            logBiosAction(`Toggled HyperThreading: ${!bios.hyperThreading ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            bios.hyperThreading ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-700 text-gray-300'
                          }`}
                        >
                          [{bios.hyperThreading ? 'Enabled' : 'Disabled'}]
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSettingKey('hyper_threading');
                            setExpandedSettingKey(expandedSettingKey === 'hyper_threading' ? null : 'hyper_threading');
                          }}
                          className="text-[10px] text-blue-400 underline p-1 cursor-pointer"
                        >
                          {expandedSettingKey === 'hyper_threading' ? 'Hide' : 'Explain'}
                        </button>
                      </div>
                    </div>

                    {expandedSettingKey === 'hyper_threading' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 Setting Explanation:</p>
                        <p>{SETTING_EXPLANATIONS.hyper_threading.summary}</p>
                        <p className="text-amber-300 text-[10px]"><strong>Why it matters:</strong> {SETTING_EXPLANATIONS.hyper_threading.whyItMatters}</p>
                      </div>
                    )}
                  </div>

                  {/* VT-x */}
                  <div
                    onClick={() => setActiveSettingKey('virtualization_vtx')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'virtualization_vtx' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">Intel Virtualization Technology (VT-x / AMD-V)</span>
                        <span className="text-[10px] text-gray-400">Hardware extensions required for VirtualBox, VMware, and WSL2.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBios(p => ({ ...p, virtualizationVTX: !p.virtualizationVTX }));
                            logBiosAction(`Toggled Intel VT-x: ${!bios.virtualizationVTX ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            bios.virtualizationVTX ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-700 text-gray-300'
                          }`}
                        >
                          [{bios.virtualizationVTX ? 'Enabled' : 'Disabled'}]
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSettingKey('virtualization_vtx');
                            setExpandedSettingKey(expandedSettingKey === 'virtualization_vtx' ? null : 'virtualization_vtx');
                          }}
                          className="text-[10px] text-blue-400 underline p-1 cursor-pointer"
                        >
                          {expandedSettingKey === 'virtualization_vtx' ? 'Hide' : 'Explain'}
                        </button>
                      </div>
                    </div>

                    {expandedSettingKey === 'virtualization_vtx' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 Setting Explanation:</p>
                        <p>{SETTING_EXPLANATIONS.virtualization_vtx.summary}</p>
                        <p className="text-amber-300 text-[10px]"><strong>Why it matters:</strong> {SETTING_EXPLANATIONS.virtualization_vtx.whyItMatters}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-section 2.2: Mass Storage Protocol */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Section 2.2: Mass Storage Controller Protocols</span>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('sata_mode')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'sata_mode' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">SATA Controller Mode Selection</span>
                        <span className="text-[10px] text-gray-400">Configures storage protocol (AHCI recommended for SATA SSDs).</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={bios.sataMode}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setBios(p => ({ ...p, sataMode: val }));
                            logBiosAction(`Set SATA Controller Mode: ${val}`);
                          }}
                          className="bg-slate-800 text-blue-300 border border-slate-700 rounded px-2.5 py-1 font-bold cursor-pointer"
                        >
                          <option value="AHCI">AHCI (Fast SSD Mode)</option>
                          <option value="RAID">Intel RST / RAID Mode</option>
                          <option value="IDE">Legacy IDE (1990s Emulation)</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSettingKey('sata_mode');
                            setExpandedSettingKey(expandedSettingKey === 'sata_mode' ? null : 'sata_mode');
                          }}
                          className="text-[10px] text-blue-400 underline p-1 cursor-pointer"
                        >
                          {expandedSettingKey === 'sata_mode' ? 'Hide' : 'Explain'}
                        </button>
                      </div>
                    </div>

                    {expandedSettingKey === 'sata_mode' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 Setting Explanation:</p>
                        <p>{SETTING_EXPLANATIONS.sata_mode.explanation}</p>
                        <p className="text-amber-300 text-[10px]"><strong>Warning:</strong> {SETTING_EXPLANATIONS.sata_mode.examTip}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OVERCLOCK / AI TWEAKER */}
            {activeTab === 'OVERCLOCK' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-blue-300 font-bold uppercase tracking-wider">
                    Ai Tweaker: Frequency &amp; Voltage Tuning
                  </div>
                  <span className="text-[10px] text-gray-400">Divided into Memory &amp; CPU tuning sections</span>
                </div>

                {/* Sub-section 3.1: Memory Frequency Tuning */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Section 3.1: Memory Frequency Tuning (XMP)</span>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('xmp_profile')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'xmp_profile' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">Memory XMP (Extreme Memory Profile)</span>
                        <span className="text-[10px] text-gray-400">Enables tested manufacturer overclocking profile (DDR5-6000).</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={bios.xmpProfile}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setBios(p => ({ ...p, xmpProfile: val }));
                            logBiosAction(`Selected Memory XMP Profile: ${val}`);
                          }}
                          className="bg-slate-800 text-emerald-400 border border-slate-700 rounded px-2.5 py-1 font-bold cursor-pointer"
                        >
                          <option value="PROFILE_1_6000">XMP I: DDR5-6000 CL30 (1.35V)</option>
                          <option value="PROFILE_2_5600">XMP II: DDR5-5600 CL36 (1.25V)</option>
                          <option value="DISABLED">Disabled (Standard JEDEC 4800MHz)</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSettingKey('xmp_profile');
                            setExpandedSettingKey(expandedSettingKey === 'xmp_profile' ? null : 'xmp_profile');
                          }}
                          className="text-[10px] text-blue-400 underline p-1 cursor-pointer"
                        >
                          {expandedSettingKey === 'xmp_profile' ? 'Hide' : 'Explain'}
                        </button>
                      </div>
                    </div>

                    {expandedSettingKey === 'xmp_profile' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 Setting Explanation:</p>
                        <p>{SETTING_EXPLANATIONS.xmp_profile.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-section 3.2: CPU Multiplier & Voltage */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Section 3.2: CPU Clock Multiplier &amp; Voltage Safety</span>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('cpu_multiplier')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'cpu_multiplier' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">CPU Core Ratio Multiplier</span>
                        <span className="text-[10px] text-gray-400">100.0 MHz Base Clock × Multiplier = Frequency</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const n = Math.max(34, bios.cpuMultiplier - 1);
                            setBios(p => ({ ...p, cpuMultiplier: n }));
                            logBiosAction(`CPU Multiplier adjusted to ${n}x (${(n / 10).toFixed(1)} GHz)`);
                          }}
                          className="px-2.5 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 cursor-pointer font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-yellow-400 font-mono w-14 text-center text-xs">
                          {bios.cpuMultiplier}x ({(bios.cpuMultiplier / 10).toFixed(1)}G)
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const n = Math.min(60, bios.cpuMultiplier + 1);
                            setBios(p => ({ ...p, cpuMultiplier: n }));
                            logBiosAction(`CPU Multiplier adjusted to ${n}x (${(n / 10).toFixed(1)} GHz)`);
                          }}
                          className="px-2.5 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('vcore_voltage')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'vcore_voltage' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">CPU Core Voltage (VCore)</span>
                        <span className="text-[10px] text-gray-400">Silicon supply voltage (Keep under 1.35V for stability).</span>
                      </div>
                      <span className="text-blue-400 font-bold font-mono px-2.5 py-1 bg-black/40 rounded border border-slate-700">
                        {bios.vcoreVoltage.toFixed(3)} V
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BOOT CONFIGURATION */}
            {activeTab === 'BOOT' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-blue-300 font-bold uppercase tracking-wider">
                    Boot Priority &amp; Startup Sequence
                  </div>
                  <span className="text-[10px] text-gray-400">Divided into Device Order &amp; Acceleration</span>
                </div>

                {/* Sub-section 4.1: Boot Device Priority Sequence */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Section 4.1: Boot Device Priority Sequence</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSettingKey('boot_order');
                        setExpandedSettingKey(expandedSettingKey === 'boot_order' ? null : 'boot_order');
                      }}
                      className="text-[10px] text-blue-400 underline cursor-pointer"
                    >
                      {expandedSettingKey === 'boot_order' ? 'Hide Guide' : 'How Boot Order Works'}
                    </button>
                  </div>

                  {expandedSettingKey === 'boot_order' && (
                    <div className="p-2.5 bg-blue-950/40 border border-blue-800 rounded-lg text-[11px] text-blue-200 space-y-1">
                      <p className="font-bold text-white">💡 CSS NC II Practical Rule:</p>
                      <p>{SETTING_EXPLANATIONS.boot_order.explanation}</p>
                      <p className="text-gray-300 text-[10px]">👉 <strong>Tip:</strong> To install an OS, move the <strong>UEFI USB Flash Drive</strong> to position #1. After Windows installs, position #1 must be the <strong>UEFI NVMe SSD (Windows Boot Manager)</strong>.</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {bios.bootOrder.map((device, idx) => (
                      <div
                        key={device}
                        onClick={() => setActiveSettingKey('boot_order')}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          idx === 0
                            ? 'bg-blue-950/60 border-blue-500 text-white shadow-xs'
                            : 'bg-slate-900/60 border-slate-800 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs">{device}</span>
                          {idx === 0 && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                              Primary Boot
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBootOrder(idx, 'UP');
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] cursor-pointer font-bold"
                          >
                            ▲ UP
                          </button>
                          <button
                            disabled={idx === bios.bootOrder.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBootOrder(idx, 'DOWN');
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] cursor-pointer font-bold"
                          >
                            ▼ DOWN
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-section 4.2: Fast Boot */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Section 4.2: Boot Acceleration</span>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('fast_boot')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'fast_boot' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">Fast Boot Initialization</span>
                        <span className="text-[10px] text-gray-400">Bypasses redundant POST self-tests to load Windows faster.</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBios(p => ({ ...p, fastBoot: !p.fastBoot }));
                          logBiosAction(`Toggled Fast Boot: ${!bios.fastBoot ? 'ENABLED' : 'DISABLED'}`);
                        }}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          bios.fastBoot ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-gray-300'
                        }`}
                      >
                        [{bios.fastBoot ? 'Enabled' : 'Disabled'}]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY */}
            {activeTab === 'SECURITY' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-blue-300 font-bold uppercase tracking-wider">
                    Security, TPM 2.0 &amp; Secure Boot
                  </div>
                  <span className="text-[10px] text-gray-400">Divided into Windows 11 &amp; Bootloader Integrity</span>
                </div>

                {/* Sub-section 5.1: Windows 11 TPM */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Section 5.1: Windows 11 Cryptographic Module (TPM 2.0)</span>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('tpm_module')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'tpm_module' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">Intel PTT / AMD fTPM (TPM 2.0 Module)</span>
                        <span className="text-[10px] text-gray-400">Hardware crypto-vault required for Windows 11 &amp; BitLocker encryption.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBios(p => ({ ...p, tpm20Enabled: !p.tpm20Enabled }));
                            logBiosAction(`TPM 2.0 State: ${!bios.tpm20Enabled ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            bios.tpm20Enabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-red-600 text-white'
                          }`}
                        >
                          [{bios.tpm20Enabled ? 'Enabled' : 'Disabled'}]
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSettingKey('tpm_module');
                            setExpandedSettingKey(expandedSettingKey === 'tpm_module' ? null : 'tpm_module');
                          }}
                          className="text-[10px] text-blue-400 underline p-1 cursor-pointer"
                        >
                          {expandedSettingKey === 'tpm_module' ? 'Hide' : 'Explain'}
                        </button>
                      </div>
                    </div>

                    {expandedSettingKey === 'tpm_module' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 Setting Explanation:</p>
                        <p>{SETTING_EXPLANATIONS.tpm_module.explanation}</p>
                        <p className="text-amber-300 text-[10px]"><strong>CompTIA / NC II Exam Note:</strong> {SETTING_EXPLANATIONS.tpm_module.examTip}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-section 5.2: Secure Boot */}
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Section 5.2: Kernel &amp; Bootloader Integrity (Secure Boot)</span>
                  </div>

                  <div
                    onClick={() => setActiveSettingKey('secure_boot')}
                    className={`p-3 rounded-lg border transition-all ${
                      activeSettingKey === 'secure_boot' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">UEFI Secure Boot</span>
                        <span className="text-[10px] text-gray-400">Verifies digital signature of EFI binaries before CPU execution.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBios(p => ({ ...p, secureBoot: !p.secureBoot }));
                            logBiosAction(`Secure Boot toggled to: ${!bios.secureBoot ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            bios.secureBoot ? 'bg-emerald-600 text-white shadow-xs' : 'bg-red-600 text-white'
                          }`}
                        >
                          [{bios.secureBoot ? 'Enabled' : 'Disabled'}]
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSettingKey('secure_boot');
                            setExpandedSettingKey(expandedSettingKey === 'secure_boot' ? null : 'secure_boot');
                          }}
                          className="text-[10px] text-blue-400 underline p-1 cursor-pointer"
                        >
                          {expandedSettingKey === 'secure_boot' ? 'Hide' : 'Explain'}
                        </button>
                      </div>
                    </div>

                    {expandedSettingKey === 'secure_boot' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <p className="text-emerald-300 font-bold">💡 Setting Explanation:</p>
                        <p>{SETTING_EXPLANATIONS.secure_boot.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: EXIT */}
            {activeTab === 'EXIT' && (
              <div className="space-y-4">
                <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                  Exit &amp; Firmware Commit Options
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                      Section 6.1: Save CMOS &amp; Reboot
                    </span>
                    <button
                      onClick={handleSaveAndReboot}
                      className="w-full text-left p-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="block text-sm">Save Changes &amp; Reboot (F10)</span>
                        <span className="text-[10px] text-blue-200 font-normal">Writes all modified registers into CMOS NVRAM and restarts system POST.</span>
                      </div>
                      <ChevronRight className="w-5 h-5 shrink-0" />
                    </button>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                      Section 6.2: Recovery &amp; Factory Presets
                    </span>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setBios(INITIAL_BIOS);
                          logBiosAction('Discarded all pending CMOS changes & loaded factory defaults.');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold transition-all cursor-pointer flex items-center justify-between border border-slate-800"
                      >
                        <div>
                          <span className="block text-xs">Load Optimized Defaults (F9)</span>
                          <span className="text-[10px] text-gray-500 font-normal">Restores factory JEDEC memory and stock CPU clocks for failsafe booting.</span>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>

                      <button
                        onClick={onBack}
                        className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold transition-all cursor-pointer flex items-center justify-between border border-slate-800"
                      >
                        <div>
                          <span className="block text-xs">Exit Without Saving</span>
                          <span className="text-[10px] text-gray-500 font-normal">Discards all changes made during this session.</span>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Help / Status Pane (4 Cols) with DEDICATED SETTING DEEP DIVE */}
          <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Setting Explainer</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  LIVE DEEP DIVE
                </span>
              </div>

              {/* Dynamic Selected Setting Card */}
              {SETTING_EXPLANATIONS[activeSettingKey] ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/80 space-y-1.5">
                    <span className="text-[9px] font-bold uppercase text-blue-400 tracking-wider block">
                      {SETTING_EXPLANATIONS[activeSettingKey].section}
                    </span>
                    <h4 className="text-sm font-black text-white">
                      {SETTING_EXPLANATIONS[activeSettingKey].name}
                    </h4>
                    <p className="text-[11px] text-blue-200 leading-relaxed">
                      {SETTING_EXPLANATIONS[activeSettingKey].summary}
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px] text-gray-300 leading-relaxed">
                    <div>
                      <strong className="text-slate-400 block text-[10px] uppercase">Technical Function:</strong>
                      <p>{SETTING_EXPLANATIONS[activeSettingKey].explanation}</p>
                    </div>

                    <div>
                      <strong className="text-slate-400 block text-[10px] uppercase">Why It Matters:</strong>
                      <p>{SETTING_EXPLANATIONS[activeSettingKey].whyItMatters}</p>
                    </div>

                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px]">
                      <strong className="text-emerald-400 block uppercase">Recommended Value:</strong>
                      <span className="text-white font-mono">{SETTING_EXPLANATIONS[activeSettingKey].recommended}</span>
                    </div>

                    <div className="p-2 bg-amber-950/30 rounded-lg border border-amber-800/60 text-[10px] text-amber-200">
                      <strong className="text-amber-400 block uppercase">NC II / CompTIA Exam Tip:</strong>
                      <span>{SETTING_EXPLANATIONS[activeSettingKey].examTip}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs py-4 text-center">
                  Select or click any setting on the left to inspect its complete technical explanation and exam tips.
                </div>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="text-[10px] text-gray-400">
                <span className="font-bold text-gray-300 block mb-1">Keyboard Shortcuts:</span>
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                  <div><span className="text-blue-400">F9</span>: Defaults</div>
                  <div><span className="text-emerald-400">F10</span>: Save &amp; Reboot</div>
                </div>
              </div>

              {/* Event Log */}
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block text-[9px] mb-1">
                  Firmware Event Log:
                </span>
                <div className="p-2 bg-black/60 border border-slate-800 rounded text-[10px] text-emerald-400 font-mono truncate">
                  &gt; {statusLog}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Boot & POST Console Modal if F10 clicked */}
      {bootSequenceActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#090d16] text-white rounded-2xl shadow-2xl border-2 border-emerald-500/50 p-6 space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                <h3 className="text-sm font-black text-emerald-400">System POST &amp; OS Boot Sequence</h3>
              </div>
              <span className="text-xs text-gray-400">CMOS Written</span>
            </div>

            <div className="space-y-1 text-xs bg-black/60 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
              {bootOutput.map((line, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-400">
                  <span className="text-slate-600">&gt;</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-400">
                All BIOS changes passed hardware diagnostics with 0 errors.
              </div>
              <button
                onClick={() => setBootSequenceActive(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Return to BIOS Setup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
