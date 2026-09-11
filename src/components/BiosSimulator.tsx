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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-700 pb-2">
          {[
            { id: 'MAIN', label: 'Main' },
            { id: 'ADVANCED', label: 'Advanced' },
            { id: 'OVERCLOCK', label: 'Ai Tweaker (OC)' },
            { id: 'BOOT', label: 'Boot Configuration' },
            { id: 'SECURITY', label: 'Security (TPM)' },
            { id: 'EXIT', label: 'Save & Exit' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Tab Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
          
          {/* Left Setting Pane (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            
            {/* TAB 1: MAIN */}
            {activeTab === 'MAIN' && (
              <div className="space-y-4">
                <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                  System Overview &amp; Hardware Detection
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">BIOS Version</span>
                    <span className="text-white font-bold">2.24.1350 (x64 UEFI)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">Processor Type</span>
                    <span className="text-white font-bold">Intel(R) Core(TM) i7-14700K CPU @ 3.40GHz</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">Processor Speed</span>
                    <span className="text-emerald-400 font-bold">{(bios.cpuMultiplier / 10).toFixed(2)} GHz</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">Total Installed Memory</span>
                    <span className="text-white font-bold">32768 MB (32 GB DDR5-6000)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">System Language</span>
                    <span className="text-blue-400">[English (US)]</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">System Date</span>
                    <span className="text-white">{bios.systemDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-gray-400">System Time</span>
                    <span className="text-white">{bios.systemTime}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ADVANCED */}
            {activeTab === 'ADVANCED' && (
              <div className="space-y-4">
                <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                  Sub-System &amp; Controller Configuration
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 transition-colors">
                    <div>
                      <span className="text-white font-bold block">Intel Hyper-Threading Technology</span>
                      <span className="text-[10px] text-gray-400">Enables two logical processing threads per physical P-Core.</span>
                    </div>
                    <button
                      onClick={() => {
                        setBios(p => ({ ...p, hyperThreading: !p.hyperThreading }));
                        logBiosAction(`Toggled HyperThreading: ${!bios.hyperThreading ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        bios.hyperThreading ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-gray-300'
                      }`}
                    >
                      [{bios.hyperThreading ? 'Enabled' : 'Disabled'}]
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 transition-colors">
                    <div>
                      <span className="text-white font-bold block">Intel Virtualization Technology (VT-x / AMD-V)</span>
                      <span className="text-[10px] text-gray-400">Required for Virtual Machines (VirtualBox, VMware, WSL2).</span>
                    </div>
                    <button
                      onClick={() => {
                        setBios(p => ({ ...p, virtualizationVTX: !p.virtualizationVTX }));
                        logBiosAction(`Toggled Intel VT-x: ${!bios.virtualizationVTX ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        bios.virtualizationVTX ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-gray-300'
                      }`}
                    >
                      [{bios.virtualizationVTX ? 'Enabled' : 'Disabled'}]
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 transition-colors">
                    <div>
                      <span className="text-white font-bold block">SATA Mode Selection</span>
                      <span className="text-[10px] text-gray-400">Configures storage controller protocol (AHCI recommended for SSDs).</span>
                    </div>
                    <select
                      value={bios.sataMode}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setBios(p => ({ ...p, sataMode: val }));
                        logBiosAction(`Set SATA Controller Mode: ${val}`);
                      }}
                      className="bg-slate-800 text-blue-300 border border-slate-700 rounded px-2 py-1 font-bold"
                    >
                      <option value="AHCI">AHCI (Recommended)</option>
                      <option value="RAID">Intel RST / RAID</option>
                      <option value="IDE">Legacy IDE Compatibility</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OVERCLOCK / AI TWEAKER */}
            {activeTab === 'OVERCLOCK' && (
              <div className="space-y-4">
                <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                  Ai Tweaker: Frequency &amp; Voltage Tuning
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                    <div>
                      <span className="text-white font-bold block">Memory XMP (Extreme Memory Profile)</span>
                      <span className="text-[10px] text-gray-400">Overclocks RAM to manufacturer rated DDR5-6000 speed.</span>
                    </div>
                    <select
                      value={bios.xmpProfile}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setBios(p => ({ ...p, xmpProfile: val }));
                        logBiosAction(`Selected Memory XMP Profile: ${val}`);
                      }}
                      className="bg-slate-800 text-emerald-400 border border-slate-700 rounded px-2 py-1 font-bold"
                    >
                      <option value="PROFILE_1_6000">XMP I: DDR5-6000 CL30-36-36 (1.35V)</option>
                      <option value="PROFILE_2_5600">XMP II: DDR5-5600 CL36 (1.25V)</option>
                      <option value="DISABLED">Disabled (JEDEC Stock 4800MHz)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                    <div>
                      <span className="text-white font-bold block">CPU Core Ratio Multiplier</span>
                      <span className="text-[10px] text-gray-400">Base Clock 100.0 MHz x Multiplier = CPU Target Clock</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const n = Math.max(34, bios.cpuMultiplier - 1);
                          setBios(p => ({ ...p, cpuMultiplier: n }));
                          logBiosAction(`CPU Multiplier adjusted to ${n}x (${(n / 10).toFixed(1)} GHz)`);
                        }}
                        className="px-2 py-0.5 bg-slate-800 text-white rounded hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="font-bold text-yellow-400 font-mono w-12 text-center">
                        {bios.cpuMultiplier}x
                      </span>
                      <button
                        onClick={() => {
                          const n = Math.min(60, bios.cpuMultiplier + 1);
                          setBios(p => ({ ...p, cpuMultiplier: n }));
                          logBiosAction(`CPU Multiplier adjusted to ${n}x (${(n / 10).toFixed(1)} GHz)`);
                        }}
                        className="px-2 py-0.5 bg-slate-800 text-white rounded hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                    <div>
                      <span className="text-white font-bold block">CPU Core Voltage (VCore)</span>
                      <span className="text-[10px] text-gray-400">Operating voltage supplied to CPU silicon die (Caution: High voltage causes degradation).</span>
                    </div>
                    <span className="text-blue-400 font-bold font-mono">
                      {bios.vcoreVoltage.toFixed(3)} V
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BOOT CONFIGURATION */}
            {activeTab === 'BOOT' && (
              <div className="space-y-4">
                <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                  Boot Priority &amp; Startup Order
                </div>

                <p className="text-[11px] text-gray-400">
                  Use the UP and DOWN buttons to order which drive or USB installer boots first when turning on the PC.
                </p>

                <div className="space-y-2">
                  {bios.bootOrder.map((device, idx) => (
                    <div
                      key={device}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        idx === 0 ? 'bg-blue-900/40 border-blue-500 text-white' : 'bg-slate-900/60 border-slate-800 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs">{device}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleToggleBootOrder(idx, 'UP')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] cursor-pointer"
                        >
                          ▲ UP
                        </button>
                        <button
                          disabled={idx === bios.bootOrder.length - 1}
                          onClick={() => handleToggleBootOrder(idx, 'DOWN')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] cursor-pointer"
                        >
                          ▼ DOWN
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-white font-bold block">Fast Boot</span>
                    <span className="text-[10px] text-gray-400">Skips full POST diagnostic scans to accelerate Windows startup.</span>
                  </div>
                  <button
                    onClick={() => {
                      setBios(p => ({ ...p, fastBoot: !p.fastBoot }));
                      logBiosAction(`Toggled Fast Boot: ${!bios.fastBoot ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold ${
                      bios.fastBoot ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-gray-300'
                    }`}
                  >
                    [{bios.fastBoot ? 'Enabled' : 'Disabled'}]
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY */}
            {activeTab === 'SECURITY' && (
              <div className="space-y-4">
                <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                  Security, TPM 2.0 &amp; Secure Boot
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                    <div>
                      <span className="text-white font-bold block">Secure Boot (UEFI Signature Verification)</span>
                      <span className="text-[10px] text-gray-400">Blocks unauthorized rootkits and unverified bootloaders before OS launch.</span>
                    </div>
                    <button
                      onClick={() => {
                        setBios(p => ({ ...p, secureBoot: !p.secureBoot }));
                        logBiosAction(`Secure Boot toggled to: ${!bios.secureBoot ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        bios.secureBoot ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      [{bios.secureBoot ? 'Enabled' : 'Disabled'}]
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                    <div>
                      <span className="text-white font-bold block">Intel PTT / TPM 2.0 (Trusted Platform Module)</span>
                      <span className="text-[10px] text-gray-400">Cryptographic hardware security module mandatory for Windows 11 installation.</span>
                    </div>
                    <button
                      onClick={() => {
                        setBios(p => ({ ...p, tpm20Enabled: !p.tpm20Enabled }));
                        logBiosAction(`TPM 2.0 State: ${!bios.tpm20Enabled ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        bios.tpm20Enabled ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                      }`}
                    >
                      [{bios.tpm20Enabled ? 'Enabled' : 'Disabled'}]
                    </button>
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

                <div className="space-y-2">
                  <button
                    onClick={handleSaveAndReboot}
                    className="w-full text-left p-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-bold transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Save Changes &amp; Reboot (F10)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setBios(INITIAL_BIOS);
                      logBiosAction('Discarded all pending CMOS changes.');
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Discard Changes &amp; Reset Defaults (F9)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onBack}
                    className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Exit Without Saving</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Help / Status Pane (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <div className="text-blue-300 font-bold uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Contextual Item Help</span>
            </div>

            <div className="text-gray-300 leading-relaxed space-y-2">
              <p>
                {activeTab === 'MAIN' && 'Displays firmware revision numbers, physical CPU identification, installed system RAM capacity, and real-time clock telemetry.'}
                {activeTab === 'ADVANCED' && 'Control individual hardware controllers, enabling virtualization hardware acceleration or selecting storage AHCI interface mode.'}
                {activeTab === 'OVERCLOCK' && 'Unlock rated high-speed XMP profiles to run RAM beyond stock JEDEC speeds, or tune CPU multipliers for greater compute power.'}
                {activeTab === 'BOOT' && 'Select which drive device boots first. When performing fresh OS installations, move USB Installation media to position #1.'}
                {activeTab === 'SECURITY' && 'TPM 2.0 and UEFI Secure Boot protect the boot sector from low-level bootkit infections and are required by modern operating systems.'}
                {activeTab === 'EXIT' && 'Writes your modified settings into CMOS non-volatile memory and triggers hardware system reboot.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px]">
              <span className="font-bold text-gray-400 uppercase tracking-wider block">
                Navigation Hotkeys:
              </span>
              <div className="grid grid-cols-2 gap-1 text-gray-400">
                <div><strong className="text-white">← / →</strong>: Select Screen</div>
                <div><strong className="text-white">↑ / ↓</strong>: Select Item</div>
                <div><strong className="text-white">F9</strong>: Optimized Defaults</div>
                <div><strong className="text-white">F10</strong>: Save &amp; Reboot</div>
              </div>
            </div>

            {/* Current Log */}
            <div className="pt-4 border-t border-slate-800">
              <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Firmware Event Log:
              </span>
              <div className="p-2 bg-black/50 border border-slate-800 rounded text-[10px] text-emerald-400 font-mono">
                &gt; {statusLog}
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
