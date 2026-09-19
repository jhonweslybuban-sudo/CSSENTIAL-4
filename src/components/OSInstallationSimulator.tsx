import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  HardDrive,
  Usb,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  Layers,
  Terminal,
  Cpu,
  Monitor,
  Check,
  RefreshCw,
  FolderOpen,
  Wrench,
  HelpCircle,
  Play
} from 'lucide-react';
import { api } from '../services/api';

interface OSInstallationSimulatorProps {
  studentId: string;
  sessionId: string;
  onBack: () => void;
}

type ModeTab = 'INSTALLATION_SIMULATOR' | 'MEDIA_TROUBLESHOOTING' | 'DRIVER_DEPLOYMENT';

export const OSInstallationSimulator: React.FC<OSInstallationSimulatorProps> = ({
  studentId,
  sessionId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<ModeTab>('INSTALLATION_SIMULATOR');

  // Simulator Phase State
  // 0: Boot Selection (USB vs SSD)
  // 1: Windows Setup Initial (Language, Keyboard)
  // 2: Install Now Button & Product Key
  // 3: License Terms
  // 4: Installation Type (Upgrade vs Custom)
  // 5: Disk Partition Manager (Unallocated vs Partitions)
  // 6: Copying Windows Files (Progress bar)
  // 7: Out-of-Box Experience (OOBE - Region, Account, Network)
  // 8: Desktop Ready & Completion
  const [phase, setPhase] = useState<number>(0);

  // Setup form states
  const [selectedLanguage, setSelectedLanguage] = useState('English (United States)');
  const [selectedTimeFormat, setSelectedTimeFormat] = useState('English (Philippines)');
  const [selectedKeyboard, setSelectedKeyboard] = useState('US');
  const [productKeyChoice, setProductKeyChoice] = useState<'ENTER' | 'SKIP'>('SKIP');
  const [selectedEdition, setSelectedEdition] = useState('Windows 11 Pro 64-bit');
  const [licenseAccepted, setLicenseAccepted] = useState(false);

  // Disk Partitioning State
  const [driverLoaded, setDriverLoaded] = useState(false);
  const [showDriverPrompt, setShowDriverPrompt] = useState(false);
  const [diskState, setDiskState] = useState<'RAW_EMPTY' | 'PARTITIONED'>('RAW_EMPTY');
  const [selectedPartition, setSelectedPartition] = useState<number>(0);
  const [partitionActionMessage, setPartitionActionMessage] = useState<string | null>(null);

  // Install Progress State
  const [installProgress, setInstallProgress] = useState(0);
  const [installStepIndex, setInstallStepIndex] = useState(0);

  // OOBE State
  const [oobeRegion, setOobeRegion] = useState('Philippines');
  const [oobeKeyboard, setOobeKeyboard] = useState('US');
  const [oobeDeviceName, setOobeDeviceName] = useState('CSSENTIAL-PC01');
  const [oobeAccountType, setOobeAccountType] = useState<'ONLINE' | 'LOCAL'>('LOCAL');
  const [oobeUsername, setOobeUsername] = useState('StudentTechnician');

  // Media Troubleshooting State
  const [selectedMediaIssue, setSelectedMediaIssue] = useState<number>(0);
  const [mediaQuizScore, setMediaQuizScore] = useState<number | null>(null);

  // Driver Deployment Checklist State
  const [driverSteps, setDriverSteps] = useState([
    { id: 'CHIPSET', name: '1. Motherboard Chipset Driver (INF & Management Engine)', installed: false, why: 'Enables proper communication between CPU, PCIe controllers, and system buses.' },
    { id: 'STORAGE', name: '2. Intel Rapid Storage / AMD RAID Driver', installed: false, why: 'Optimizes NVMe SSD low-latency caching and PCIe storage controller throughput.' },
    { id: 'LAN_WIFI', name: '3. Network LAN & Wi-Fi 6E/7 Drivers', installed: false, why: 'Establishes stable local Gigabit/2.5G network connection for downloading remaining packages.' },
    { id: 'GPU', name: '4. Dedicated GPU Display Driver (NVIDIA/AMD/Intel)', installed: false, why: 'Unlocks native monitor refresh rates (144Hz/240Hz), multi-monitor support, and hardware acceleration.' },
    { id: 'AUDIO', name: '5. High-Definition Audio Codec Driver (Realtek)', installed: false, why: 'Configures front-panel headphone jack detection and multi-channel audio DAC routing.' },
    { id: 'UPDATE', name: '6. Windows Security & Cumulative Quality Updates', installed: false, why: 'Patches known kernel vulnerabilities and ensures peripheral device compatibility.' }
  ]);

  // Install Progress Timer
  useEffect(() => {
    let timer: any;
    if (phase === 6) {
      timer = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setPhase(7); // Advance to OOBE
            return 100;
          }
          const next = prev + 5;
          if (next < 20) setInstallStepIndex(0);
          else if (next < 70) setInstallStepIndex(1);
          else if (next < 85) setInstallStepIndex(2);
          else if (next < 95) setInstallStepIndex(3);
          else setInstallStepIndex(4);
          return next;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [phase]);

  const handleRestartSimulator = () => {
    setPhase(0);
    setLicenseAccepted(false);
    setDiskState('RAW_EMPTY');
    setDriverLoaded(false);
    setShowDriverPrompt(false);
    setInstallProgress(0);
    setInstallStepIndex(0);
  };

  const handleInstallDriver = () => {
    setDriverLoaded(true);
    setShowDriverPrompt(false);
    setPartitionActionMessage('Intel VMD / RST Storage Controller Driver successfully injected. NVMe PCIe SSD detected!');
    setTimeout(() => setPartitionActionMessage(null), 4000);
  };

  const handleCreatePartitions = () => {
    setDiskState('PARTITIONED');
    setSelectedPartition(3); // Select the main NTFS partition
    setPartitionActionMessage('Windows setup created required partitions: EFI System (100MB), MSR (16MB), Primary NTFS (476GB), and Recovery (500MB).');
    setTimeout(() => setPartitionActionMessage(null), 4000);
  };

  const handleFinishOOBE = () => {
    setPhase(8);
    api.logAction(studentId, sessionId, 'Completed Interactive Windows OS Installation & Partitioning Simulator');
    api.saveGameResult({
      student_id: studentId,
      session_id: sessionId,
      game_name: 'OS Installation Simulator',
      start_time: new Date(Date.now() - 180000).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 180,
      score: 100,
      level: 1,
      completed: true,
      extra_stats: {
        targetOS: 'Windows 11 Pro 64-bit',
        partitionScheme: 'GPT/UEFI',
        driverLoaded: driverLoaded
      }
    });
  };

  const toggleDriver = (id: string) => {
    setDriverSteps(prev => prev.map(step => step.id === id ? { ...step, installed: !step.installed } : step));
  };

  // Media Troubleshooting Scenarios
  const mediaIssues = [
    {
      id: 0,
      title: 'FAT32 4GB File Size Limit ("install.wim is too large")',
      cause: 'Modern Windows 10/11 ISOs contain an `install.wim` file larger than 4.5 GB. The standard FAT32 file system cannot store any single file exceeding 4 GB (4,294,967,295 bytes).',
      solution: 'Use Rufus with UEFI (non CSM) target and NTFS partition scheme with Rufus UEFI bootloader, or split the WIM file into multiple smaller `.swm` files using the DISM command: `dism /Split-Image /ImageFile:install.wim /SWMFile:install.swm /FileSize:4000`.',
      symptom: 'File copy fails or USB creation tool throws "The parameter is incorrect" or "Disk full" error even with 32GB free space.'
    },
    {
      id: 1,
      title: 'Missing NVMe Storage Controller ("We couldn\'t find any drives")',
      cause: '11th, 12th, 13th, and 14th Gen Intel platforms use Intel VMD (Volume Management Device) or RAID architecture. Default Windows media lacks the specific Intel Rapid Storage Technology (RST) driver for this controller.',
      solution: 'Download the Intel RST VMD driver from the motherboard/laptop support website, extract the `.inf`, `.sys`, and `.cat` files onto a subfolder on your installation USB, and click "Load driver" in Windows Setup.',
      symptom: 'Drive selection screen is completely blank during clean install despite NVMe SSD being recognized in BIOS.'
    },
    {
      id: 2,
      title: 'Secure Boot Violation ("Selected boot device failed verification")',
      cause: 'The USB bootloader lacks a valid Microsoft Third-Party UEFI Certificate Authority (CA) digital signature, or the bootloader was created with an outdated tool rejected by modern motherboard Secure Boot DBX revocation lists.',
      solution: 'Recreate the installation USB with the official Windows Media Creation Tool or Rufus 4.x+ with modern UEFI signatures. If using customized recovery tools, temporarily set Secure Boot to "Standard" or enable "Microsoft 3rd Party UEFI CA" in BIOS.',
      symptom: 'Red warning banner on screen right after selecting USB in boot menu; PC refuses to execute EFI bootloader.'
    },
    {
      id: 3,
      title: 'Error 0x8007025D ("Windows cannot install required files")',
      cause: 'Memory buffer corruptions during decompression. Caused by either a physically failing USB flash drive, a corrupted ISO download (checksum mismatch), or faulty RAM in the target PC.',
      solution: '1. Verify SHA-256 hash of ISO download against official Microsoft hash.\n2. Recreate USB media using a high-quality USB 3.0 flash drive.\n3. Test RAM with MemTest86 or test with 1 RAM stick isolated.',
      symptom: 'Setup stops abruptly at 15% to 75% during "Getting files ready for installation".'
    },
    {
      id: 4,
      title: 'MBR vs GPT Partition Mismatch ("Windows cannot be installed to this disk")',
      cause: 'System booted into UEFI mode, but the target storage drive is formatted with legacy MBR (Master Boot Record), or system booted into Legacy CSM mode while the drive is formatted with GPT (GUID Partition Table).',
      solution: 'For modern UEFI systems, convert disk to GPT: In Windows Setup, press Shift+F10 to launch Command Prompt, run `diskpart` -> `list disk` -> `select disk 0` -> `clean` -> `convert gpt` -> `exit`.',
      symptom: 'Yellow warning text: "The selected disk has an MBR partition table. On EFI systems, Windows can only be installed to GPT disks."'
    },
    {
      id: 5,
      title: '"This PC can\'t run Windows 11" Hardware Check Rejection',
      cause: 'System does not meet Windows 11 firmware requirements (TPM 2.0 disabled, Secure Boot disabled in BIOS, or unsupported legacy CPU).',
      solution: '1. Enable Intel PTT (Platform Trust Technology) or AMD fTPM in BIOS.\n2. Enable UEFI Mode and Secure Boot.\n3. For educational testbenches without TPM: Press Shift+F10, open `regedit`, navigate to `HKEY_LOCAL_MACHINE\\SYSTEM\\Setup`, create key `LabConfig`, and add DWORD `BypassTPMCheck`=1 and `BypassSecureBootCheck`=1.',
      symptom: 'Setup halts immediately after selecting Windows 11 edition before reaching partition manager.'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[750px] animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Games & Simulators Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                Windows OS Installation &amp; Media Diagnostics Lab
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                Item #14 &amp; #5 Practice
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive clean OS deployment simulator, GPT/UEFI partition manager, and installation-media troubleshooting.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('INSTALLATION_SIMULATOR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'INSTALLATION_SIMULATOR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            OS Setup Simulator
          </button>
          <button
            onClick={() => setActiveTab('MEDIA_TROUBLESHOOTING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'MEDIA_TROUBLESHOOTING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Media Troubleshooting Guide
          </button>
          <button
            onClick={() => setActiveTab('DRIVER_DEPLOYMENT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'DRIVER_DEPLOYMENT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Post-Install Driver Order
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE WINDOWS OS SETUP SIMULATOR */}
      {activeTab === 'INSTALLATION_SIMULATOR' && (
        <div className="flex-1 p-4 sm:p-6 flex flex-col bg-slate-950 text-slate-100 font-sans relative">
          
          {/* Top Progress Step Indicator */}
          <div className="mb-4 bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-2 overflow-x-auto text-xs">
            {[
              { id: 0, label: '1. Boot Media' },
              { id: 1, label: '2. Language & Time' },
              { id: 2, label: '3. Edition & Key' },
              { id: 3, label: '4. License Terms' },
              { id: 4, label: '5. Setup Type' },
              { id: 5, label: '6. Partition Drive' },
              { id: 6, label: '7. Installing' },
              { id: 7, label: '8. OOBE Setup' },
              { id: 8, label: '9. Ready' }
            ].map((st) => (
              <div
                key={st.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                  phase === st.id
                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400'
                    : phase > st.id
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                {phase > st.id && <Check className="w-3.5 h-3.5" />}
                <span>{st.label}</span>
              </div>
            ))}
            <button
              onClick={handleRestartSimulator}
              className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 shrink-0 ml-auto cursor-pointer"
              title="Reset Simulator from Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* SIMULATED WINDOWS SETUP WINDOW */}
          <div className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col min-h-[480px]">
            
            {/* Windows Setup Window Chrome Header */}
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm flex items-center justify-center text-[9px] font-black text-white">
                  ⊞
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Windows Setup (UEFI 64-bit Architecture)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Target: Disk 0 (NVMe SSD)</span>
                <span>•</span>
                <span className="text-emerald-400">UEFI Boot Mode</span>
              </div>
            </div>

            {/* WINDOW BODY CONTENT */}
            <div className="flex-1 p-6 flex flex-col justify-center max-w-2xl mx-auto w-full">
              
              {/* PHASE 0: BOOT SELECTION & MEDIA VERIFICATION */}
              {phase === 0 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <div className="inline-flex p-3 bg-blue-500/10 text-blue-400 rounded-full mb-1">
                      <Usb className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-white">UEFI Boot Device Selection</h2>
                    <p className="text-xs text-slate-400">
                      The computer was powered on while pressing <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">F12</kbd> (Boot Menu). Choose the installation medium:
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => setPhase(1)}
                      className="w-full p-3.5 bg-slate-800/90 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-between group transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600/20 text-blue-400 rounded-md flex items-center justify-center">
                          <Usb className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-blue-300">
                            UEFI: SanDisk Extreme Pro 32GB (Partition 1)
                          </div>
                          <div className="text-xs text-slate-400">
                            GPT FAT32 Bootloader • Windows 11 Official ISO • Valid Digital Signature
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                        Boot Media →
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        alert('Error: The internal NVMe drive is currently blank (unformatted). Please select the UEFI USB Installation Media to deploy Windows.');
                      }}
                      className="w-full p-3.5 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-left opacity-70 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-700/40 text-slate-400 rounded-md flex items-center justify-center">
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-300">
                            Windows Boot Manager (Samsung 990 Pro 1TB NVMe)
                          </div>
                          <div className="text-xs text-slate-500">
                            No active OS partition found • Blank target disk
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">Unconfigured</span>
                    </button>
                  </div>

                  <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-lg text-xs text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                    <div>
                      <strong>Technical Note (Item #5):</strong> Always ensure you select the item prefixed with <strong>"UEFI:"</strong> rather than legacy BIOS (CSM) to ensure Windows creates a modern GPT partition table with Secure Boot and TPM 2.0 capability.
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 1: LANGUAGE & KEYBOARD */}
              {phase === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white">Select Language, Time, and Keyboard</h2>
                    <p className="text-xs text-slate-400">
                      Configure regional localization for the initial Windows setup environment.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Language to install:</label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option>English (United States)</option>
                        <option>English (Philippines)</option>
                        <option>English (United Kingdom)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Time and currency format:</label>
                      <select
                        value={selectedTimeFormat}
                        onChange={(e) => setSelectedTimeFormat(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option>English (Philippines) - PHP (₱)</option>
                        <option>English (United States) - USD ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Keyboard or input method:</label>
                      <select
                        value={selectedKeyboard}
                        onChange={(e) => setSelectedKeyboard(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        <option>US Standard QWERTY</option>
                        <option>United Kingdom Extended</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setPhase(0)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setPhase(2)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 2: INSTALL NOW & PRODUCT KEY */}
              {phase === 2 && (
                <div className="space-y-5 text-center animate-in fade-in py-4">
                  <h2 className="text-xl font-black text-white">Windows 11 Setup</h2>
                  <p className="text-xs text-slate-400">
                    Click "Install Now" to begin deploying files onto your storage subsystem.
                  </p>

                  <div className="py-6">
                    <button
                      onClick={() => setPhase(3)}
                      className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      Install Now
                    </button>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-left text-xs text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Target Operating System Edition:</span>
                      <select
                        value={selectedEdition}
                        onChange={(e) => setSelectedEdition(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-blue-300 text-xs rounded px-2 py-1"
                      >
                        <option>Windows 11 Pro 64-bit</option>
                        <option>Windows 11 Home 64-bit</option>
                        <option>Windows 11 Education 64-bit</option>
                        <option>Windows 11 Enterprise 64-bit</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setProductKeyChoice('SKIP')}
                        className={`text-[11px] underline cursor-pointer ${
                          productKeyChoice === 'SKIP' ? 'text-blue-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        I don't have a product key (Activate with Digital License later)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 3: LICENSE TERMS */}
              {phase === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-slate-800 pb-2">
                    <h2 className="text-base font-bold text-white">Applicable Notices and License Terms</h2>
                    <p className="text-xs text-slate-400">
                      MICROSOFT SOFTWARE LICENSE TERMS - WINDOWS OPERATING SYSTEM
                    </p>
                  </div>

                  <div className="h-44 overflow-y-auto bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-400 space-y-2 font-mono">
                    <p>
                      1. APPLICABILITY. These license terms apply to the Windows software that was preinstalled on your device, or acquired from a retailer and downloaded or streamed by you.
                    </p>
                    <p>
                      2. INSTALLATION AND USE RIGHTS. License is granted for installation on one licensed computer. You may use this software strictly in compliance with all relevant technical hardware prerequisites (including TPM 2.0 and UEFI Secure Boot).
                    </p>
                    <p>
                      3. PRIVACY &amp; DATA TELEMETRY. Windows utilizes telemetry to download security definitions, device drivers, and cumulative quality updates.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="license-agree"
                      checked={licenseAccepted}
                      onChange={(e) => setLicenseAccepted(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="license-agree" className="text-xs text-slate-200 cursor-pointer select-none">
                      I accept the Microsoft Software License Terms
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setPhase(2)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      disabled={!licenseAccepted}
                      onClick={() => setPhase(4)}
                      className={`px-6 py-2 text-xs font-bold rounded transition-all cursor-pointer ${
                        licenseAccepted
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 4: INSTALLATION TYPE */}
              {phase === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-b border-slate-800 pb-2">
                    <h2 className="text-base font-bold text-white">Which type of installation do you want?</h2>
                    <p className="text-xs text-slate-400">
                      Choose between upgrading an existing OS or performing a clean, pristine installation.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        alert('Upgrade option is only available when starting setup from within a running Windows desktop session. For a clean PC build or bare-metal drive, choose "Custom: Install Windows only".');
                      }}
                      className="w-full p-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left flex items-start gap-3 opacity-60 cursor-pointer"
                    >
                      <div className="p-2 bg-slate-700 text-slate-300 rounded">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-300">
                          Upgrade: Install Windows and keep files, settings, and applications
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Files and settings are preserved. Available only when an existing valid Windows version is detected.
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPhase(5)}
                      className="w-full p-4 bg-blue-950/40 hover:bg-blue-900/50 border-2 border-blue-500/80 rounded-lg text-left flex items-start gap-3 group transition-all cursor-pointer"
                    >
                      <div className="p-2 bg-blue-600 text-white rounded">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 flex items-center gap-2">
                          <span>Custom: Install Windows only (advanced)</span>
                          <span className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded font-mono">Recommended for Technicians</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Pristine clean installation. Allows you to partition, format, delete, or load custom storage controller drivers.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 5: DISK PARTITION MANAGER (ITEM #14 & #5 CORE) */}
              {phase === 5 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white">Where do you want to install Windows?</h2>
                      <p className="text-xs text-slate-400">
                        Select a partition or configure storage controller drivers.
                      </p>
                    </div>
                    {driverLoaded && (
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> Intel VMD Driver Active
                      </span>
                    )}
                  </div>

                  {partitionActionMessage && (
                    <div className="p-2 bg-blue-900/60 border border-blue-500 text-blue-200 text-xs rounded">
                      {partitionActionMessage}
                    </div>
                  )}

                  {/* Partition List Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                        <tr>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Total Size</th>
                          <th className="p-2.5">Free Space</th>
                          <th className="p-2.5">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {diskState === 'RAW_EMPTY' ? (
                          <tr
                            onClick={() => setSelectedPartition(0)}
                            className="bg-blue-900/40 text-blue-200 cursor-pointer"
                          >
                            <td className="p-2.5 flex items-center gap-2 font-mono">
                              <HardDrive className="w-4 h-4 text-blue-400" />
                              Drive 0 Unallocated Space
                            </td>
                            <td className="p-2.5 font-mono">500.0 GB</td>
                            <td className="p-2.5 font-mono">500.0 GB</td>
                            <td className="p-2.5">Raw / Unpartitioned</td>
                          </tr>
                        ) : (
                          <>
                            <tr
                              onClick={() => setSelectedPartition(1)}
                              className={`cursor-pointer ${selectedPartition === 1 ? 'bg-blue-900/40 text-blue-200' : 'hover:bg-slate-900'}`}
                            >
                              <td className="p-2 font-mono pl-4">Drive 0 Partition 1: EFI System</td>
                              <td className="p-2 font-mono">100.0 MB</td>
                              <td className="p-2 font-mono">72.0 MB</td>
                              <td className="p-2 text-slate-400">System (FAT32 Boot)</td>
                            </tr>
                            <tr
                              onClick={() => setSelectedPartition(2)}
                              className={`cursor-pointer ${selectedPartition === 2 ? 'bg-blue-900/40 text-blue-200' : 'hover:bg-slate-900'}`}
                            >
                              <td className="p-2 font-mono pl-4">Drive 0 Partition 2: MSR (Reserved)</td>
                              <td className="p-2 font-mono">16.0 MB</td>
                              <td className="p-2 font-mono">16.0 MB</td>
                              <td className="p-2 text-slate-400">MSR</td>
                            </tr>
                            <tr
                              onClick={() => setSelectedPartition(3)}
                              className={`cursor-pointer font-bold ${selectedPartition === 3 ? 'bg-blue-900/50 text-white' : 'hover:bg-slate-900 text-blue-300'}`}
                            >
                              <td className="p-2 font-mono pl-4 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Drive 0 Partition 3: Primary OS
                              </td>
                              <td className="p-2 font-mono">499.3 GB</td>
                              <td className="p-2 font-mono">499.3 GB</td>
                              <td className="p-2 text-emerald-400">Primary (NTFS)</td>
                            </tr>
                            <tr
                              onClick={() => setSelectedPartition(4)}
                              className={`cursor-pointer ${selectedPartition === 4 ? 'bg-blue-900/40 text-blue-200' : 'hover:bg-slate-900'}`}
                            >
                              <td className="p-2 font-mono pl-4">Drive 0 Partition 4: Recovery</td>
                              <td className="p-2 font-mono">600.0 MB</td>
                              <td className="p-2 font-mono">120.0 MB</td>
                              <td className="p-2 text-slate-400">Recovery (WinRE)</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Disk Actions Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {diskState === 'RAW_EMPTY' ? (
                      <button
                        onClick={handleCreatePartitions}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>New (Initialize GPT Scheme)</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setDiskState('RAW_EMPTY');
                            setSelectedPartition(0);
                            setPartitionActionMessage('Partitions deleted. Drive returned to raw unallocated space.');
                            setTimeout(() => setPartitionActionMessage(null), 3000);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-red-900/40 text-red-300 rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                          <span>Delete All Partitions</span>
                        </button>
                        <button
                          onClick={() => {
                            setPartitionActionMessage('Partition 3 formatted with NTFS 4KB allocation cluster size.');
                            setTimeout(() => setPartitionActionMessage(null), 3000);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Format</span>
                        </button>
                      </>
                    )}

                    {/* Load Driver Simulation (Item #5) */}
                    <button
                      onClick={() => setShowDriverPrompt(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700 flex items-center gap-1 ml-auto cursor-pointer"
                      title="Simulate loading Intel VMD / RAID storage controller drivers"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Load Storage Driver</span>
                    </button>
                  </div>

                  {/* Driver Injection Modal/Prompt */}
                  {showDriverPrompt && (
                    <div className="p-3 bg-slate-800 border border-blue-500/80 rounded-lg text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-blue-400" />
                          Inject Storage Controller Driver (Intel VMD / RST)
                        </span>
                        <button
                          onClick={() => setShowDriverPrompt(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        When modern 11th-14th Gen Intel or AMD RAID NVMe drives do not appear in the partition manager, load the RST/VMD controller driver from USB path <code>E:\Drivers\Intel_RST_VMD\iaStorVD.inf</code>.
                      </p>
                      <button
                        onClick={handleInstallDriver}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold cursor-pointer"
                      >
                        Install iaStorVD.inf Driver
                      </button>
                    </div>
                  )}

                  {/* Navigation footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setPhase(4)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (diskState === 'RAW_EMPTY') {
                          handleCreatePartitions();
                        }
                        setPhase(6); // Begin installation
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Install to Partition 3</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 6: INSTALLING WINDOWS (PROGRESS BAR) */}
              {phase === 6 && (
                <div className="space-y-6 animate-in fade-in py-6">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-bold text-white">Installing Windows</h2>
                    <p className="text-xs text-slate-400">
                      Please wait while setup copies files and configures your system.
                    </p>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto">
                    {[
                      { label: 'Copying Windows files', target: 20 },
                      { label: `Getting files ready for installation (${installProgress}%)`, target: 70 },
                      { label: 'Installing features', target: 85 },
                      { label: 'Installing updates', target: 95 },
                      { label: 'Finishing up', target: 100 }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {installStepIndex > idx ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : installStepIndex === idx ? (
                            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                          )}
                        </div>
                        <span className={installStepIndex >= idx ? 'text-white font-medium' : 'text-slate-500'}>
                          {step.label}
                        </span>
                      </div>
                    ))}

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mt-4">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${installProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-center text-xs text-slate-400">
                    Your PC will restart automatically after completing the initial file extraction.
                  </div>
                </div>
              )}

              {/* PHASE 7: OUT-OF-BOX EXPERIENCE (OOBE) */}
              {phase === 7 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-center border-b border-slate-800 pb-3">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      Out-of-Box Experience (OOBE)
                    </span>
                    <h2 className="text-lg font-bold text-white">Let's set up your PC</h2>
                  </div>

                  <div className="space-y-3 text-xs max-w-lg mx-auto">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Is this the right country or region?</label>
                      <select
                        value={oobeRegion}
                        onChange={(e) => setOobeRegion(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs"
                      >
                        <option>Philippines</option>
                        <option>United States</option>
                        <option>Canada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Computer Device Name:</label>
                      <input
                        type="text"
                        value={oobeDeviceName}
                        onChange={(e) => setOobeDeviceName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Local Administrator Account Name:</label>
                      <input
                        type="text"
                        value={oobeUsername}
                        onChange={(e) => setOobeUsername(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs font-mono"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Technician tip: Use <code>Shift+F10</code> and type <code>oobe\bypassnro</code> to set up an offline local account without requiring a cloud Microsoft login.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-800">
                    <button
                      onClick={handleFinishOOBE}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete OOBE &amp; Launch Desktop</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 8: DESKTOP READY & SUCCESS SUMMARY */}
              {phase === 8 && (
                <div className="space-y-4 text-center animate-in zoom-in-95 py-6">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Windows OS Installation Complete!</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Congratulations! You have successfully deployed a clean UEFI/GPT installation of Windows 11 Pro onto the target NVMe drive.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="font-bold text-blue-300 border-b border-slate-700 pb-1">
                      Verified System Telemetry:
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Partition Scheme:</span>
                      <span className="font-mono text-emerald-400">GUID Partition Table (GPT)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Firmware Environment:</span>
                      <span className="font-mono text-emerald-400">UEFI + Secure Boot Active</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Storage Controller:</span>
                      <span className="font-mono text-emerald-400">NVMe PCIe Gen 4 x4</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Local Administrator:</span>
                      <span className="font-mono text-emerald-400">{oobeUsername}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('DRIVER_DEPLOYMENT')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Proceed to Driver Deployment Order →
                    </button>
                    <button
                      onClick={handleRestartSimulator}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Restart Simulation
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSTALLATION-MEDIA TROUBLESHOOTING GUIDE (ITEM #5 CORE) */}
      {activeTab === 'MEDIA_TROUBLESHOOTING' && (
        <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Usb className="w-5 h-5 text-blue-700" />
              <span>Installation-Media &amp; Bootable USB Diagnostics Guide</span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Comprehensive reference for diagnosing boot media creation errors, UEFI/CSM partition mismatches, and driver injection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left selector menu */}
            <div className="md:col-span-4 space-y-2">
              {mediaIssues.map((issue, idx) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedMediaIssue(idx)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                    selectedMediaIssue === idx
                      ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-xs'
                      : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-blue-700">Problem #{idx + 1}</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="mt-1 line-clamp-2">{issue.title}</div>
                </button>
              ))}
            </div>

            {/* Right details card */}
            <div className="md:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                  Diagnostic Case #{selectedMediaIssue + 1}
                </span>
                <h3 className="text-base font-black text-gray-900 mt-2">
                  {mediaIssues[selectedMediaIssue].title}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Observed Symptom:
                  </div>
                  <div className="text-red-800 leading-relaxed">
                    {mediaIssues[selectedMediaIssue].symptom}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    Root Cause:
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    {mediaIssues[selectedMediaIssue].cause}
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Standard Repair Solution:
                  </div>
                  <div className="text-emerald-800 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                    {mediaIssues[selectedMediaIssue].solution}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: POST-INSTALLATION DRIVER DEPLOYMENT ORDER */}
      {activeTab === 'DRIVER_DEPLOYMENT' && (
        <div className="p-4 sm:p-6 bg-slate-50 text-slate-900 space-y-6">
          <div className="border-b border-gray-200 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-700" />
                <span>Standard Post-Installation Driver Deployment Order</span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Installing hardware drivers in the correct chronological order prevents kernel instability and missing device conflicts.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-900 font-bold text-xs rounded-full">
              {driverSteps.filter(s => s.installed).length} / {driverSteps.length} Installed
            </span>
          </div>

          <div className="space-y-3">
            {driverSteps.map((step, idx) => (
              <div
                key={step.id}
                onClick={() => toggleDriver(step.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  step.installed
                    ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    step.installed ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}>
                    {step.installed ? <Check className="w-4 h-4" /> : <span className="text-xs font-mono">{idx + 1}</span>}
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${step.installed ? 'text-emerald-950' : 'text-gray-900'}`}>
                      {step.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold text-gray-700">Rationale:</span> {step.why}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full shrink-0 ${
                  step.installed
                    ? 'bg-emerald-200/80 text-emerald-900'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {step.installed ? 'Installed' : 'Click to Install'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
            <strong>Critical Technician Rule:</strong> Never install the GPU display driver or peripheral drivers before the <strong>Chipset driver</strong>. Without the Chipset driver, the OS cannot properly map PCIe bus root complexes and interrupts.
          </div>
        </div>
      )}

    </div>
  );
};
